import { useStockData, useStockQuote } from '@/hooks/useStockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export function MarketOverview() {
  const stockAPI = useStockData();
  const { quote: appleQuote } = useStockQuote('AAPL');
  const { quote: teslaQuote } = useStockQuote('TSLA');
  const { quote: disneyQuote } = useStockQuote('DIS');

  const marketStatus = stockAPI.isMarketOpen();

  const quotes = [appleQuote, teslaQuote, disneyQuote].filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Live Market Data</h2>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${marketStatus ? 'bg-accent-green' : 'bg-destructive'}`}></div>
          <span className="text-sm font-medium text-foreground">
            Market {marketStatus ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quotes.map((quote) => (
          <Card key={quote.symbol} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-foreground">{quote.symbol}</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {quote.sector}
                </Badge>
              </div>
              <p className="text-sm text-foreground truncate">{quote.name}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground">
                    ${quote.price.toFixed(2)}
                  </span>
                  <div className={`flex items-center gap-1 ${
                    quote.change >= 0 ? 'text-accent-green' : 'text-destructive'
                  }`}>
                    {quote.change >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="text-sm font-semibold">
                      ${Math.abs(quote.change).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-foreground">
                  <span className={quote.change >= 0 ? 'text-accent-green' : 'text-destructive'}>
                    {quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                  </span>
                  <span className="text-muted-foreground ml-2">today</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Real-Time Market Simulation</p>
              <p className="text-sm text-foreground">
                All prices update automatically using live market data. Perfect for learning how real trading works!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}