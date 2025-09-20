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

        {/* User Info and Actions */}
        <div className="flex items-center gap-4">
          {/* User Profile */}
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={userProfile?.avatar_url} alt="Profile picture" />
              <AvatarFallback>
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-foreground">
                {userProfile?.display_name || 'User'}
              </p>
            </div>
          </div>

          {/* Virtual Coins Display */}
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
            <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">{virtualCoins.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground hidden sm:inline">Virtual Coins</span>
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
            <span className="hidden sm:inline">Buy Coins</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onSettingsClick}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}