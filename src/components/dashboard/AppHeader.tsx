import { TrendingUp, Coins, Plus, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface AppHeaderProps {
  virtualCoins: number;
  onBuyCoins: () => void;
  onSettingsClick: () => void;
  userProfile?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export function AppHeader({ virtualCoins, onBuyCoins, onSettingsClick, userProfile }: AppHeaderProps) {
  return (
    <header className="gradient-bg-primary p-6 text-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & User */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl animate-bounce-gentle">🌟</div>
            <div>
              <h1 className="text-2xl font-fun font-bold">StockStars</h1>
              <p className="text-sm opacity-90">Learning Made Fun!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white/20 rounded-full px-4 py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userProfile?.avatar_url} />
              <AvatarFallback className="bg-white/30">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">
              {userProfile?.display_name || 'Young Investor'}
            </span>
          </div>
        </div>

        {/* Coins & Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white/20 rounded-lg px-4 py-3">
            <Coins className="h-6 w-6 text-warning animate-pulse-glow" />
            <div>
              <div className="text-2xl font-bold">{virtualCoins.toLocaleString()}</div>
              <div className="text-xs opacity-90">Virtual Coins</div>
            </div>
          </div>
          
          <Button
            onClick={onBuyCoins}
            className="bg-warning text-warning-foreground hover:bg-warning/90 font-medium"
          >
            Get More Coins! 💰
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            className="text-white hover:bg-white/20"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}