import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Trophy, MessageSquare, TrendingUp, Award } from 'lucide-react';

interface UserReputationCardProps {
  reputation: {
    reputation_points: number;
    posts_count: number;
    comments_count: number;
    helpful_votes_received: number;
  } | null;
  badges: Array<{
    community_badges: {
      badge_name: string;
      badge_icon: string;
      badge_description: string;
    };
  }>;
}

export const UserReputationCard: React.FC<UserReputationCardProps> = ({ reputation, badges }) => {
  const getReputationLevel = (points: number) => {
    if (points >= 1000) return { level: 'Expert', color: 'text-purple-600', icon: '🚀' };
    if (points >= 500) return { level: 'Advanced', color: 'text-blue-600', icon: '⭐' };
    if (points >= 200) return { level: 'Intermediate', color: 'text-green-600', icon: '🌟' };
    if (points >= 50) return { level: 'Beginner', color: 'text-yellow-600', icon: '🌱' };
    return { level: 'Newcomer', color: 'text-gray-600', icon: '👋' };
  };

  const getNextLevelProgress = (points: number) => {
    const levels = [0, 50, 200, 500, 1000];
    const currentLevelIndex = levels.findIndex(level => points < level);
    const currentLevel = currentLevelIndex === -1 ? levels.length - 1 : currentLevelIndex - 1;
    const nextLevel = currentLevelIndex === -1 ? levels[levels.length - 1] : levels[currentLevelIndex];
    const currentLevelPoints = levels[currentLevel];
    
    if (currentLevelIndex === -1) return { progress: 100, pointsToNext: 0 };
    
    const progress = ((points - currentLevelPoints) / (nextLevel - currentLevelPoints)) * 100;
    const pointsToNext = nextLevel - points;
    
    return { progress, pointsToNext };
  };

  const points = reputation?.reputation_points || 0;
  const levelInfo = getReputationLevel(points);
  const progressInfo = getNextLevelProgress(points);

  return (
    <div className="space-y-4">
      {/* Reputation Overview */}
      <Card className="hover-scale">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Your Reputation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">
              {points}
            </div>
            <Badge className={`${levelInfo.color} bg-transparent border-current`}>
              {levelInfo.icon} {levelInfo.level}
            </Badge>
          </div>
          
          {progressInfo.pointsToNext > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to next level</span>
                <span className="text-muted-foreground">
                  {progressInfo.pointsToNext} points to go
                </span>
              </div>
              <Progress value={progressInfo.progress} className="h-2" />
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                <MessageSquare className="h-3 w-3" />
                Posts
              </div>
              <div className="font-semibold">{reputation?.posts_count || 0}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                <TrendingUp className="h-3 w-3" />
                Votes
              </div>
              <div className="font-semibold">{reputation?.helpful_votes_received || 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      {badges.length > 0 && (
        <Card className="hover-scale">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Your Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {badges.map((userBadge, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="text-2xl mb-1">
                    {userBadge.community_badges.badge_icon}
                  </div>
                  <div className="text-xs font-medium text-center">
                    {userBadge.community_badges.badge_name}
                  </div>
                </div>
              ))}
            </div>
            {badges.length === 0 && (
              <p className="text-center text-muted-foreground text-sm">
                Participate in discussions to earn badges! 🏆
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};