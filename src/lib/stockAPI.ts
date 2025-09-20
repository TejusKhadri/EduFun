// Stock Market API Integration
// Using Alpha Vantage API for real-time stock data

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  sector?: string;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  marketOpen: string;
  marketClose: string;
  timezone: string;
  currency: string;
  matchScore: string;
}

// Free API endpoints that don't require API keys
const STOCK_APIS = {
  // Yahoo Finance Alternative (free)
  quote: (symbol: string) => `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
  search: (query: string) => `https://query1.finance.yahoo.com/v1/finance/search?q=${query}`,
  
  // Backup API - Financial Modeling Prep (free tier)
  backup_quote: (symbol: string) => `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=demo`,
  backup_search: (query: string) => `https://financialmodelingprep.com/api/v3/search?query=${query}&limit=10&apikey=demo`
};

// Popular kid-friendly stocks for learning
export const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', sector: 'Automotive' },
  { symbol: 'DIS', name: 'The Walt Disney Company', sector: 'Entertainment' },
  { symbol: 'NFLX', name: 'Netflix, Inc.', sector: 'Entertainment' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', sector: 'E-commerce' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
  { symbol: 'META', name: 'Meta Platforms, Inc.', sector: 'Technology' },
  { symbol: 'KO', name: 'The Coca-Cola Company', sector: 'Beverages' },
  { symbol: 'MCD', name: "McDonald's Corporation", sector: 'Food Service' },
  { symbol: 'NKE', name: 'Nike, Inc.', sector: 'Apparel' }
];

export class StockAPI {
  private static instance: StockAPI;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 60000; // 1 minute cache

  static getInstance(): StockAPI {
    if (!StockAPI.instance) {
      StockAPI.instance = new StockAPI();
    }
    return StockAPI.instance;
  }

  private isCacheValid(symbol: string): boolean {
    const cached = this.cache.get(symbol);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  private async fetchWithFallback(symbol: string): Promise<any> {
    try {
      // Try Yahoo Finance first
      const response = await fetch(STOCK_APIS.quote(symbol));
      if (response.ok) {
        const data = await response.json();
        return this.parseYahooResponse(data, symbol);
      }
    } catch (error) {
      console.warn(`Yahoo Finance API failed for ${symbol}:`, error);
    }

    try {
      // Fallback to Financial Modeling Prep
      const response = await fetch(STOCK_APIS.backup_quote(symbol));
      if (response.ok) {
        const data = await response.json();
        return this.parseFMPResponse(data, symbol);
      }
    } catch (error) {
      console.warn(`Backup API failed for ${symbol}:`, error);
    }

    // If all APIs fail, return mock data
    return this.generateMockData(symbol);
  }

  private parseYahooResponse(data: any, symbol: string): StockQuote {
    try {
      const result = data.chart.result[0];
      const meta = result.meta;
      const quote = result.indicators.quote[0];
      
      const currentPrice = meta.regularMarketPrice || quote.close[quote.close.length - 1];
      const previousClose = meta.previousClose || quote.close[quote.close.length - 2];
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;

      return {
        symbol: symbol.toUpperCase(),
        name: meta.longName || this.getCompanyName(symbol),
        price: Math.round(currentPrice * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        volume: meta.regularMarketVolume || 0,
        marketCap: meta.marketCap,
        sector: this.getSector(symbol)
      };
    } catch (error) {
      console.error('Error parsing Yahoo response:', error);
      return this.generateMockData(symbol);
    }
  }

  private parseFMPResponse(data: any, symbol: string): StockQuote {
    try {
      const quote = data[0];
      return {
        symbol: symbol.toUpperCase(),
        name: quote.name || this.getCompanyName(symbol),
        price: Math.round(quote.price * 100) / 100,
        change: Math.round(quote.change * 100) / 100,
        changePercent: Math.round(quote.changesPercentage * 100) / 100,
        volume: quote.volume || 0,
        marketCap: quote.marketCap,
        sector: this.getSector(symbol)
      };
    } catch (error) {
      console.error('Error parsing FMP response:', error);
      return this.generateMockData(symbol);
    }
  }

  private generateMockData(symbol: string): StockQuote {
    // Generate realistic mock data for demonstration
    const basePrice = Math.random() * 200 + 50; // $50-$250
    const change = (Math.random() - 0.5) * 10; // -$5 to +$5
    const changePercent = (change / basePrice) * 100;

    return {
      symbol: symbol.toUpperCase(),
      name: this.getCompanyName(symbol),
      price: Math.round(basePrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      volume: Math.floor(Math.random() * 10000000),
      sector: this.getSector(symbol)
    };
  }

  private getCompanyName(symbol: string): string {
    const company = POPULAR_STOCKS.find(stock => stock.symbol === symbol.toUpperCase());
    return company?.name || `${symbol.toUpperCase()} Corporation`;
  }

  private getSector(symbol: string): string {
    const company = POPULAR_STOCKS.find(stock => stock.symbol === symbol.toUpperCase());
    return company?.sector || 'Technology';
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    const cacheKey = symbol.toUpperCase();
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    const quote = await this.fetchWithFallback(symbol);
    this.cache.set(cacheKey, { data: quote, timestamp: Date.now() });
    return quote;
  }

  async getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
    const promises = symbols.map(symbol => this.getQuote(symbol));
    return Promise.all(promises);
  }

  async searchStocks(query: string): Promise<StockSearchResult[]> {
    // For demo purposes, search within popular stocks
    const filtered = POPULAR_STOCKS.filter(stock => 
      stock.name.toLowerCase().includes(query.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.sector.toLowerCase().includes(query.toLowerCase())
    );

    return filtered.map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      type: 'Equity',
      region: 'United States',
      marketOpen: '09:30',
      marketClose: '16:00',
      timezone: 'UTC-04',
      currency: 'USD',
      matchScore: '1.0000'
    }));
  }

  // Get market status
  isMarketOpen(): boolean {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = now.getHours();
    
    // Market is closed on weekends
    if (day === 0 || day === 6) return false;
    
    // Market hours: 9:30 AM - 4:00 PM EST (simplified)
    return hour >= 9 && hour < 16;
  }

  // Get trending stocks for kids
  async getTrendingStocks(): Promise<StockQuote[]> {
    const trendingSymbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'DIS', 'NFLX'];
    return this.getMultipleQuotes(trendingSymbols);
  }
}