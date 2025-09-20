import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

interface TradeConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tradeData: {
    stock: {
      symbol: string;
      name: string;
      price: number;
      changePercent: number;
      sector: string;
    };
    quantity: number;
    type: 'buy' | 'sell';
  };
  userCoins: number;
  onConfirm: () => void;
}

export const TradeConfirmationDialog: React.FC<TradeConfirmationDialogProps> = ({
  open,
  onOpenChange,
  tradeData,
  userCoins,
  onConfirm
}) => {
  const { stock, quantity, type } = tradeData;
  const totalCost = Math.floor(stock.price * quantity);
  const remainingCoins = userCoins - totalCost;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Confirm Your Trade
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trade Summary Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getSectorIcon(stock.sector)}</div>
                  <div>
                    <div className="font-bold text-lg">{stock.symbol}</div>
                    <div className="text-sm text-muted-foreground">{stock.name}</div>
                  </div>
                </div>
                <Badge variant="outline">
                  {type === 'buy' ? '📈 Buy' : '📉 Sell'}
                </Badge>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Share Price:</span>
                  <span className="font-semibold">${stock.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Quantity:</span>
                  <span className="font-semibold">{quantity} share{quantity > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="font-medium">Total Cost:</span>
                  <span className="font-bold text-primary">{totalCost} coins</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impact on Portfolio */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Portfolio Impact
              </h4>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Current Balance:</span>
                  <span className="font-medium">{userCoins.toLocaleString()} coins</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">After Purchase:</span>
                  <span className={`font-medium ${remainingCoins >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {remainingCoins.toLocaleString()} coins
                  </span>
                </div>
              </div>

              {stock.changePercent !== 0 && (
                <div className="mt-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className={`h-4 w-4 ${stock.changePercent >= 0 ? 'text-success' : 'text-destructive'}`} />
                    <span>
                      This stock is {stock.changePercent >= 0 ? 'up' : 'down'} {Math.abs(stock.changePercent).toFixed(1)}% today
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Warning for large purchases */}
          {totalCost > userCoins * 0.3 && (
            <Card className="border-warning/20 bg-warning/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-medium text-warning">Investment Reminder</div>
                    <div className="text-sm text-muted-foreground">
                      You're investing a large portion of your coins in one stock. 
                      Remember to diversify your portfolio for better results! 🌟
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confirmation Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={remainingCoins < 0}
              className="flex-1 bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70"
            >
              {remainingCoins < 0 ? '❌ Insufficient Funds' : '✅ Confirm Trade'}
            </Button>
          </div>

          {/* Two-step confirmation note */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              🛡️ This is your final confirmation. Click "Confirm Trade" to complete your purchase.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};