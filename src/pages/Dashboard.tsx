import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Auth from './Auth';
import { AppHeader } from '@/components/dashboard/AppHeader';
import { NavigationTabs } from '@/components/dashboard/NavigationTabs';
import { MarketPage } from '@/components/dashboard/MarketPage';
import { PortfolioPage } from '@/components/dashboard/PortfolioPage';
import { LearnPage } from '@/components/dashboard/LearnPage';
import { LeaderboardPage } from '@/components/dashboard/LeaderboardPage';
import { SettingsPage } from '@/components/dashboard/SettingsPage';
import { BuyCoinsDialog } from '@/components/dashboard/BuyCoinsDialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

type TabType = 'market' | 'portfolio' | 'learn' | 'leaderboard';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('market');
  const [virtualCoins, setVirtualCoins] = useState<number>(16419);
  const [profile, setProfile] = useState<any>(null);
  const [showBuyCoinsDialog, setShowBuyCoinsDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setProfile(data);
      setVirtualCoins(data.virtual_coins || 16419);
    }
  };

  const updateVirtualCoins = async (newAmount: number) => {
    if (!user) return;
    
    setVirtualCoins(newAmount);
    
    const { error } = await supabase
      .from('profiles')
      .update({ virtual_coins: newAmount })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating virtual coins:', error);
    }
  };

  const handleBuyCoins = (coins: number, price: number) => {
    if (price === 0) {
      // Free coins
      updateVirtualCoins(virtualCoins + coins);
    } else {
      // This will be handled by Stripe integration later
      console.log(`Purchasing ${coins} coins for $${price}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!showSettings ? (
        <>
          <AppHeader 
            virtualCoins={virtualCoins} 
            onBuyCoins={() => setShowBuyCoinsDialog(true)}
            onSettingsClick={() => setShowSettings(true)}
            userProfile={profile}
          />
          
          <BuyCoinsDialog
            open={showBuyCoinsDialog}
            onOpenChange={setShowBuyCoinsDialog}
            onSelectPlan={handleBuyCoins}
          />
          
          <div className="max-w-7xl mx-auto px-6 py-8">
            <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
            
            <div className="mt-8">
              {activeTab === 'market' && (
                <MarketPage 
                  virtualCoins={virtualCoins} 
                  onUpdateCoins={updateVirtualCoins}
                  userId={user.id}
                />
              )}
              {activeTab === 'portfolio' && (
                <PortfolioPage 
                  key={`portfolio-${activeTab}`} 
                  userId={user.id} 
                />
              )}
              {activeTab === 'learn' && (
                <LearnPage 
                  onEarnCoins={(amount) => updateVirtualCoins(virtualCoins + amount)}
                  userId={user.id}
                />
              )}
              {activeTab === 'leaderboard' && (
                <LeaderboardPage userId={user.id} />
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setShowSettings(false)}
                className="flex items-center gap-2"
              >
                ← Back to Dashboard
              </Button>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 py-8">
            <SettingsPage userId={user.id} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;