import { TrendingUp, Coins, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  virtualCoins: number;
  onBuyCoins: () => void;
}

export function AppHeader({ virtualCoins, onBuyCoins }: AppHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">EduPlay Market</h1>
            <p className="text-sm text-muted-foreground">Learn investing with virtual coins!</p>
          </div>
        </div>

        {/* Virtual Coins Display */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
            <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">{virtualCoins.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">Virtual Coins</span>
              </div>
            </div>
          </div>
          
          <Button
            onClick={onBuyCoins}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Buy Coins
          </Button>
          
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}