import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  ShoppingCart, 
  Search, 
  TrendingUp, 
  Filter, 
  BarChart3,
  Award,
  Lightbulb,
  DollarSign,
  Eye,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useStockData } from '@/hooks/useStockData';
import { StockAPI, FORTUNE_100_STOCKS } from '@/lib/stockAPI';
import { StockDetailDialog } from './StockDetailDialog';
import { TradeConfirmationDialog } from './TradeConfirmationDialog';
import { EducationalTipDialog } from './EducationalTipDialog';
import { format } from 'date-fns';

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
  funFacts?: string[];
  marketCap?: string;
  volume?: number;
}

interface MarketStats {
  totalGainersCount: number;
  totalLosersCount: number;
  mostActiveStock: string;
  sectorPerformance: { sector: string; performance: number }[];
}

const EDUCATIONAL_TIPS = [
  {
    title: "🎯 Diversification Tip",
    content: "Smart investors spread their money across different sectors! Try buying stocks from technology, healthcare, and consumer goods to reduce risk.",
    badge: "smart-investor"
  },
  {
    title: "📈 Buy Low, Sell High",
    content: "Look for stocks that are down but have strong companies behind them. Sometimes the best opportunities come when prices are temporarily low!",
    badge: "bargain-hunter"
  },
  {
    title: "🔍 Research First",
    content: "Always read the company description and check recent discussions before investing. Knowledge is your best tool!",
    badge: "researcher"
  },
  {
    title: "💎 Long-term Thinking",
    content: "The best investors think long-term! Don't panic if a stock goes down temporarily - focus on the company's future potential.",
    badge: "patient-investor"
  }
];

