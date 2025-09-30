import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuoteRequest {
  action: 'quote' | 'multipleQuotes' | 'search' | 'trending' | 'historical';
  symbol?: string;
  symbols?: string[];
  query?: string;
  period1?: string;
  period2?: string;
}

// Yahoo Finance API endpoints (using publicly available endpoints)
const YAHOO_API_BASE = 'https://query1.finance.yahoo.com';

async function fetchQuote(symbol: string) {
  const url = `${YAHOO_API_BASE}/v8/finance/chart/${symbol}`;
  console.log(`Fetching quote for ${symbol}`);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch quote for ${symbol}: ${response.statusText}`);
  }
  
  const data = await response.json();
  const quote = data.chart.result[0];
  const meta = quote.meta;
  
  return {
    symbol: meta.symbol,
    shortName: meta.symbol,
    longName: meta.longName || meta.symbol,
    regularMarketPrice: meta.regularMarketPrice,
    regularMarketChange: meta.regularMarketPrice - meta.chartPreviousClose,
    regularMarketChangePercent: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100,
    regularMarketDayHigh: meta.regularMarketDayHigh,
    regularMarketDayLow: meta.regularMarketDayLow,
    regularMarketOpen: meta.regularMarketOpen || meta.regularMarketPrice,
    regularMarketPreviousClose: meta.chartPreviousClose,
    regularMarketVolume: meta.regularMarketVolume || 0,
    marketCap: meta.marketCap
  };
}

async function searchSymbols(query: string) {
  const url = `${YAHOO_API_BASE}/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;
  console.log(`Searching for: ${query}`);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.quotes || [];
}

async function getTrending() {
  const url = `${YAHOO_API_BASE}/v1/finance/trending/US`;
  console.log('Fetching trending stocks');
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch trending: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.finance.result[0].quotes || [];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, symbol, symbols, query }: QuoteRequest = await req.json();
    console.log('Yahoo Finance request:', { action, symbol, symbols, query });

    let data;

    switch (action) {
      case 'quote':
        if (!symbol) {
          throw new Error('Symbol is required for quote action');
        }
        data = await fetchQuote(symbol);
        console.log(`Quote fetched for ${symbol}:`, data.regularMarketPrice);
        break;

      case 'multipleQuotes':
        if (!symbols || symbols.length === 0) {
          throw new Error('Symbols array is required for multipleQuotes action');
        }
        data = await Promise.all(
          symbols.map(async (sym) => {
            try {
              return await fetchQuote(sym);
            } catch (error) {
              console.error(`Error fetching ${sym}:`, error.message);
              return null;
            }
          })
        );
        data = data.filter(quote => quote !== null);
        console.log(`Fetched ${data.length} quotes out of ${symbols.length} requested`);
        break;

      case 'search':
        if (!query) {
          throw new Error('Query is required for search action');
        }
        const searchResults = await searchSymbols(query);
        data = searchResults.slice(0, 10);
        console.log(`Search for "${query}" returned ${data.length} results`);
        break;

      case 'trending':
        const trendingData = await getTrending();
        const trendingSymbols = trendingData.slice(0, 20).map((q: any) => q.symbol);
        
        data = await Promise.all(
          trendingSymbols.map(async (sym: string) => {
            try {
              return await fetchQuote(sym);
            } catch (error) {
              console.error(`Error fetching trending ${sym}:`, error.message);
              return null;
            }
          })
        );
        data = data.filter(quote => quote !== null);
        console.log(`Fetched ${data.length} trending stocks`);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Yahoo Finance API error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to fetch Yahoo Finance data',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
