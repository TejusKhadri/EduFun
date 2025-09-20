import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, Star, Target } from 'lucide-react';

interface CommunityBadge {
  badge_type: string;
  badge_name: string;
  badge_description: string;
  badge_icon: string;
  points_required: number;
  requirements: any;
}

interface CommunityBadgesProps {
  availableBadges: CommunityBadge[];
  userBadges: string[];
  userStats: {
    reputation_points: number;
    posts_count: number;
    comments_count: number;
    helpful_votes_received: number;
  } | null;
}

export const CommunityBadges: React.FC<CommunityBadgesProps> = ({
  availableBadges,
  userBadges,
  userStats
}) => {
  const calculateProgress = (badge: CommunityBadge) => {
    if (!userStats) return 0;
    
    const requirements = badge.requirements;
    
    if (requirements.posts_count) {
      return Math.min((userStats.posts_count / requirements.posts_count) * 100, 100);
    }
    
    if (requirements.helpful_votes_received) {
      return Math.min((userStats.helpful_votes_received / requirements.helpful_votes_received) * 100, 100);
    }
    
    if (requirements.comments_count) {
      return Math.min((userStats.comments_count / requirements.comments_count) * 100, 100);
    }
    
    if (requirements.reputation_points) {
      return Math.min((userStats.reputation_points / requirements.reputation_points) * 100, 100);
    }
    
    if (requirements.posts_and_comments) {
      const total = userStats.posts_count + userStats.comments_count;
      return Math.min((total / requirements.posts_and_comments) * 100, 100);
    }
    
    return 0;
  };

  const isEarned = (badgeType: string) => userBadges.includes(badgeType);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Community Badges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {availableBadges.map((badge) => {
          const earned = isEarned(badge.badge_type);
          const progress = calculateProgress(badge);
          
          return (
            <div
              key={badge.badge_type}
              className={`p-3 rounded-lg border transition-all ${
                earned 
                  ? 'bg-primary/5 border-primary/20' 
                  : 'bg-muted/30 border-muted'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`text-2xl ${earned ? '' : 'grayscale opacity-50'}`}>
                  {badge.badge_icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{badge.badge_name}</h4>
                    {earned && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Earned
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {badge.badge_description}
                  </p>
                  
                  {!earned && progress < 100 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-1" />
                    </div>
                  )}
                  
                  {earned && (
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <Award className="h-3 w-3" />
                      Badge Earned!
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};