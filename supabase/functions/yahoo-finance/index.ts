import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import yahooFinance from "npm:yahoo-finance2@2.14.3";

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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, symbol, symbols, query, period1, period2 }: QuoteRequest = await req.json();
    console.log('Yahoo Finance request:', { action, symbol, symbols, query });

    let data;

    switch (action) {
      case 'quote':
        if (!symbol) {
          throw new Error('Symbol is required for quote action');
        }
        data = await yahooFinance.quote(symbol);
        console.log(`Quote fetched for ${symbol}:`, data.regularMarketPrice);
        break;

      case 'multipleQuotes':
        if (!symbols || symbols.length === 0) {
          throw new Error('Symbols array is required for multipleQuotes action');
        }
        data = await Promise.all(
          symbols.map(async (sym) => {
            try {
              return await yahooFinance.quote(sym);
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
        const searchResults = await yahooFinance.search(query);
        data = searchResults.quotes.slice(0, 10); // Limit to 10 results
        console.log(`Search for "${query}" returned ${data.length} results`);
        break;

      case 'trending':
        // Get trending stocks from US market
        const trendingData = await yahooFinance.trendingSymbols('US');
        const trendingSymbols = trendingData.quotes.slice(0, 20).map(q => q.symbol);
        
        // Fetch detailed quotes for trending symbols
        data = await Promise.all(
          trendingSymbols.map(async (sym) => {
            try {
              return await yahooFinance.quote(sym);
            } catch (error) {
              console.error(`Error fetching trending ${sym}:`, error.message);
              return null;
            }
          })
        );
        data = data.filter(quote => quote !== null);
        console.log(`Fetched ${data.length} trending stocks`);
        break;

      case 'historical':
        if (!symbol) {
          throw new Error('Symbol is required for historical action');
        }
        const queryOptions = {
          period1: period1 || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          period2: period2 || new Date().toISOString().split('T')[0],
        };
        data = await yahooFinance.historical(symbol, queryOptions);
        console.log(`Historical data fetched for ${symbol}: ${data.length} records`);
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
