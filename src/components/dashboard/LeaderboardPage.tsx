import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardPageProps {
  userId: string;
}

interface LeaderboardEntry {
  id: string;
  display_name: string;
  virtual_coins: number;
  total_portfolio_value: number;
  total_returns: number;
  user_group: string;
}

interface UserStats {
  id: string;
  display_name: string;
  virtual_coins: number;
  total_portfolio_value: number;
  total_returns: number;
  user_group: string;
}

export function LeaderboardPage({ userId }: LeaderboardPageProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [activeView, setActiveView] = useState<'global' | 'group'>('global');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboardData();
    fetchUserStats();
  }, [userId]);

  const fetchLeaderboardData = async () => {
    try {
      const { data, error } = await supabase.rpc('get_leaderboard_data');
      
      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      setUserStats(data || null);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  const getRankSuffix = (rank: number) => {
    const lastDigit = rank % 10;
    const lastTwoDigits = rank % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) return 'th';
    if (lastDigit === 1) return 'st';
    if (lastDigit === 2) return 'nd';
    if (lastDigit === 3) return 'rd';
    return 'th';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Leaderboard</h1>
        <p className="text-muted-foreground">See how you rank against other investors in the community!</p>
      </div>

      {/* User Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              <div>
                <h3 className="font-semibold">Your Rank</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    {userStats ? `1st` : 'Unranked'}
                  </span>
                  {userStats && (
                    <span className="text-sm opacity-80">Out of {leaderboard.length} players</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-400 text-black">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8" />
              <div>
                <h3 className="font-semibold">Group Rank</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    {userStats ? `1st` : 'Unranked'}
                  </span>
                  <span className="text-sm opacity-80">In {userStats?.user_group || 'Beginners Club'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-amber-400" />
              <div>
                <h3 className="font-semibold text-foreground">Portfolio Value</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {userStats ? `${Math.floor(userStats.total_portfolio_value || 0).toLocaleString()} coins` : '0 coins'}
                  </span>
                  {userStats && (
                    <span className={`text-sm ${(userStats.total_returns || 0) >= 0 ? 'text-accent-green' : 'text-destructive'}`}>
                      {(userStats.total_returns || 0) >= 0 ? '+' : ''}{(userStats.total_returns || 0).toFixed(1)}% return
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveView('global')}
          className={`pb-2 px-1 font-medium transition-colors ${
            activeView === 'global'
              ? 'text-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Global Leaderboard
        </button>
        <button
          onClick={() => setActiveView('group')}
          className={`pb-2 px-1 font-medium transition-colors ${
            activeView === 'group'
              ? 'text-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          My Group
        </button>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Top Investors Worldwide</h2>
            <Badge variant="secondary" className="bg-accent-green text-white">
              Live Rankings
            </Badge>
          </div>

          <div className="space-y-3">
            {leaderboard.slice(0, 10).map((entry, index) => (
              <div
                key={`${entry.display_name}-${entry.id}`}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl w-8 text-center">
                    {getRankIcon(index + 1)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{entry.display_name}</h3>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{entry.user_group || 'General'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-foreground">
                    {Math.floor(entry.total_portfolio_value || 0).toLocaleString()} coins
                  </div>
                  <div className={`text-sm flex items-center gap-1 ${
                    (entry.total_returns || 0) >= 0 ? 'text-accent-green' : 'text-destructive'
                  }`}>
                    <span>📈</span>
                    <span>{(entry.total_returns || 0) >= 0 ? '+' : ''}{(entry.total_returns || 0).toFixed(1)}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {entry.virtual_coins.toLocaleString()} coins
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}