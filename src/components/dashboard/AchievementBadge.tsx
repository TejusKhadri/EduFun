import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  type: string; // Allow any string since achievement types come from database
  earned?: boolean;
  className?: string;
}

const BADGE_CONFIG = {
  beginner: {
    emoji: '🌱',
    title: 'First Trade',
    description: 'Made your first investment!',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  'rising-star': {
    emoji: '⭐',
    title: 'Rising Star',
    description: 'Top 50% performer!',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  trader: {
    emoji: '📈',
    title: 'Active Trader',
    description: '10+ successful trades',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  investor: {
    emoji: '💎',
    title: 'Diamond Hands',
    description: 'Held stocks for 30+ days',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  whale: {
    emoji: '🐋',
    title: 'Big Investor',
    description: 'Portfolio worth $50,000+',
    color: 'badge-gold border-yellow-200 font-bold'
  },
  'profit-master': {
    emoji: '🎯',
    title: 'Profit Master',
    description: '25%+ total returns',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  streak: {
    emoji: '🔥',
    title: 'Hot Streak',
    description: '5 profitable days in a row',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  diversified: {
    emoji: '🌈',
    title: 'Diversified',
    description: 'Invested in 5+ different stocks',
    color: 'bg-gradient-to-r from-pink-100 to-purple-100 text-purple-800 border-purple-200'
  }
};

export function AchievementBadge({ type, earned = true, className }: AchievementBadgeProps) {
  const config = BADGE_CONFIG[type];
  
  // Handle unknown achievement types
  if (!config) {
    return (
      <div className={cn(
        "group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium",
        "bg-gray-100 text-gray-600 border-gray-200",
        className
      )}>
        <span className="text-sm">🏆</span>
        <span className="font-semibold">{type}</span>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200",
      earned 
        ? `${config.color} hover:scale-105 animate-slide-up` 
        : "bg-gray-100 text-gray-400 border-gray-200 opacity-60",
      earned && "hover:shadow-lg",
      className
    )}>
      <span className={cn("text-sm", earned && "animate-bounce-gentle")}>
        {config.emoji}
      </span>
      <span className="font-semibold">{config.title}</span>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        {config.description}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}