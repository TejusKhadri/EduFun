import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface QuoteRequest {
  action: "quote" | "multipleQuotes" | "search" | "trending" | "historical";
  symbol?: string;
  symbols?: string[];
  query?: string;
  period1?: string;
  period2?: string;
}

const YAHOO_API_BASE = "https://query1.finance.yahoo.com";
const CACHE_TTL_MS = 60_000;
const REQUEST_TIMEOUT_MS = 8_000;
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 400;

const quoteCache = new Map<string, { data: any; timestamp: number }>();
const FALLBACK_SYMBOLS = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "META",
  "NVDA",
  "TSLA",
  "DIS",
  "NFLX",
  "JPM",
  "WMT",
  "COST",
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getCachedQuote(symbol: string) {
  const cached = quoteCache.get(symbol);
  if (!cached) return null;

  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    quoteCache.delete(symbol);
    return null;
  }

  return cached.data;
}

function setCachedQuote(symbol: string, data: any) {
  quoteCache.set(symbol, { data, timestamp: Date.now() });
}

function normalizeQuote(raw: any, symbolOverride?: string) {
  const symbol = (raw?.symbol || symbolOverride || "UNKNOWN").toUpperCase();
  const previousClose = Number(
    raw?.regularMarketPreviousClose ??
      raw?.chartPreviousClose ??
      raw?.regularMarketPrice ??
      0,
  );
  const regularMarketPrice = Number(raw?.regularMarketPrice ?? previousClose ?? 0);
  const regularMarketChange = Number(
    raw?.regularMarketChange ?? regularMarketPrice - previousClose,
  );

  const regularMarketChangePercent = Number(
    raw?.regularMarketChangePercent ??
      ((regularMarketPrice - previousClose) / (previousClose || 1)) * 100,
  );

  return {
    symbol,
    shortName: raw?.shortName || raw?.longName || symbol,
    longName: raw?.longName || raw?.shortName || symbol,
    regularMarketPrice,
    regularMarketChange,
    regularMarketChangePercent,
    regularMarketDayHigh: Number(raw?.regularMarketDayHigh ?? regularMarketPrice),
    regularMarketDayLow: Number(raw?.regularMarketDayLow ?? regularMarketPrice),
    regularMarketOpen: Number(raw?.regularMarketOpen ?? previousClose ?? regularMarketPrice),
    regularMarketPreviousClose: previousClose,
    regularMarketVolume: Number(raw?.regularMarketVolume ?? 0),
    marketCap: raw?.marketCap,
  };
}

function buildFallbackQuote(symbol: string, base: any = {}) {
  return normalizeQuote(
    {
      symbol,
      shortName: symbol,
      longName: base?.longName || symbol,
      regularMarketPrice: Number(base?.regularMarketPrice ?? 100),
      regularMarketPreviousClose: Number(base?.regularMarketPreviousClose ?? 100),
      regularMarketDayHigh: Number(base?.regularMarketDayHigh ?? 102),
      regularMarketDayLow: Number(base?.regularMarketDayLow ?? 98),
      regularMarketOpen: Number(base?.regularMarketOpen ?? 100),
      regularMarketVolume: Number(base?.regularMarketVolume ?? 0),
      marketCap: base?.marketCap,
    },
    symbol,
  );
}

