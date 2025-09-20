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

// Comprehensive NYSE stocks for educational investing
export const NYSE_STOCKS = [
  // Technology Giants
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', description: 'Makes iPhones, iPads, and Mac computers that kids love!' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', description: 'Creates Xbox games, Windows computers, and Office!' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', description: 'The company behind Google search and YouTube!' },
  { symbol: 'META', name: 'Meta Platforms, Inc.', sector: 'Technology', description: 'The company that owns Facebook, Instagram, and WhatsApp!' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', description: 'Makes powerful computer chips for gaming and AI!' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', sector: 'E-commerce', description: 'The online store where you can buy almost anything!' },
  
  // Automotive & Transportation
  { symbol: 'TSLA', name: 'Tesla, Inc.', sector: 'Automotive', description: 'Makes cool electric cars and rockets through SpaceX!' },
  { symbol: 'F', name: 'Ford Motor Company', sector: 'Automotive', description: 'One of the oldest car companies in America!' },
  { symbol: 'GM', name: 'General Motors Company', sector: 'Automotive', description: 'Makes Chevrolet, Cadillac, and other popular cars!' },
  
  // Entertainment & Media
  { symbol: 'DIS', name: 'The Walt Disney Company', sector: 'Entertainment', description: 'Home of Mickey Mouse, Marvel heroes, and Disney movies!' },
  { symbol: 'NFLX', name: 'Netflix, Inc.', sector: 'Entertainment', description: 'Your favorite streaming service for movies and shows!' },
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Retail', description: 'The biggest retail store in America!' },
  
  // Food & Beverages
  { symbol: 'KO', name: 'The Coca-Cola Company', sector: 'Beverages', description: 'Makes the world\'s most famous soft drinks!' },
  { symbol: 'PEP', name: 'PepsiCo, Inc.', sector: 'Beverages', description: 'Makes Pepsi, Lay\'s chips, and Gatorade!' },
  { symbol: 'MCD', name: "McDonald's Corporation", sector: 'Food Service', description: 'The famous golden arches restaurant everyone knows!' },
  { symbol: 'SBUX', name: 'Starbucks Corporation', sector: 'Food Service', description: 'The popular coffee shop chain with green logo!' },
  
  // Sports & Apparel
  { symbol: 'NKE', name: 'Nike, Inc.', sector: 'Apparel', description: 'Makes the coolest sneakers and sports gear!' },
  
  // Financial Services
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial', description: 'One of the biggest banks in America!' },
  { symbol: 'BAC', name: 'Bank of America Corporation', sector: 'Financial', description: 'A major bank that helps people save money!' },
  
  // Healthcare & Pharmaceuticals
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', description: 'Makes medicines and band-aids to help people feel better!' },
  { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', description: 'Creates important medicines and vaccines!' },
  
  // Energy & Utilities
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy', description: 'One of the biggest oil and gas companies!' },
  
  // Aerospace & Defense
  { symbol: 'BA', name: 'The Boeing Company', sector: 'Aerospace', description: 'Builds airplanes that fly people around the world!' },
  
  // Consumer Goods
  { symbol: 'PG', name: 'Procter & Gamble Company', sector: 'Consumer Goods', description: 'Makes everyday products like toothpaste and shampoo!' },
  { symbol: 'UL', name: 'Unilever PLC', sector: 'Consumer Goods', description: 'Makes soap, ice cream, and other household products!' }
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
    const company = NYSE_STOCKS.find(stock => stock.symbol === symbol.toUpperCase());
    return company?.name || `${symbol.toUpperCase()} Corporation`;
  }

  private getSector(symbol: string): string {
    const company = NYSE_STOCKS.find(stock => stock.symbol === symbol.toUpperCase());
    return company?.sector || 'Technology';
  }

  getStockDescription(symbol: string): string {
    const company = NYSE_STOCKS.find(stock => stock.symbol === symbol.toUpperCase());
    return company?.description || `A great company to learn about investing with ${symbol.toUpperCase()}!`;
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
    if (!query.trim()) {
      return NYSE_STOCKS.slice(0, 12).map(stock => ({
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

    const filtered = NYSE_STOCKS.filter(stock => 
      stock.name.toLowerCase().includes(query.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.sector.toLowerCase().includes(query.toLowerCase()) ||
      stock.description.toLowerCase().includes(query.toLowerCase())
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

  // Get all NYSE stocks
  getAllNYSEStocks(): typeof NYSE_STOCKS {
    return NYSE_STOCKS;
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
    const trendingSymbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'DIS', 'NFLX', 'AMZN', 'META'];
    return this.getMultipleQuotes(trendingSymbols);
  }

  // Get stocks by sector
  async getStocksBySector(sector: string): Promise<StockQuote[]> {
    const stocksInSector = NYSE_STOCKS
      .filter(stock => stock.sector.toLowerCase() === sector.toLowerCase())
      .map(stock => stock.symbol);
    return this.getMultipleQuotes(stocksInSector);
  }
}