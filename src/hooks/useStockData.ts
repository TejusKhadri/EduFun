import { useState, useEffect } from 'react';
import { StockAPI, StockQuote } from '@/lib/stockAPI';

export function useStockData() {
  const [stockAPI] = useState(() => StockAPI.getInstance());
  
  return {
    getQuote: (symbol: string) => stockAPI.getQuote(symbol),
    getMultipleQuotes: (symbols: string[]) => stockAPI.getMultipleQuotes(symbols),
    searchStocks: (query: string) => stockAPI.searchStocks(query),
    getTrendingStocks: () => stockAPI.getTrendingStocks(),
    isMarketOpen: () => stockAPI.isMarketOpen(),
  };
}

export function useStockQuote(symbol: string) {
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const stockAPI = useStockData();

  useEffect(() => {
    let mounted = true;

    async function fetchQuote() {
      if (!symbol) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await stockAPI.getQuote(symbol);
        if (mounted) {
          setQuote(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchQuote();
    
    // Refresh data every 30 seconds when market is open
    const interval = stockAPI.isMarketOpen() ? 30000 : 300000; // 30s or 5min
    const timer = setInterval(fetchQuote, interval);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [symbol, stockAPI]);

  return { quote, loading, error, refetch: () => stockAPI.getQuote(symbol) };
}

export function useStockSearch(query: string, enabled: boolean = true) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const stockAPI = useStockData();

  useEffect(() => {
    if (!enabled || !query || query.length < 2) {
      setResults([]);
      return;
    }

    let mounted = true;
    setLoading(true);

    stockAPI.searchStocks(query).then(data => {
      if (mounted) {
        setResults(data);
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) {
        setResults([]);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [query, enabled, stockAPI]);

  return { results, loading };
}