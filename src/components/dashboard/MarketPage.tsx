import { useState, useEffect } from 'react';
import { useStockData } from '@/hooks/useStockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

const STOCK_DATA: StockData[] = [
  {
    symbol: 'AAPL',
    name: 'Apple',
    price: 178.29,
    change: 3.06,
    changePercent: 1.8,
    sector: 'Technology',
    description: 'Makes iPhones, iPads, and Mac computers that kids love!'
  },
  {
    symbol: 'GOOGL',
    name: 'Google',
    price: 140.87,
    change: 2.42,
    changePercent: 1.8,
    sector: 'Technology',
    description: 'The company behind Google search and YouTube!'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft',
    price: 432.09,
    change: 7.42,
    changePercent: 1.8,
    sector: 'Technology',
    description: 'Creates Xbox games and Windows computers!'
  },
  {
    symbol: 'TSLA',
    name: 'Tesla',
    price: 253.24,
    change: 4.35,
    changePercent: 1.8,
    sector: 'Technology',
    description: 'Makes cool electric cars and rockets!'
  },
  {
    symbol: 'DIS',
    name: 'Disney',
    price: 96.78,
    change: 1.66,
    changePercent: 1.8,
    sector: 'Entertainment',
    description: 'Home of Mickey Mouse, Marvel heroes, and Disney movies!'
  },
  {
    symbol: 'MCD',
    name: "McDonald's",
    price: 294.39,
    change: 5.05,
    changePercent: 1.8,
    sector: 'Food',
    description: 'The famous golden arches restaurant everyone knows!'
  },
  {
    symbol: 'NKE',
    name: 'Nike',
    price: 110.66,
    change: 1.90,
    changePercent: 1.8,
    sector: 'Sports',
    description: 'Makes the coolest sneakers and sports gear!'
  },
  {
    symbol: 'NFLX',
    name: 'Netflix',
    price: 465.22,
    change: 7.99,
    changePercent: 1.8,
    sector: 'Entertainment',
    description: 'Your favorite streaming service for movies and shows!'
  }
];

export function MarketPage({ virtualCoins, onUpdateCoins, userId }: MarketPageProps) {
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
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
        .single();

      if (existingStock) {
        // Update existing holding
        const { error } = await supabase
          .from('portfolios')
          .update({
            shares: existingStock.shares + 1,
            current_price: stock.price
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
            category: stock.sector
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
        <p className="text-muted-foreground">Choose companies to invest in with your virtual coins!</p>
      </div>

      {/* Live Market Data Badge */}
      <div className="flex items-center gap-2">
        <div className="bg-accent-green text-white px-3 py-1 rounded-full text-sm font-medium">
          Live Market Data
        </div>
        <span className="text-sm text-muted-foreground">
          Last updated: {lastUpdated}
        </span>
      </div>

      {/* Stock Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STOCK_DATA.map((stock) => (
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
                    stock.sector === 'Food' ? 'bg-green-100 text-green-700' :
                    stock.sector === 'Sports' ? 'bg-orange-100 text-orange-700' :
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
                <div className="flex items-center gap-1 text-accent-green text-sm">
                  <span>📈</span>
                  <span>+${stock.change.toFixed(2)} (+{stock.changePercent}%)</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Cost: {Math.floor(stock.price)} coins
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
                disabled={Math.floor(stock.price) > virtualCoins}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy for {Math.floor(stock.price)} coins
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}