export function MarketPage({ virtualCoins, onUpdateCoins, userId }: MarketPageProps) {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<StockData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [showStockDetail, setShowStockDetail] = useState(false);
  const [showTradeConfirm, setShowTradeConfirm] = useState(false);
  const [tradeData, setTradeData] = useState<{stock: StockData, quantity: number, type: 'buy' | 'sell'} | null>(null);
  const [showEducationalTip, setShowEducationalTip] = useState(false);
  const [currentTip, setCurrentTip] = useState(EDUCATIONAL_TIPS[0]);
  const [userBadges, setUserBadges] = useState<string[]>([]);
  const { toast } = useToast();

  const stockAPI = StockAPI.getInstance();

  useEffect(() => {
    loadInitialData();
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

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadStocks(),
        loadUserBadges()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStocks = async () => {
    try {
      const trendingQuotes = await stockAPI.getTrendingStocks();
      
      const stockData = trendingQuotes.map(quote => ({
        symbol: quote.symbol,
        name: quote.name,
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        sector: quote.sector || 'Technology',
        description: stockAPI.getStockDescription(quote.symbol),
        funFacts: generateFunFacts(quote.symbol),
        marketCap: generateMarketCap(),
        volume: Math.floor(Math.random() * 10000000) + 1000000
      }));

      setStocks(stockData);
    } catch (error) {
      console.error('Error loading stocks:', error);
      loadFallbackStocks();
    }
  };

  const loadFallbackStocks = () => {
    const fallbackStocks = FORTUNE_100_STOCKS.slice(0, 12).map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      price: Math.random() * 200 + 50,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      sector: stock.sector,
      description: stock.description,
      funFacts: generateFunFacts(stock.symbol),
      marketCap: generateMarketCap(),
      volume: Math.floor(Math.random() * 10000000) + 1000000
    }));
    setStocks(fallbackStocks);
  };

  const generateFunFacts = (symbol: string): string[] => {
    const facts = [
      `${symbol} was founded by visionary entrepreneurs who started in a garage!`,
      `The company employs over 100,000 people worldwide, creating jobs for families.`,
      `${symbol} spends billions on research to create amazing new products.`,
      `The company is committed to protecting our environment and uses clean energy.`,
      `${symbol} has customers in over 190 countries around the world!`
    ];
    return facts.slice(0, 3);
  };

  const generateMarketCap = (): string => {
    const values = ['5.2B', '12.8B', '45.1B', '89.3B', '156.7B', '234.5B'];
    return values[Math.floor(Math.random() * values.length)];
  };

  const loadUserBadges = async () => {
    try {
      const { data } = await supabase
        .from('user_achievements')
        .select('achievement_type')
        .eq('user_id', userId);
      
      setUserBadges(data?.map(badge => badge.achievement_type) || []);
    } catch (error) {
      console.error('Error loading badges:', error);
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

  const getSectors = () => {
    const sectors = Array.from(new Set(stocks.map(stock => stock.sector)));
    return sectors.sort();
  };

  const handleStockClick = (stock: StockData) => {
    setSelectedStock(stock);
    setShowStockDetail(true);
  };

  const handleBuyClick = (stock: StockData, quantity: number = 1) => {
    setTradeData({ stock, quantity, type: 'buy' });
    setShowTradeConfirm(true);
    
    // Show educational tip randomly
    if (Math.random() < 0.3) {
      const randomTip = EDUCATIONAL_TIPS[Math.floor(Math.random() * EDUCATIONAL_TIPS.length)];
      setCurrentTip(randomTip);
      setTimeout(() => setShowEducationalTip(true), 1000);
    }
  };

  const confirmTrade = async () => {
    if (!tradeData) return;

    const { stock, quantity, type } = tradeData;
    const costInCoins = Math.floor(stock.price * quantity);
    
    if (type === 'buy' && costInCoins > virtualCoins) {
      toast({
        title: "Not enough coins! 💰",
        description: "You need more virtual coins to make this purchase.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (type === 'buy') {
        await processBuyTrade(stock, quantity, costInCoins);
        
        // Award badges
        await checkAndAwardTradingBadges();
        
        toast({
          title: "Trade Successful! 🎉",
          description: `Bought ${quantity} share${quantity > 1 ? 's' : ''} of ${stock.symbol} for ${costInCoins} coins!`
        });
      }

      setShowTradeConfirm(false);
      setTradeData(null);
    } catch (error) {
      console.error('Error processing trade:', error);
      toast({
        title: "Trade Failed",
        description: "Failed to process trade. Please try again.",
        variant: "destructive"
      });
    }
  };

  const processBuyTrade = async (stock: StockData, quantity: number, cost: number) => {
    // Check if user already owns this stock
    const { data: existingStock } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .eq('stock_symbol', stock.symbol)
      .maybeSingle();

    if (existingStock) {
      const newShares = existingStock.shares + quantity;
      const newAvgPrice = ((existingStock.buy_price * existingStock.shares) + (stock.price * quantity)) / newShares;
      
      await supabase
        .from('portfolios')
        .update({
          shares: newShares,
          buy_price: newAvgPrice,
          current_price: stock.price,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingStock.id);
    } else {
      await supabase
        .from('portfolios')
        .insert({
          user_id: userId,
          stock_symbol: stock.symbol,
          stock_name: stock.name,
          shares: quantity,
          buy_price: stock.price,
          current_price: stock.price,
          category: stock.sector
        });
    }

    // Add transaction record
    await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        stock_symbol: stock.symbol,
        stock_name: stock.name,
        transaction_type: 'buy',
        shares: quantity,
        price: stock.price,
        total_amount: cost
      });

    // Update virtual coins
    onUpdateCoins(virtualCoins - cost);
  };

  const checkAndAwardTradingBadges = async () => {
    // Get transaction count
    const { count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const transactionCount = count || 0;

    // Award badges based on trading activity
    const badgesToAward = [];
    
    if (transactionCount >= 1 && !userBadges.includes('first-trade')) {
      badgesToAward.push({ type: 'first-trade', name: 'First Trade' });
    }
    
    if (transactionCount >= 5 && !userBadges.includes('active-trader')) {
      badgesToAward.push({ type: 'active-trader', name: 'Active Trader' });
    }
    
    if (transactionCount >= 10 && !userBadges.includes('trading-pro')) {
      badgesToAward.push({ type: 'trading-pro', name: 'Trading Pro' });
    }

    // Award the badges
    for (const badge of badgesToAward) {
      await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_type: badge.type,
          achievement_name: badge.name
        });
    }

    if (badgesToAward.length > 0) {
      loadUserBadges(); // Refresh badges
      toast({
        title: "New Badge Earned! 🏆",
        description: `You earned: ${badgesToAward.map(b => b.name).join(', ')}`
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Stock Market Explorer
          </h1>
        </div>
        <p className="text-muted-foreground">
          Discover amazing companies and start your investment journey! 🚀
        </p>
        
        {/* Your Balance Card */}
        <Card className="max-w-sm mx-auto hover-scale bg-gradient-to-br from-primary/10 to-secondary/10">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-1">💰</div>
            <div className="text-2xl font-bold">{virtualCoins.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Your Virtual Coins</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search for amazing companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        <Select value={selectedSector} onValueChange={setSelectedSector}>
          <SelectTrigger className="w-48 h-12">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Sectors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">🌟 All Sectors</SelectItem>
            {getSectors().map(sector => (
              <SelectItem key={sector} value={sector}>
                {sector === 'Technology' ? '💻' : 
                 sector === 'Healthcare' ? '🏥' :
                 sector === 'Financial' ? '🏦' :
                 sector === 'Consumer' ? '🛍️' : '🏢'} {sector}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main Content - Full Width Stock Grid */}
      <div>
        {filteredStocks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No stocks found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or explore different sectors
              </p>
              <Button onClick={() => {
                setSearchQuery('');
                setSelectedSector('all');
              }}>
                Show All Stocks
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStocks.map((stock) => (
              <Card key={stock.symbol} className="hover-scale transition-all duration-300 hover:shadow-xl border-2 hover:border-primary/20">
                <CardContent className="p-6 space-y-4">
                  {/* Stock Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold">{stock.symbol}</h3>
                        <Badge variant="outline" className="text-xs">
                          {stock.sector === 'Technology' ? '💻' : 
                           stock.sector === 'Healthcare' ? '🏥' :
                           stock.sector === 'Financial' ? '🏦' : 
                           stock.sector === 'Consumer' ? '🛍️' :
                           stock.sector === 'Energy' ? '⚡' :
                           stock.sector === 'Automotive' ? '🚗' : '🏢'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{stock.name}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStockClick(stock)}
                      className="p-2 hover:bg-primary/10"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Price Display */}
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      ${stock.price.toFixed(2)}
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      stock.changePercent >= 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      <span>{stock.changePercent >= 0 ? '📈' : '📉'}</span>
                      <span>
                        {stock.changePercent >= 0 ? '+' : ''}${stock.change.toFixed(2)} 
                        ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      💰 Cost: {Math.floor(stock.price)} coins per share
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-muted/50 p-2 rounded">
                      <div className="text-muted-foreground">Market Cap</div>
                      <div className="font-medium">${stock.marketCap}</div>
                    </div>
                    <div className="bg-muted/50 p-2 rounded">
                      <div className="text-muted-foreground">Volume</div>
                      <div className="font-medium">{(stock.volume || 0).toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleBuyClick(stock)}
                      className="flex-1 bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70"
                      disabled={Math.floor(stock.price) > virtualCoins}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Buy
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleStockClick(stock)}
                      className="px-3 hover:bg-primary/10"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      {selectedStock && (
        <StockDetailDialog
          stock={selectedStock}
          open={showStockDetail}
          onOpenChange={setShowStockDetail}
          onBuyClick={(quantity) => handleBuyClick(selectedStock, quantity)}
          userCoins={virtualCoins}
        />
      )}

      {tradeData && (
        <TradeConfirmationDialog
          open={showTradeConfirm}
          onOpenChange={setShowTradeConfirm}
          tradeData={tradeData}
          userCoins={virtualCoins}
          onConfirm={confirmTrade}
        />
      )}

      <EducationalTipDialog
        open={showEducationalTip}
        onOpenChange={setShowEducationalTip}
        tip={currentTip}
      />
    </div>
  );
}