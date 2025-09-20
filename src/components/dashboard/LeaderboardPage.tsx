import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Users, 
  Star, 
  Calendar, 
  Medal,
  Target,
  Flame,
  Crown,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PodiumDisplay } from './PodiumDisplay';
import { LeaderboardEntry } from './LeaderboardEntry';
import { ProgressTracker } from './ProgressTracker';
import { AchievementBadge } from './AchievementBadge';

interface LeaderboardPageProps {
  userId: string;
}

interface LeaderboardData {
  rank_position: number;
  display_name: string;
  total_portfolio_value: number;
  total_returns: number;
  user_group: string;
  avatar_url?: string;
}

interface UserStats {
  id: string;
  display_name: string;
  virtual_coins: number;
  total_portfolio_value: number;
  total_returns: number;
  user_group: string;
  avatar_url?: string;
}

interface UserRank {
  user_rank: number;
  display_name: string;
  total_portfolio_value: number;
  total_returns: number;
  user_group: string;
}

interface Achievement {
  achievement_type: string;
  achievement_name: string;
  earned_at: string;
}

interface PerformanceHistory {
  date: string;
  portfolio_value: number;
  total_returns: number;
  rank_position: number;
}

export function LeaderboardPage({ userId }: LeaderboardPageProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardData[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceHistory[]>([]);
  const [activeView, setActiveView] = useState<'global' | 'group'>('global');
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [userId]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchLeaderboardData(),
      fetchUserStats(),
      fetchUserRank(),
      fetchUserAchievements(),
      fetchPerformanceHistory(),
      checkAndAwardAchievements()
    ]);
    setLoading(false);
  };

  const fetchLeaderboardData = async () => {
    try {
      const { data, error } = await supabase.rpc('get_leaderboard_data');
      
      if (error) throw error;
      
      // Fetch avatars for leaderboard entries
      const leaderboardWithAvatars = await Promise.all(
        (data || []).map(async (entry: any) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('display_name', entry.display_name)
            .maybeSingle();
          
          return { ...entry, avatar_url: profile?.avatar_url };
        })
      );
      
      setLeaderboard(leaderboardWithAvatars);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard');
    }
  };

  const fetchUserStats = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      setUserStats(data || null);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchUserRank = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_rank', { user_uuid: userId });
      
      if (error) throw error;
      setUserRank(data?.[0] || null);
    } catch (error) {
      console.error('Error fetching user rank:', error);
    }
  };

  const fetchUserAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchPerformanceHistory = async () => {
    try {
      const daysBack = timeframe === 'week' ? 7 : 30;
      const { data, error } = await supabase.rpc('get_user_performance_history', {
        user_uuid: userId,
        days_back: daysBack
      });
      
      if (error) throw error;
      setPerformanceHistory(data || []);
    } catch (error) {
      console.error('Error fetching performance history:', error);
    }
  };

  const checkAndAwardAchievements = async () => {
    try {
      await supabase.rpc('check_and_award_achievements', { user_uuid: userId });
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
    toast.success('Leaderboard refreshed!');
  };

  const getPerformanceChange = () => {
    if (performanceHistory.length < 2) return { current: 0, previous: 0 };
    
    const current = performanceHistory[0]?.portfolio_value || 0;
    const previous = performanceHistory[1]?.portfolio_value || 0;
    
    return { current, previous };
  };

  const getTopThree = () => {
    return leaderboard.slice(0, 3).map(entry => ({
      rank: entry.rank_position,
      name: entry.display_name,
      avatar: entry.avatar_url,
      value: entry.total_portfolio_value,
      returns: entry.total_returns
    }));
  };

  const getStreakCount = () => {
    // Simple streak calculation based on positive days
    let streak = 0;
    for (const day of performanceHistory) {
      if (day.total_returns > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  const { current, previous } = getPerformanceChange();
  const streakCount = getStreakCount();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header with Fun Design */}
      <div className="text-center space-y-4 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 text-2xl animate-bounce-gentle opacity-60">🏆</div>
          <div className="absolute top-0 right-1/4 text-2xl animate-bounce-gentle opacity-60" style={{animationDelay: '0.5s'}}>⭐</div>
          <div className="absolute top-4 left-1/3 text-xl animate-bounce-gentle opacity-40" style={{animationDelay: '1s'}}>🎯</div>
          <div className="absolute top-4 right-1/3 text-xl animate-bounce-gentle opacity-40" style={{animationDelay: '1.5s'}}>🚀</div>
        </div>
        
        <h1 className="text-5xl font-bold gradient-text animate-scale-in">
          🏅 Trading Champions 🏅
        </h1>
        <p className="text-xl text-muted-foreground">
          See how you rank against other young investors!
        </p>
        
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="bg-gradient-to-r from-primary to-info hover:from-primary/90 hover:to-info/90"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing && 'animate-spin'}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Rankings'}
        </Button>
      </div>

      {/* Podium Display for Top 3 */}
      {leaderboard.length >= 3 && (
        <Card className="overflow-hidden gradient-bg-podium">
          <CardHeader className="text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2">
              <Crown className="w-6 h-6 text-yellow-300" />
              Hall of Fame
              <Crown className="w-6 h-6 text-yellow-300" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <PodiumDisplay topThree={getTopThree()} />
          </CardContent>
        </Card>
      )}

      {/* User Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Your Rank */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-info/5" />
          <CardContent className="relative p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-muted-foreground">Your Rank</h3>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-primary">
                    #{userRank?.user_rank || '?'}
                  </span>
                  {userRank && userRank.user_rank <= 10 && (
                    <Medal className="w-5 h-5 text-yellow-500 animate-bounce-gentle" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Value */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-warning/5" />
          <CardContent className="relative p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-success/10">
                <Target className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-muted-foreground">Portfolio</h3>
                <div className="text-2xl font-bold text-success">
                  ${(userStats?.total_portfolio_value || 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {(userStats?.total_returns || 0) >= 0 ? '+' : ''}{(userStats?.total_returns || 0).toFixed(1)}% returns
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-warning/10 to-destructive/5" />
          <CardContent className="relative p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-warning/10">
                <Flame className="w-6 h-6 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-muted-foreground">Hot Streak</h3>
                <div className="text-2xl font-bold text-warning">
                  {streakCount} Days
                </div>
                <div className="text-sm text-muted-foreground">
                  Profitable trading
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements Count */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-info/10 to-primary/5" />
          <CardContent className="relative p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-info/10">
                <Star className="w-6 h-6 text-info" />
              </div>
              <div>
                <h3 className="font-semibold text-muted-foreground">Badges</h3>
                <div className="text-2xl font-bold text-info">
                  {achievements.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Achievements earned
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Tracking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProgressTracker
          timeframe="week"
          currentValue={current}
          previousValue={previous}
          target={userStats ? (userStats.total_portfolio_value * 1.1) : 15000}
        />
        <ProgressTracker
          timeframe="month"
          currentValue={current}
          previousValue={previous}
          target={userStats ? (userStats.total_portfolio_value * 1.25) : 20000}
        />
      </div>

      {/* User Achievements */}
      {achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Your Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {achievements.map((achievement, index) => (
                <AchievementBadge
                  key={achievement.achievement_type}
                  type={achievement.achievement_type as any}
                  className={`animate-slide-up`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Tabs */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'global' | 'group')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Global Rankings
          </TabsTrigger>
          <TabsTrigger value="group" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            My Group
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Top Traders Worldwide
                </CardTitle>
                <Badge className="bg-success text-success-foreground animate-pulse-glow">
                  🔴 Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaderboard.slice(0, 20).map((entry, index) => (
                <LeaderboardEntry
                  key={`${entry.display_name}-${entry.rank_position}`}
                  rank={entry.rank_position}
                  name={entry.display_name}
                  avatar={entry.avatar_url}
                  value={entry.total_portfolio_value}
                  returns={entry.total_returns}
                  isCurrentUser={entry.display_name === userStats?.display_name}
                  className="animate-slide-up"
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="group" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {userStats?.user_group || 'Beginners Club'} Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaderboard
                .filter(entry => entry.user_group === userStats?.user_group)
                .slice(0, 10)
                .map((entry, index) => (
                  <LeaderboardEntry
                    key={`${entry.display_name}-${entry.rank_position}`}
                    rank={entry.rank_position}
                    name={entry.display_name}
                    avatar={entry.avatar_url}
                    value={entry.total_portfolio_value}
                    returns={entry.total_returns}
                    isCurrentUser={entry.display_name === userStats?.display_name}
                    className="animate-slide-up"
                  />
                ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Motivational Footer */}
      <Card className="bg-gradient-to-r from-primary/5 to-info/5 border-none">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="w-5 h-5 text-yellow-500 animate-bounce-gentle" />
            <span className="font-semibold text-lg">Keep Trading, Keep Learning!</span>
            <Star className="w-5 h-5 text-yellow-500 animate-bounce-gentle" />
          </div>
          <p className="text-muted-foreground">
            Every successful investor started with their first trade. Keep practicing and watch your skills grow! 🚀
          </p>
        </CardContent>
      </Card>
    </div>
  );
}