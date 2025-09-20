import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useStockData, useStockQuote } from '@/hooks/useStockData';
import { POPULAR_STOCKS } from '@/lib/stockAPI';
import { TrendingUp, TrendingDown, Search, Coins } from 'lucide-react';

interface StockMarketProps {
  onBuyStock?: (symbol: string, shares: number, price: number) => void;
  virtualCoins?: number;
}

export function StockMarket({ onBuyStock, virtualCoins = 10000 }: StockMarketProps) {
  const [selectedStock, setSelectedStock] = useState<string>('AAPL');
  const [shares, setShares] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const stockAPI = useStockData();
  const { quote, loading, error } = useStockQuote(selectedStock);

  const handleBuyStock = () => {
    if (quote && onBuyStock && shares > 0) {
      const totalCost = quote.price * shares;
      if (totalCost <= virtualCoins) {
        onBuyStock(selectedStock, shares, quote.price);
        setShares(1);
      } else {
        alert('Not enough virtual coins!');
      }
    }
  };

  const filteredStocks = POPULAR_STOCKS.filter(stock =>
    stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCost = quote ? quote.price * shares : 0;
  const canAfford = totalCost <= virtualCoins;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Stock Market Simulator</h2>
          <p className="text-muted-foreground mt-1">
            Practice trading with real market data using virtual coins
          </p>
        </div>
        <div className="flex items-center gap-2 bg-accent-green/10 px-4 py-2 rounded-lg">
          <Coins className="w-5 h-5 text-accent-green" />
          <span className="font-bold text-foreground">${virtualCoins.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">virtual coins</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-foreground">Popular Stocks</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {filteredStocks.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => setSelectedStock(stock.symbol)}
                className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 ${
                  selectedStock === stock.symbol
                    ? 'bg-primary/10 border-primary'
                    : 'bg-card hover:bg-muted border-border'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-foreground">{stock.symbol}</p>
                    <p className="text-sm text-muted-foreground truncate">{stock.name}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {stock.sector}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Stock Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground">
              {quote?.name || 'Select a stock'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center h-40 text-destructive">
                Error loading stock data
              </div>
            )}

            {quote && !loading && (
              <div className="space-y-6">
                {/* Price Display */}
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">
                        ${quote.price.toFixed(2)}
                      </h3>
                      <p className="text-sm text-muted-foreground">Current Price</p>
                    </div>
                    <div className={`flex items-center gap-1 ${
                      quote.change >= 0 ? 'text-accent-green' : 'text-destructive'
                    }`}>
                      {quote.change >= 0 ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                      <span className="font-semibold">
                        ${Math.abs(quote.change).toFixed(2)} ({quote.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Market Status */}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    stockAPI.isMarketOpen() ? 'bg-accent-green' : 'bg-destructive'
                  }`}></div>
                  <span className="text-sm text-muted-foreground">
                    Market {stockAPI.isMarketOpen() ? 'Open' : 'Closed'}
                  </span>
                </div>

                {/* Trading Interface */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold text-foreground">Buy Stock</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1">
                        Number of Shares
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={shares}
                        onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full"
                      />
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Total Cost:</span>
                      <span className={`font-semibold ${canAfford ? 'text-foreground' : 'text-destructive'}`}>
                        ${totalCost.toFixed(2)}
                      </span>
                    </div>

                    {!canAfford && (
                      <p className="text-destructive text-sm">
                        Not enough virtual coins! You need ${(totalCost - virtualCoins).toFixed(2)} more.
                      </p>
                    )}

                    <Button
                      onClick={handleBuyStock}
                      disabled={!canAfford || shares <= 0}
                      className="w-full font-semibold"
                      variant="interactive"
                    >
                      Buy {shares} Share{shares !== 1 ? 's' : ''} for ${totalCost.toFixed(2)}
                    </Button>
                  </div>
                </div>

                {/* Stock Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Volume</p>
                    <p className="font-semibold text-foreground">
                      {quote.volume?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sector</p>
                    <p className="font-semibold text-foreground">{quote.sector}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}