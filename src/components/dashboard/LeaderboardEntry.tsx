import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, TrendingUp, TrendingDown, Star } from 'lucide-react';
import { AchievementBadge } from './AchievementBadge';
import { cn } from '@/lib/utils';

interface LeaderboardEntryProps {
  rank: number;
  name: string;
  avatar?: string;
  value: number;
  returns: number;
  isCurrentUser?: boolean;
  achievements?: string[];
  previousRank?: number;
  className?: string;
}

export function LeaderboardEntry({
  rank,
  name,
  avatar,
  value,
  returns,
  isCurrentUser = false,
  achievements = [],
  previousRank,
  className
}: LeaderboardEntryProps) {
  const getRankDisplay = () => {
    if (rank <= 3) {
      const medals = ['🥇', '🥈', '🥉'];
      return (
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-bounce-gentle">{medals[rank - 1]}</span>
          <span className="font-bold text-lg">{rank}</span>
        </div>
      );
    }
    return <span className="font-bold text-lg">{rank}</span>;
  };
  
  const getRankChange = () => {
    if (!previousRank || previousRank === rank) return null;
    
    const change = previousRank - rank; // Positive means moved up
    const isUp = change > 0;
    
    return (
      <Badge 
        variant={isUp ? "default" : "destructive"}
        className={cn(
          "text-xs ml-2",
          isUp && "bg-success text-success-foreground"
        )}
      >
        {isUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
        {Math.abs(change)}
      </Badge>
    );
  };
  
  // Generate achievements based on stats
  const getAchievements = () => {
    const badges = [];
    
    if (rank === 1) badges.push('whale');
    if (rank <= 3) badges.push('rising-star');
    if (returns >= 25) badges.push('profit-master');
    if (value >= 50000) badges.push('whale');
    
    return badges.slice(0, 2); // Show max 2 badges
  };
  
  return (
    <div className={cn(
      "relative flex items-center justify-between p-4 rounded-xl transition-all duration-300 group",
      "hover:scale-[1.02] hover:shadow-lg animate-slide-up",
      isCurrentUser 
        ? "bg-gradient-to-r from-primary/10 to-info/10 border-2 border-primary animate-pulse-glow" 
        : "bg-card hover:bg-muted/50",
      rank <= 3 && "border-2",
      rank === 1 && "border-yellow-400",
      rank === 2 && "border-gray-400", 
      rank === 3 && "border-amber-600",
      className
    )}>
      {/* Rank and User Info */}
      <div className="flex items-center gap-4">
        <div className="min-w-[60px] text-center">
          {getRankDisplay()}
          {getRankChange()}
        </div>
        
        <Avatar className={cn(
          "transition-all duration-300 group-hover:scale-110",
          rank <= 3 ? "w-14 h-14 border-2" : "w-12 h-12",
          rank === 1 && "border-yellow-400",
          rank === 2 && "border-gray-400",
          rank === 3 && "border-amber-600"
        )}>
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>
            <User className="w-6 h-6" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "font-semibold",
              isCurrentUser && "text-primary",
              rank === 1 && "gradient-text"
            )}>
              {name}
            </h3>
            {isCurrentUser && (
              <Star className="w-4 h-4 text-yellow-500 animate-bounce-gentle" />
            )}
          </div>
          
          {/* Achievements */}
          <div className="flex gap-1 mt-1">
            {getAchievements().map((badge, index) => (
              <AchievementBadge 
                key={badge} 
                type={badge as any}
                className="scale-75"
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="text-right">
        <div className={cn(
          "font-bold text-lg",
          rank === 1 && "gradient-text"
        )}>
          ${value.toLocaleString()}
        </div>
        <Badge 
          variant={returns >= 0 ? "default" : "destructive"}
          className={cn(
            "text-xs",
            returns >= 0 && "bg-success text-success-foreground"
          )}
        >
          {returns >= 0 ? '+' : ''}{returns.toFixed(1)}%
        </Badge>
      </div>
      
      {/* Sparkle effect for top performers */}
      {rank <= 3 && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 right-2 text-yellow-400 animate-bounce-gentle opacity-60">
            ✨
          </div>
          <div className="absolute bottom-2 left-2 text-yellow-400 animate-bounce-gentle opacity-40" style={{animationDelay: '0.5s'}}>
            ⭐
          </div>
        </div>
      )}
    </div>
  );
}