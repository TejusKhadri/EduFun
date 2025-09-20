import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown, Trophy, Medal, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PodiumEntry {
  rank: number;
  name: string;
  avatar?: string;
  value: number;
  returns: number;
}

interface PodiumDisplayProps {
  topThree: PodiumEntry[];
  className?: string;
}

export function PodiumDisplay({ topThree, className }: PodiumDisplayProps) {
  const getPodiumHeight = (rank: number) => {
    switch (rank) {
      case 1: return 'h-32';
      case 2: return 'h-24';
      case 3: return 'h-20';
      default: return 'h-16';
    }
  };
  
  const getPodiumColor = (rank: number) => {
    switch (rank) {
      case 1: return 'gradient-bg-winner';
      case 2: return 'badge-silver';
      case 3: return 'badge-bronze';
      default: return 'bg-muted';
    }
  };
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500 animate-trophy-spin" />;
      case 2: return <Trophy className="w-5 h-5 text-gray-500" />;
      case 3: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return null;
    }
  };
  
  // Reorder for podium display (2nd, 1st, 3rd)
  const orderedEntries = [
    topThree[1], // 2nd place
    topThree[0], // 1st place  
    topThree[2]  // 3rd place
  ].filter(Boolean);
  
  return (
    <div className={cn("flex items-end justify-center gap-4 p-6", className)}>
      {orderedEntries.map((entry, index) => {
        if (!entry) return null;
        
        const actualRank = entry.rank;
        const isWinner = actualRank === 1;
        
        return (
          <div
            key={entry.name}
            className={cn(
              "flex flex-col items-center animate-slide-up",
              isWinner && "relative z-10"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Avatar and Badge */}
            <div className="relative mb-3">
              <Avatar className={cn(
                "border-4 transition-all duration-300",
                isWinner ? "w-20 h-20 border-yellow-400 animate-pulse-glow" : "w-16 h-16 border-muted"
              )}>
                <AvatarImage src={entry.avatar} alt={entry.name} />
                <AvatarFallback>
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              
              {/* Rank Icon */}
              <div className="absolute -top-2 -right-2">
                {getRankIcon(actualRank)}
              </div>
            </div>
            
            {/* Name and Stats */}
            <div className="text-center mb-2">
              <h3 className={cn(
                "font-bold truncate max-w-24",
                isWinner ? "text-lg gradient-text" : "text-sm"
              )}>
                {entry.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                ${entry.value.toLocaleString()}
              </p>
              <Badge 
                variant={entry.returns >= 0 ? "default" : "destructive"}
                className={cn(
                  "text-xs mt-1",
                  entry.returns >= 0 && "bg-success text-success-foreground"
                )}
              >
                {entry.returns >= 0 ? '+' : ''}{entry.returns.toFixed(1)}%
              </Badge>
            </div>
            
            {/* Podium Base */}
            <div className={cn(
              "w-20 rounded-t-lg flex items-center justify-center text-white font-bold",
              getPodiumHeight(actualRank),
              getPodiumColor(actualRank)
            )}>
              <span className="text-2xl">{actualRank}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}