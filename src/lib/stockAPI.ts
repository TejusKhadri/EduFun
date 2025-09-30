// Stock Market API Integration - Yahoo Finance via Edge Function
import { supabase } from '@/integrations/supabase/client';

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  sector?: string;
  high?: number;
  low?: number;
  open?: number;
  previousClose?: number;
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

// Fortune 100 companies for educational investing
export const FORTUNE_100_STOCKS = [
  // Technology Giants
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', description: 'Makes iPhones, iPads, and Mac computers that kids love!' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', description: 'Creates Xbox games, Windows computers, and Office!' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', description: 'The company behind Google search and YouTube!' },
  { symbol: 'META', name: 'Meta Platforms, Inc.', sector: 'Technology', description: 'The company that owns Facebook, Instagram, and WhatsApp!' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', description: 'Makes powerful computer chips for gaming and AI!' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', sector: 'E-commerce', description: 'The online store where you can buy almost anything!' },
  { symbol: 'ORCL', name: 'Oracle Corporation', sector: 'Technology', description: 'Makes database software for businesses!' },
  { symbol: 'IBM', name: 'International Business Machines', sector: 'Technology', description: 'One of the oldest computer companies!' },
  { symbol: 'INTC', name: 'Intel Corporation', sector: 'Technology', description: 'Makes computer processors and chips!' },
  { symbol: 'CSCO', name: 'Cisco Systems, Inc.', sector: 'Technology', description: 'Makes networking equipment for the internet!' },
  
  // Retail & E-commerce
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Retail', description: 'The biggest retail store in America!' },
  { symbol: 'COST', name: 'Costco Wholesale Corporation', sector: 'Retail', description: 'The warehouse store where you buy in bulk!' },
  { symbol: 'HD', name: 'The Home Depot, Inc.', sector: 'Retail', description: 'The store for home improvement and tools!' },
  { symbol: 'TGT', name: 'Target Corporation', sector: 'Retail', description: 'The popular retail store with the red bullseye logo!' },
  
  // Automotive & Transportation
  { symbol: 'TSLA', name: 'Tesla, Inc.', sector: 'Automotive', description: 'Makes cool electric cars and rockets through SpaceX!' },
  { symbol: 'F', name: 'Ford Motor Company', sector: 'Automotive', description: 'One of the oldest car companies in America!' },
  { symbol: 'GM', name: 'General Motors Company', sector: 'Automotive', description: 'Makes Chevrolet, Cadillac, and other popular cars!' },
  { symbol: 'UPS', name: 'United Parcel Service, Inc.', sector: 'Transportation', description: 'The brown delivery trucks you see everywhere!' },
  { symbol: 'FDX', name: 'FedEx Corporation', sector: 'Transportation', description: 'Fast package delivery company!' },
  
  // Entertainment & Media
  { symbol: 'DIS', name: 'The Walt Disney Company', sector: 'Entertainment', description: 'Home of Mickey Mouse, Marvel heroes, and Disney movies!' },
  { symbol: 'NFLX', name: 'Netflix, Inc.', sector: 'Entertainment', description: 'Your favorite streaming service for movies and shows!' },
  { symbol: 'CMCSA', name: 'Comcast Corporation', sector: 'Media', description: 'Cable TV and internet provider!' },
  
  // Food & Beverages
  { symbol: 'KO', name: 'The Coca-Cola Company', sector: 'Beverages', description: 'Makes the world\'s most famous soft drinks!' },
  { symbol: 'PEP', name: 'PepsiCo, Inc.', sector: 'Beverages', description: 'Makes Pepsi, Lay\'s chips, and Gatorade!' },
  { symbol: 'MCD', name: "McDonald's Corporation", sector: 'Food Service', description: 'The famous golden arches restaurant everyone knows!' },
  { symbol: 'SBUX', name: 'Starbucks Corporation', sector: 'Food Service', description: 'The popular coffee shop chain with green logo!' },
  { symbol: 'KHC', name: 'The Kraft Heinz Company', sector: 'Food Products', description: 'Makes ketchup, mac and cheese, and other foods!' },
  
  // Healthcare & Pharmaceuticals
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', description: 'Makes medicines and band-aids to help people feel better!' },
  { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', description: 'Creates important medicines and vaccines!' },
  { symbol: 'UNH', name: 'UnitedHealth Group Incorporated', sector: 'Healthcare', description: 'Helps people with health insurance!' },
  { symbol: 'ABT', name: 'Abbott Laboratories', sector: 'Healthcare', description: 'Makes medical devices and health products!' },
  { symbol: 'CVS', name: 'CVS Health Corporation', sector: 'Healthcare', description: 'Pharmacy and health services company!' },
  
  // Financial Services
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial', description: 'One of the biggest banks in America!' },
  { symbol: 'BAC', name: 'Bank of America Corporation', sector: 'Financial', description: 'A major bank that helps people save money!' },
  { symbol: 'WFC', name: 'Wells Fargo & Company', sector: 'Financial', description: 'A big bank with stagecoach logo!' },
  { symbol: 'GS', name: 'The Goldman Sachs Group, Inc.', sector: 'Financial', description: 'Investment bank for big businesses!' },
  { symbol: 'MS', name: 'Morgan Stanley', sector: 'Financial', description: 'Investment and financial services company!' },
  { symbol: 'AXP', name: 'American Express Company', sector: 'Financial', description: 'Credit card and financial services company!' },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financial', description: 'Processes credit and debit card payments!' },
  { symbol: 'MA', name: 'Mastercard Incorporated', sector: 'Financial', description: 'Another major credit card payment company!' },
  
  // Energy & Utilities
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy', description: 'One of the biggest oil and gas companies!' },
  { symbol: 'CVX', name: 'Chevron Corporation', sector: 'Energy', description: 'Major oil and gas company!' },
  { symbol: 'COP', name: 'ConocoPhillips', sector: 'Energy', description: 'Oil and natural gas exploration company!' },
  
  // Aerospace & Defense
  { symbol: 'BA', name: 'The Boeing Company', sector: 'Aerospace', description: 'Builds airplanes that fly people around the world!' },
  { symbol: 'LMT', name: 'Lockheed Martin Corporation', sector: 'Aerospace', description: 'Makes aircraft and space technology!' },
  { symbol: 'RTX', name: 'Raytheon Technologies Corporation', sector: 'Aerospace', description: 'Aerospace and defense technology company!' },
  
  // Consumer Goods
  { symbol: 'PG', name: 'Procter & Gamble Company', sector: 'Consumer Goods', description: 'Makes everyday products like toothpaste and shampoo!' },
  { symbol: 'UL', name: 'Unilever PLC', sector: 'Consumer Goods', description: 'Makes soap, ice cream, and other household products!' },
  { symbol: 'CL', name: 'Colgate-Palmolive Company', sector: 'Consumer Goods', description: 'Makes toothpaste and soap!' },
  { symbol: 'KMB', name: 'Kimberly-Clark Corporation', sector: 'Consumer Goods', description: 'Makes tissues, diapers, and paper products!' },
  
  // Sports & Apparel
  { symbol: 'NKE', name: 'Nike, Inc.', sector: 'Apparel', description: 'Makes the coolest sneakers and sports gear!' },
  
  // Telecommunications
  { symbol: 'VZ', name: 'Verizon Communications Inc.', sector: 'Telecommunications', description: 'Phone and internet service provider!' },
  { symbol: 'T', name: 'AT&T Inc.', sector: 'Telecommunications', description: 'Another big phone and internet company!' },
  
  // Industrial & Manufacturing
  { symbol: 'CAT', name: 'Caterpillar Inc.', sector: 'Industrial', description: 'Makes big construction machines and tractors!' },
  { symbol: 'DE', name: 'Deere & Company', sector: 'Industrial', description: 'Makes John Deere tractors for farming!' },
  { symbol: 'GE', name: 'General Electric Company', sector: 'Industrial', description: 'Makes engines, power equipment, and appliances!' },
  { symbol: 'MMM', name: '3M Company', sector: 'Industrial', description: 'Makes tape, Post-it notes, and industrial products!' },
  
  // Real Estate & Insurance
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', sector: 'Financial', description: 'Warren Buffett\'s investment company!' },
  
  // Additional Fortune 100 Companies
  { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology', description: 'Makes Photoshop and creative software!' },
  { symbol: 'CRM', name: 'Salesforce, Inc.', sector: 'Technology', description: 'Cloud-based business software!' },
  { symbol: 'PYPL', name: 'PayPal Holdings, Inc.', sector: 'Financial', description: 'Online payment system!' },
  { symbol: 'DUK', name: 'Duke Energy Corporation', sector: 'Utilities', description: 'Electric power company!' },
  { symbol: 'SO', name: 'The Southern Company', sector: 'Utilities', description: 'Electric utility company in the South!' },
  { symbol: 'NEE', name: 'NextEra Energy, Inc.', sector: 'Utilities', description: 'Clean energy company!' }
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

  private async callEdgeFunction(body: any): Promise<any> {
    try {
      console.log('Calling Yahoo Finance edge function:', body.action);
      const { data, error } = await supabase.functions.invoke('yahoo-finance', { body });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      if (!data.success) {
        console.error('Yahoo Finance API error:', data.error);
        throw new Error(data.error || 'Unknown error from Yahoo Finance');
      }
      
      return data.data;
    } catch (error) {
      console.error('Failed to call edge function:', error);
      throw error;
    }
  }

  private parseYahooQuote(data: any): StockQuote {
    return {
      symbol: data.symbol,
      name: data.shortName || data.longName || data.symbol,
      price: data.regularMarketPrice || 0,
      change: data.regularMarketChange || 0,
      changePercent: data.regularMarketChangePercent || 0,
      high: data.regularMarketDayHigh || 0,
      low: data.regularMarketDayLow || 0,
      open: data.regularMarketOpen || 0,
      previousClose: data.regularMarketPreviousClose || 0,
      volume: data.regularMarketVolume || 0,
      marketCap: data.marketCap,
      sector: this.getSector(data.symbol)
    };
  }

  private getCompanyName(symbol: string): string {
    const company = FORTUNE_100_STOCKS.find(stock => stock.symbol === symbol.toUpperCase());
    return company?.name || `${symbol.toUpperCase()} Corporation`;
  }

  private getSector(symbol: string): string {
    const company = FORTUNE_100_STOCKS.find(stock => stock.symbol === symbol.toUpperCase());
    return company?.sector || 'Technology';
  }

  getStockDescription(symbol: string): string {
    const company = FORTUNE_100_STOCKS.find(stock => stock.symbol === symbol.toUpperCase());
    return company?.description || `A great company to learn about investing with ${symbol.toUpperCase()}!`;
  }

  getAllNYSEStocks(): typeof FORTUNE_100_STOCKS {
    return FORTUNE_100_STOCKS;
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    const cacheKey = symbol.toUpperCase();
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const data = await this.callEdgeFunction({ action: 'quote', symbol });
      const quote = this.parseYahooQuote(data);
      this.cache.set(cacheKey, { data: quote, timestamp: Date.now() });
      return quote;
    } catch (error) {
      console.error(`Failed to fetch quote for ${symbol}, using fallback data:`, error);
      // Fallback to mock data for educational purposes
      return this.getFallbackQuote(symbol);
    }
  }

  async getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
    try {
      const data = await this.callEdgeFunction({ action: 'multipleQuotes', symbols });
      return data.map((quote: any) => this.parseYahooQuote(quote));
    } catch (error) {
      console.error('Failed to fetch multiple quotes, using fallback:', error);
      // Fallback to sequential fetches
      return Promise.all(symbols.map(symbol => this.getQuote(symbol)));
    }
  }

  async searchStocks(query: string): Promise<StockSearchResult[]> {
    if (!query.trim()) {
      return FORTUNE_100_STOCKS.slice(0, 20).map(stock => ({
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

    try {
      const data = await this.callEdgeFunction({ action: 'search', query });
      return data.slice(0, 10).map((result: any) => ({
        symbol: result.symbol,
        name: result.shortname || result.longname || result.symbol,
        type: result.quoteType || result.typeDisp || 'Equity',
        region: 'United States',
        marketOpen: '09:30',
        marketClose: '16:00',
        timezone: 'UTC-04',
        currency: 'USD',
        matchScore: result.score || '1.0000'
      }));
    } catch (error) {
      console.error('Search failed, using local fallback:', error);
      // Fallback to local search in FORTUNE_100_STOCKS
      const filtered = FORTUNE_100_STOCKS.filter(stock => 
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
  }

  isMarketOpen(): boolean {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = now.getHours();
    
    // Market is closed on weekends
    if (day === 0 || day === 6) return false;
    
    // Market hours: 9:30 AM - 4:00 PM EST (simplified)
    return hour >= 9 && hour < 16;
  }

  async getTrendingStocks(): Promise<StockQuote[]> {
    try {
      const data = await this.callEdgeFunction({ action: 'trending' });
      return data.map((quote: any) => this.parseYahooQuote(quote));
    } catch (error) {
      console.error('Failed to fetch trending stocks, using fallback:', error);
      // Fallback to popular stocks
      const fallbackSymbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'DIS', 'NFLX', 'AMZN', 'META'];
      return this.getMultipleQuotes(fallbackSymbols);
    }
  }

  async getStocksBySector(sector: string): Promise<StockQuote[]> {
    const stocksInSector = FORTUNE_100_STOCKS
      .filter(stock => stock.sector.toLowerCase() === sector.toLowerCase())
      .map(stock => stock.symbol);
    return this.getMultipleQuotes(stocksInSector);
  }

  // Fallback for when API is unavailable (educational mode)
  private getFallbackQuote(symbol: string): StockQuote {
    const basePrice = Math.random() * 300 + 20;
    const change = (Math.random() - 0.5) * 8;
    const changePercent = (change / basePrice) * 100;

    return {
      symbol: symbol.toUpperCase(),
      name: this.getCompanyName(symbol),
      price: Math.round(basePrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      volume: Math.floor(Math.random() * 30000000) + 5000000,
      sector: this.getSector(symbol),
      high: Math.round((basePrice + Math.abs(change)) * 100) / 100,
      low: Math.round((basePrice - Math.abs(change)) * 100) / 100,
      open: Math.round((basePrice + (Math.random() - 0.5) * 4) * 100) / 100,
      previousClose: Math.round((basePrice - change) * 100) / 100
    };
  }
}