async function fetchWithRetry(url: string) {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          accept: "application/json",
          "user-agent": "Mozilla/5.0 (compatible; SupabaseEdgeFunction/1.0)",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const shouldRetry = response.status === 429 || response.status >= 500;
        if (shouldRetry && attempt < MAX_RETRIES) {
          const retryAfterHeader = response.headers.get("retry-after");
          const retryAfterSeconds = retryAfterHeader
            ? Number.parseInt(retryAfterHeader, 10)
            : NaN;
          const delayMs = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
            ? retryAfterSeconds * 1000
            : BASE_RETRY_DELAY_MS * attempt;

          console.warn(`Yahoo status ${response.status}, retrying in ${delayMs}ms (attempt ${attempt}/${MAX_RETRIES})`);
          await sleep(delayMs);
          continue;
        }

        throw new Error(`Yahoo request failed (${response.status}): ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < MAX_RETRIES) {
        const delayMs = BASE_RETRY_DELAY_MS * attempt;
        console.warn(`Yahoo request error, retrying in ${delayMs}ms (attempt ${attempt}/${MAX_RETRIES}): ${lastError.message}`);
        await sleep(delayMs);
        continue;
      }
    }
  }

  throw lastError ?? new Error("Failed to fetch Yahoo data");
}

async function fetchQuotesBatch(symbols: string[]) {
  const requestedSymbols = [
    ...new Set(
      symbols
        .map((symbol) => symbol?.trim().toUpperCase())
        .filter((symbol): symbol is string => Boolean(symbol)),
    ),
  ];

  if (requestedSymbols.length === 0) {
    return [];
  }

  const resultMap = new Map<string, any>();
  const missingSymbols: string[] = [];

  for (const symbol of requestedSymbols) {
    const cached = getCachedQuote(symbol);
    if (cached) {
      resultMap.set(symbol, cached);
    } else {
      missingSymbols.push(symbol);
    }
  }

  if (missingSymbols.length > 0) {
    const url = `${YAHOO_API_BASE}/v7/finance/quote?symbols=${encodeURIComponent(
      missingSymbols.join(","),
    )}`;

    try {
      const payload = await fetchWithRetry(url);
      const rawQuotes = payload?.quoteResponse?.result ?? [];

      for (const rawQuote of rawQuotes) {
        const normalized = normalizeQuote(rawQuote);
        resultMap.set(normalized.symbol, normalized);
        setCachedQuote(normalized.symbol, normalized);
      }
    } catch (error) {
      console.error("Batch quote fetch failed:", error);
    }

    for (const symbol of missingSymbols) {
      if (!resultMap.has(symbol)) {
        const fallback = buildFallbackQuote(symbol);
        resultMap.set(symbol, fallback);
        setCachedQuote(symbol, fallback);
      }
    }
  }

  return requestedSymbols.map((symbol) => resultMap.get(symbol) ?? buildFallbackQuote(symbol));
}

async function fetchQuote(symbol: string) {
  const [quote] = await fetchQuotesBatch([symbol]);
  return quote ?? buildFallbackQuote(symbol);
}

async function searchSymbols(query: string) {
  const url = `${YAHOO_API_BASE}/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;
  console.log(`Searching for: ${query}`);

  const data = await fetchWithRetry(url);
  return data?.quotes || [];
}

async function getTrendingSymbols() {
  const url = `${YAHOO_API_BASE}/v1/finance/trending/US`;
  console.log("Fetching trending stocks");

  const data = await fetchWithRetry(url);
  return (data?.finance?.result?.[0]?.quotes || [])
    .map((quote: any) => quote?.symbol)
    .filter((symbol: string | undefined): symbol is string => Boolean(symbol));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { action, symbol, symbols, query }: QuoteRequest = body;

    console.log("Yahoo Finance request:", { action, symbol, symbols, query });

    let data: any;

    switch (action) {
      case "quote": {
        if (!symbol) {
          throw new Error("Symbol is required for quote action");
        }

        data = await fetchQuote(symbol);
        console.log(`Quote fetched for ${symbol}:`, data.regularMarketPrice);
        break;
      }

      case "multipleQuotes": {
        if (!symbols || symbols.length === 0) {
          throw new Error("Symbols array is required for multipleQuotes action");
        }

        data = await fetchQuotesBatch(symbols);
        console.log(`Fetched ${data.length} quotes out of ${symbols.length} requested`);
        break;
      }

      case "search": {
        if (!query) {
          throw new Error("Query is required for search action");
        }

        const searchResults = await searchSymbols(query);
        data = searchResults.slice(0, 10);
        console.log(`Search for "${query}" returned ${data.length} results`);
        break;
      }

      case "trending": {
        let trendingSymbols: string[] = [];

        try {
          trendingSymbols = await getTrendingSymbols();
        } catch (error) {
          console.error("Failed to fetch Yahoo trending symbols, using fallback list:", error);
        }

        if (trendingSymbols.length === 0) {
          trendingSymbols = FALLBACK_SYMBOLS;
        }

        data = await fetchQuotesBatch(trendingSymbols.slice(0, 20));
        console.log(`Fetched ${data.length} trending stocks`);
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch Yahoo Finance data";
    const status = /required|Unknown action/i.test(message) ? 400 : 500;

    console.error("Yahoo Finance API error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: message,
        details: error instanceof Error ? error.toString() : String(error),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status,
      },
    );
  }
});
