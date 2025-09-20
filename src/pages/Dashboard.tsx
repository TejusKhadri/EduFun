import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Auth from './Auth';
import { AppHeader } from '@/components/dashboard/AppHeader';
import { NavigationTabs } from '@/components/dashboard/NavigationTabs';
import { MarketPage } from '@/components/dashboard/MarketPage';
import { PortfolioPage } from '@/components/dashboard/PortfolioPage';
import { LearnPage } from '@/components/dashboard/LearnPage';
import { LeaderboardPage } from '@/components/dashboard/LeaderboardPage';
import { supabase } from '@/integrations/supabase/client';

type TabType = 'market' | 'portfolio' | 'learn' | 'leaderboard';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('market');
  const [virtualCoins, setVirtualCoins] = useState<number>(16419);
  const [profile, setProfile] = useState<any>(null);

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
      <AppHeader 
        virtualCoins={virtualCoins} 
        onBuyCoins={() => updateVirtualCoins(virtualCoins + 1000)}
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
            <PortfolioPage userId={user.id} />
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
    </div>
  );
};

export default Dashboard;