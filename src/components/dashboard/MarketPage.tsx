import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Search, TrendingUp, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useStockData } from '@/hooks/useStockData';
import { StockAPI, FORTUNE_100_STOCKS } from '@/lib/stockAPI';

interface MarketPageProps {
  virtualCoins: number;
  onUpdateCoins: (newAmount: number) => void;
  userId: string;
}

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector: string;
  description: string;
}

export function MarketPage({ virtualCoins, onUpdateCoins, userId }: MarketPageProps) {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<StockData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const stockAPI = StockAPI.getInstance();

  useEffect(() => {
    loadInitialStocks();
    const updateTime = () => {
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterStocks();
  }, [stocks, searchQuery, selectedSector]);

  const loadInitialStocks = async () => {
    try {
      setLoading(true);
      // Load regular trending stocks only for main display
      const trendingQuotes = await stockAPI.getTrendingStocks();
      
      const stockData = trendingQuotes.map(quote => ({
        symbol: quote.symbol,
        name: quote.name,
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        sector: quote.sector || 'Technology',
        description: stockAPI.getStockDescription(quote.symbol)
      }));

      setStocks(stockData);
    } catch (error) {
      console.error('Error loading stocks:', error);
      // Fallback to static data
      loadFallbackStocks();
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingWithIndices = async () => {
    try {
      setLoading(true);
      // Load trending stocks with Indian market indices for trending view
      const trendingQuotes = await stockAPI.getTrendingStocks();
      
      // Add mock Indian indices data
      const indianIndices = [
        { symbol: 'NIFTY', name: 'Nifty 50', price: 25327.05, change: -96.55, changePercent: -0.38, volume: 0, sector: 'Index' },
        { symbol: 'SENSEX', name: 'Sensex', price: 82626.23, change: -387.73, changePercent: -0.47, volume: 0, sector: 'Index' },
        { symbol: 'BANKNIFTY', name: 'Bank Nifty', price: 55458.85, change: -268.60, changePercent: -0.48, volume: 0, sector: 'Index' }
      ];
      
      // Show indices first, then trending stocks
      const stockData = [
        ...indianIndices.map(index => ({
          symbol: index.symbol,
          name: index.name,
          price: index.price,
          change: index.change,
          changePercent: index.changePercent,
          sector: index.sector,
          description: `Indian stock market ${index.name} index - View only, not available for purchase`
        })),
        ...trendingQuotes.slice(0, 5).map(quote => ({
          symbol: quote.symbol,
          name: quote.name,
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          sector: quote.sector || 'Technology',
          description: stockAPI.getStockDescription(quote.symbol)
        }))
      ];

      setStocks(stockData);
    } catch (error) {
      console.error('Error loading trending stocks:', error);
      loadFallbackStocks();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackStocks = () => {
    const fallbackStocks = FORTUNE_100_STOCKS.slice(0, 8).map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      price: Math.random() * 200 + 50,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      sector: stock.sector,
      description: stock.description
    }));
    setStocks(fallbackStocks);
  };

  const searchStocks = async (query: string) => {
    if (!query.trim()) {
      await loadInitialStocks();
      return;
    }

    try {
      setLoading(true);
      const searchResults = await stockAPI.searchStocks(query);
      const searchSymbols = searchResults.slice(0, 12).map(result => result.symbol);
      const quotes = await stockAPI.getMultipleQuotes(searchSymbols);
      
      const searchedStocks = quotes.map(quote => ({
        symbol: quote.symbol,
        name: quote.name,
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        sector: quote.sector || 'Technology',
        description: stockAPI.getStockDescription(quote.symbol)
      }));

      setStocks(searchedStocks);
    } catch (error) {
      console.error('Error searching stocks:', error);
      toast.error('Search failed. Showing trending stocks.');
    } finally {
      setLoading(false);
    }
  };

  const filterStocks = () => {
    let filtered = stocks;

    if (selectedSector !== 'all') {
      filtered = filtered.filter(stock => 
        stock.sector.toLowerCase() === selectedSector.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(stock =>
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredStocks(filtered);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchStocks(query);
    }
  };

  const getSectors = () => {
    const sectors = Array.from(new Set(FORTUNE_100_STOCKS.map(stock => stock.sector)));
    return sectors.sort();
  };

  const handleBuyStock = async (stock: StockData) => {
    const costInCoins = Math.floor(stock.price);
    
    if (costInCoins > virtualCoins) {
      toast.error('Not enough virtual coins!');
      return;
    }

    try {
      // Check if user already owns this stock
      const { data: existingStock } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .eq('stock_symbol', stock.symbol)
        .maybeSingle();

      if (existingStock) {
        // Update existing holding - calculate new average price
        const newShares = existingStock.shares + 1;
        const newAvgPrice = ((existingStock.buy_price * existingStock.shares) + stock.price) / newShares;
        
        const { error } = await supabase
          .from('portfolios')
          .update({
            shares: newShares,
            buy_price: newAvgPrice,
            current_price: stock.price,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingStock.id);

        if (error) throw error;
      } else {
        // Create new holding
        const { error } = await supabase
          .from('portfolios')
          .insert({
            user_id: userId,
            stock_symbol: stock.symbol,
            stock_name: stock.name,
            shares: 1,
            buy_price: stock.price,
            current_price: stock.price,
            category: stock.sector,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      // Add transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          stock_symbol: stock.symbol,
          stock_name: stock.name,
          transaction_type: 'buy',
          shares: 1,
          price: stock.price,
          total_amount: costInCoins
        });

      // Update virtual coins
      onUpdateCoins(virtualCoins - costInCoins);
      toast.success(`Bought 1 share of ${stock.symbol} for ${costInCoins} coins!`);

    } catch (error) {
      console.error('Error buying stock:', error);
      toast.error('Failed to buy stock. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Stock Market</h1>
        <p className="text-muted-foreground">Search and invest in real NYSE companies with your virtual coins!</p>
      </div>

      {/* Search and Filter Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search stocks by name, symbol, or description..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {getSectors().map(sector => (
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => loadTrendingWithIndices()}
              className="whitespace-nowrap"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Trending
            </Button>
          </div>
        </div>

        {/* Market Status */}
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            stockAPI.isMarketOpen() 
              ? 'bg-accent-green text-white' 
              : 'bg-orange-500 text-white'
          }`}>
            {stockAPI.isMarketOpen() ? 'Market Open' : 'Market Closed'}
          </div>
          <span className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </span>
          <span className="text-sm text-muted-foreground">
            Showing {filteredStocks.length} stocks
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {/* No Results */}
      {!loading && filteredStocks.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-foreground mb-2">No stocks found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search terms or filters</p>
          <Button onClick={() => {
            setSearchQuery('');
            setSelectedSector('all');
            loadInitialStocks();
          }}>
            Show All Stocks
          </Button>
        </div>
      )}

      {/* Stock Grid */}
      {!loading && filteredStocks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStocks.map((stock) => (
            <Card key={stock.symbol} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                {/* Stock Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{stock.symbol}</h3>
                    <p className="text-sm text-muted-foreground">{stock.name}</p>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={
                      stock.sector === 'Technology' ? 'bg-blue-100 text-blue-700' :
                      stock.sector === 'Entertainment' ? 'bg-purple-100 text-purple-700' :
                      stock.sector === 'Food Service' ? 'bg-green-100 text-green-700' :
                      stock.sector === 'Apparel' ? 'bg-orange-100 text-orange-700' :
                      stock.sector === 'Automotive' ? 'bg-red-100 text-red-700' :
                      stock.sector === 'Healthcare' ? 'bg-pink-100 text-pink-700' :
                      stock.sector === 'Financial' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }
                  >
                    {stock.sector}
                  </Badge>
                </div>

                {/* Price Info */}
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-foreground">
                    ${stock.price.toFixed(2)}
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    stock.changePercent >= 0 ? 'text-accent-green' : 'text-destructive'
                  }`}>
                    <span>{stock.changePercent >= 0 ? '📈' : '📉'}</span>
                    <span>
                      {stock.changePercent >= 0 ? '+' : ''}${stock.change.toFixed(2)} 
                      ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Cost: {Math.floor(stock.price)} coins per share
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {stock.description}
                </p>

                {/* Buy Button */}
                <Button
                  onClick={() => handleBuyStock(stock)}
                  className="w-full bg-amber-400 hover:bg-amber-500 text-black font-semibold"
                  disabled={Math.floor(stock.price) > virtualCoins || stock.sector === 'Index'}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {stock.sector === 'Index' ? 'View Only' : `Buy 1 Share - ${Math.floor(stock.price)} coins`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}