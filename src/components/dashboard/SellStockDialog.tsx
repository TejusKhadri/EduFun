import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SellStockDialogProps {
  open: boolean;
  onClose: () => void;
  holding: {
    id: string;
    stock_symbol: string;
    stock_name: string;
    shares: number;
    buy_price: number;
    current_price: number;
  };
  userId: string;
  onSellComplete: () => void;
}

export function SellStockDialog({ open, onClose, holding, userId, onSellComplete }: SellStockDialogProps) {
  const [sharesToSell, setSharesToSell] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSell = async () => {
    if (sharesToSell <= 0 || sharesToSell > holding.shares) {
      toast({
        title: "Invalid quantity",
        description: `Please enter a valid number of shares (1-${holding.shares})`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Calculate total amount from sale
      const totalAmount = sharesToSell * holding.current_price;

      // First, get the user's current virtual coins
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('virtual_coins')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;

      // Update user's virtual coins
      const { error: updateCoinsError } = await supabase
        .from('profiles')
        .update({ 
          virtual_coins: profile.virtual_coins + Math.round(totalAmount)
        })
        .eq('user_id', userId);

      if (updateCoinsError) throw updateCoinsError;

      // Create sell transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          stock_symbol: holding.stock_symbol,
          stock_name: holding.stock_name,
          transaction_type: 'sell',
          shares: sharesToSell,
          price: holding.current_price,
          total_amount: totalAmount
        });

      if (transactionError) throw transactionError;

      // Update or remove the portfolio holding
      if (sharesToSell === holding.shares) {
        // Sell all shares - remove the holding
        const { error: deleteError } = await supabase
          .from('portfolios')
          .delete()
          .eq('id', holding.id);

        if (deleteError) throw deleteError;
      } else {
        // Partial sale - update the shares
        const { error: updateError } = await supabase
          .from('portfolios')
          .update({ 
            shares: holding.shares - sharesToSell
          })
          .eq('id', holding.id);

        if (updateError) throw updateError;
      }

      toast({
        title: "Stock sold successfully!",
        description: `Sold ${sharesToSell} shares of ${holding.stock_name} for ${Math.round(totalAmount)} coins`,
      });

      onSellComplete();
      onClose();
    } catch (error) {
      console.error('Error selling stock:', error);
      toast({
        title: "Error selling stock",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalValue = sharesToSell * holding.current_price;
  const profit = (holding.current_price - holding.buy_price) * sharesToSell;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sell {holding.stock_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>Current holdings: {holding.shares} shares</p>
            <p>Current price: {Math.round(holding.current_price)} coins per share</p>
            <p>Your average buy price: {Math.round(holding.buy_price)} coins per share</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shares">Number of shares to sell</Label>
            <Input
              id="shares"
              type="number"
              min="1"
              max={holding.shares}
              value={sharesToSell}
              onChange={(e) => setSharesToSell(parseInt(e.target.value) || 0)}
              placeholder="Enter number of shares"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Total value:</span>
              <span className="font-semibold">{Math.round(totalValue)} coins</span>
            </div>
            <div className="flex justify-between">
              <span>Profit/Loss:</span>
              <span className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profit >= 0 ? '+' : ''}{Math.round(profit)} coins
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSell} 
              disabled={loading || sharesToSell <= 0 || sharesToSell > holding.shares}
              className="flex-1"
            >
              {loading ? "Selling..." : "Sell Stock"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}