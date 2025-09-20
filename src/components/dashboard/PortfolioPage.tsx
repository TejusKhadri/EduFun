import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PortfolioPageProps {
  userId: string;
}

interface PortfolioItem {
  id: string;
  stock_symbol: string;
  stock_name: string;
  shares: number;
  buy_price: number;
  current_price: number;
  category: string;
}

export function PortfolioPage({ userId }: PortfolioPageProps) {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [totalReturn, setTotalReturn] = useState(0);

  useEffect(() => {
    fetchPortfolio();
  }, [userId]);

  const fetchPortfolio = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      setPortfolio(data || []);
      
      // Calculate totals
      const totalVal = data?.reduce((sum, item) => sum + (item.current_price * item.shares), 0) || 0;
      const totalCost = data?.reduce((sum, item) => sum + (item.buy_price * item.shares), 0) || 0;
      const returnVal = totalCost > 0 ? ((totalVal - totalCost) / totalCost) * 100 : 0;
      
      setTotalValue(Math.floor(totalVal));
      setTotalReturn(returnVal);
      
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-foreground">My Portfolio</h1>
        <p className="text-muted-foreground">Track your investments and see how they're performing</p>
      </div>

      {/* Portfolio Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            My Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-6 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Value</p>
                <p className="text-3xl font-bold text-foreground">{totalValue.toLocaleString()} coins</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Total Return</p>
                <p className={`text-xl font-bold ${totalReturn >= 0 ? 'text-accent-green' : 'text-destructive'}`}>
                  {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Holdings */}
      {portfolio.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No investments yet. Visit the Market to start investing!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {portfolio.map((item) => {
            const currentValue = Math.floor(item.current_price * item.shares);
            const costBasis = Math.floor(item.buy_price * item.shares);
            const returnPercent = ((currentValue - costBasis) / costBasis) * 100;
            
            return (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-foreground">{item.stock_symbol}</h3>
                          <Badge variant="secondary">{item.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.shares} shares</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{currentValue} coins</p>
                      <p className={`text-sm ${returnPercent >= 0 ? 'text-accent-green' : 'text-destructive'}`}>
                        📈 {returnPercent >= 0 ? '+' : ''}{returnPercent.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}