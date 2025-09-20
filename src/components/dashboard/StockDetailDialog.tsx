import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  MessageSquare, 
  Star, 
  ShoppingCart,
  DollarSign,
  Building2,
  Users,
  Calendar,
  Lightbulb,
  Award
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface StockDetailDialogProps {
  stock: {
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
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBuyClick: (quantity: number) => void;
  userCoins: number;
}

interface StockDiscussion {
  id: string;
  title: string;
  content: string;
  upvotes: number;
  created_at: string;
  user_id: string;
  user_profile?: {
    display_name: string;
    avatar_url: string;
  } | null;
}

export const StockDetailDialog: React.FC<StockDetailDialogProps> = ({
  stock,
  open,
  onOpenChange,
  onBuyClick,
  userCoins
}) => {
  const [quantity, setQuantity] = useState(1);
  const [stockDiscussions, setStockDiscussions] = useState<StockDiscussion[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      generateChartData();
      loadStockDiscussions();
    }
  }, [open, stock.symbol]);

  const generateChartData = () => {
    // Generate realistic-looking stock chart data
    const data = [];
    let basePrice = stock.price;
    const volatility = stock.changePercent > 0 ? 0.02 : 0.03;
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic price movement
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      basePrice = basePrice * (1 + randomChange);
      
      data.push({
        date: format(date, 'MMM dd'),
        price: parseFloat(basePrice.toFixed(2)),
        volume: Math.floor(Math.random() * 5000000) + 1000000
      });
    }
    
    // Ensure the last price matches current stock price
    data[data.length - 1].price = stock.price;
    setChartData(data);
  };

  const loadStockDiscussions = async () => {
    try {
      setLoading(true);
      
      const { data } = await supabase
        .from('discussion_posts')
        .select(`
          id,
          title,
          content,
          upvotes,
          created_at,
          user_id
        `)
        .or(`title.ilike.%${stock.symbol}%,content.ilike.%${stock.symbol}%,title.ilike.%${stock.name}%,content.ilike.%${stock.name}%`)
        .eq('category', 'stocks')
        .order('upvotes', { ascending: false })
        .limit(5);
      
      // Fetch user profiles separately to avoid relation issues
      const discussionsWithProfiles = await Promise.all(
        (data || []).map(async (discussion) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', discussion.user_id)
            .maybeSingle();
          
          return {
            ...discussion,
            user_profile: profileData
          };
        })
      );
      
      setStockDiscussions(discussionsWithProfiles);
    } catch (error) {
      console.error('Error loading discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalCost = Math.floor(stock.price * quantity);
  const canAfford = totalCost <= userCoins;

  const getSectorIcon = (sector: string) => {
    switch (sector.toLowerCase()) {
      case 'technology': return '💻';
      case 'healthcare': return '🏥';
      case 'financial': return '🏦';
      case 'consumer': return '🛍️';
      case 'energy': return '⚡';
      case 'automotive': return '🚗';
      default: return '🏢';
    }
  };

  const formatMarketCap = (marketCap: string) => {
    return `$${marketCap}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="text-2xl">{getSectorIcon(stock.sector)}</div>
            <div>
              <div className="text-xl font-bold">{stock.symbol}</div>
              <div className="text-sm text-muted-foreground font-normal">{stock.name}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Price Overview */}
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold mb-2">${stock.price.toFixed(2)}</div>
                  <div className={`flex items-center gap-2 ${
                    stock.changePercent >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {stock.changePercent >= 0 ? 
                      <TrendingUp className="h-5 w-5" /> : 
                      <TrendingDown className="h-5 w-5" />
                    }
                    <span className="text-lg font-semibold">
                      {stock.changePercent >= 0 ? '+' : ''}${stock.change.toFixed(2)} 
                      ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Badge variant="secondary" className="mb-2">
                    {getSectorIcon(stock.sector)} {stock.sector}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    Market Cap: {formatMarketCap(stock.marketCap || '0')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Volume: {(stock.volume || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="chart">📈 Chart</TabsTrigger>
              <TabsTrigger value="about">ℹ️ About</TabsTrigger>
              <TabsTrigger value="facts">⭐ Fun Facts</TabsTrigger>
              <TabsTrigger value="community">💬 Community</TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    30-Day Price Chart
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                        <Tooltip 
                          formatter={(value) => [`$${value}`, 'Price']}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="about" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Company Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {stock.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Market Cap: {formatMarketCap(stock.marketCap || '0')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Sector: {stock.sector}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Daily Volume: {(stock.volume || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Listed on NYSE</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="facts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Fun Facts About {stock.symbol}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stock.funFacts?.map((fact, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="text-2xl">
                        {index === 0 ? '🚀' : index === 1 ? '👥' : index === 2 ? '🔬' : '🌍'}
                      </div>
                      <p className="text-sm">{fact}</p>
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-center py-4">
                      No fun facts available for this stock yet!
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="community" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Community Discussions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : stockDiscussions.length > 0 ? (
                    stockDiscussions.map((discussion) => (
                      <div key={discussion.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={discussion.user_profile?.avatar_url} />
                            <AvatarFallback>
                              {discussion.user_profile?.display_name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {discussion.user_profile?.display_name || 'Anonymous'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(discussion.created_at), 'MMM d, yyyy')}
                              </span>
                            </div>
                            <h4 className="font-medium mb-1">{discussion.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {discussion.content}
                            </p>
                            <div className="flex items-center gap-1 mt-2">
                              <Star className="h-4 w-4 text-warning" />
                              <span className="text-sm">{discussion.upvotes} upvotes</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No discussions about {stock.symbol} yet. Be the first to start a conversation!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Trading Section */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Buy {stock.symbol} Shares
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Quantity</label>
                  <Input
                    type="number"
                    min="1"
                    max={Math.floor(userCoins / stock.price)}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Share Price</label>
                  <div className="text-lg font-semibold">${stock.price.toFixed(2)}</div>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Total Cost</label>
                  <div className="text-lg font-semibold">{totalCost} coins</div>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Your Balance</label>
                  <div className={`text-lg font-semibold ${canAfford ? 'text-success' : 'text-destructive'}`}>
                    {userCoins} coins
                  </div>
                </div>
              </div>

              {!canAfford && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-sm text-destructive">
                    💰 You need {totalCost - userCoins} more coins to make this purchase!
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => onBuyClick(quantity)}
                  disabled={!canAfford}
                  className="flex-1 bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Buy {quantity} Share{quantity > 1 ? 's' : ''}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="px-6"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};