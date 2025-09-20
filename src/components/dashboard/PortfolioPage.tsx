import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Eye, BarChart3, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PortfolioPageProps {
  userId: string;
}

interface PortfolioHolding {
  id: string;
  stock_symbol: string;
  stock_name: string;
  shares: number;
  buy_price: number;
  current_price: number;
  created_at: string;
}

interface PortfolioStats {
  currentValue: number;
  investedValue: number;
  oneDayReturns: number;
  totalReturns: number;
  totalReturnsPercent: number;
}

// Mock Indian market indices data
const MARKET_INDICES = [
  { name: 'NIFTY', value: 25327.05, change: -96.55, changePercent: -0.38 },
  { name: 'SENSEX', value: 82626.23, change: -387.73, changePercent: -0.47 },
  { name: 'BANKNIFTY', value: 55458.85, change: -268.60, changePercent: -0.48 },
];

export function PortfolioPage({ userId }: PortfolioPageProps) {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({
    currentValue: 0,
    investedValue: 0,
    oneDayReturns: 0,
    totalReturns: 0,
    totalReturnsPercent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolioData();
  }, [userId]);

  const fetchPortfolioData = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      setHoldings(data || []);
      calculatePortfolioStats(data || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePortfolioStats = (holdings: PortfolioHolding[]) => {
    let investedValue = 0;
    let currentValue = 0;

    holdings.forEach(holding => {
      investedValue += holding.shares * holding.buy_price;
      currentValue += holding.shares * holding.current_price;
    });

    const totalReturns = currentValue - investedValue;
    const totalReturnsPercent = investedValue > 0 ? (totalReturns / investedValue) * 100 : 0;
    // Calculate a more realistic 1D return based on small daily fluctuations
    const oneDayReturns = currentValue * (Math.random() * 0.02 - 0.01); // -1% to +1% daily change

    setPortfolioStats({
      currentValue,
      investedValue,
      oneDayReturns,
      totalReturns,
      totalReturnsPercent
    });
  };

  const formatCurrency = (amount: number) => {
    // For the educational app, we'll use virtual coins instead of real currency
    return `${Math.round(amount).toLocaleString()} coins`;
  };

  const formatNumber = (num: number) => {
    return Math.round(num).toLocaleString();
  };

  const getReturnColor = (returns: number) => {
    return returns >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getReturnIcon = (returns: number) => {
    return returns >= 0 ? TrendingUp : TrendingDown;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Market Indices */}
      <div className="bg-white border-b">
        <div className="flex items-center gap-8 px-6 py-3 overflow-x-auto">
          {MARKET_INDICES.map((index) => (
            <div key={index.name} className="flex items-center gap-2 whitespace-nowrap">
              <span className="font-medium text-gray-700">{index.name}</span>
              <span className="font-bold text-gray-900">{formatNumber(index.value)}</span>
              <span className={`text-sm ${index.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Holdings Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Holdings ({holdings.length})</h1>
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </div>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          <BarChart3 className="w-4 h-4" />
        </Button>
      </div>

      {/* Portfolio Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current value</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(portfolioStats.currentValue)}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1">Invested value</p>
              <p className="text-xl font-semibold text-gray-700">{formatCurrency(portfolioStats.investedValue)}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1">1D returns</p>
              <p className={`text-lg font-semibold ${getReturnColor(portfolioStats.oneDayReturns)}`}>
                {portfolioStats.oneDayReturns >= 0 ? '+' : ''}{formatCurrency(Math.abs(portfolioStats.oneDayReturns))} ({portfolioStats.currentValue > 0 ? (portfolioStats.oneDayReturns / portfolioStats.currentValue * 100).toFixed(2) : '0.00'}%)
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1">Total returns</p>
              <p className={`text-lg font-semibold ${getReturnColor(portfolioStats.totalReturns)}`}>
                {portfolioStats.totalReturns >= 0 ? '+' : ''}{formatCurrency(portfolioStats.totalReturns)} ({portfolioStats.totalReturnsPercent.toFixed(2)}%)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Holdings Table */}
      {holdings.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr className="text-left">
                    <th className="p-4 font-medium text-gray-600">
                      <div className="flex items-center gap-1">
                        Company <ChevronDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th className="p-4 font-medium text-gray-600">Chart</th>
                    <th className="p-4 font-medium text-gray-600">
                      <div className="flex items-center gap-1">
                        Market price (1D%) <ChevronDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th className="p-4 font-medium text-gray-600">
                      <div className="flex items-center gap-1">
                        Returns (%) <ChevronDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th className="p-4 font-medium text-gray-600">
                      <div className="flex items-center gap-1">
                        Current (Invested) <ChevronDown className="w-4 h-4" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding) => {
                    const currentValue = holding.shares * holding.current_price;
                    const investedValue = holding.shares * holding.buy_price;
                    const returns = currentValue - investedValue;
                    const returnsPercent = (returns / investedValue) * 100;
                    const oneDayChange = (Math.random() - 0.5) * 2; // Mock 1D change
                    const ReturnIcon = getReturnIcon(returns);

                    return (
                      <tr key={holding.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-gray-900">{holding.stock_name}</div>
                            <div className="text-sm text-gray-500">
                              {holding.shares} shares • Avg. {Math.round(holding.buy_price)} coins
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="w-16 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <div className={`text-xs ${returns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              <ReturnIcon className="w-4 h-4" />
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-gray-900">{Math.round(holding.current_price)} coins</div>
                          <div className={`text-sm ${oneDayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {oneDayChange >= 0 ? '+' : ''}{oneDayChange.toFixed(2)} ({Math.abs(oneDayChange).toFixed(2)}%)
                          </div>
                        </td>
                        <td className="p-4">
                          <div className={`font-semibold ${getReturnColor(returns)}`}>
                            {returns >= 0 ? '+' : ''}{Math.round(Math.abs(returns))} coins
                          </div>
                          <div className={`text-sm ${getReturnColor(returns)}`}>
                            {returnsPercent.toFixed(2)}%
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-gray-900">{Math.round(currentValue)} coins</div>
                          <div className="text-sm text-gray-500">{Math.round(investedValue)} coins</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No holdings yet</h3>
                <p className="text-gray-600 mb-4">Start building your portfolio by buying your first stock!</p>
                <Button className="bg-primary hover:bg-primary/90">
                  Explore Market
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}