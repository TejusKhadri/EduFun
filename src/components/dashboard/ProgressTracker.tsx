import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressTrackerProps {
  timeframe: 'week' | 'month';
  currentValue: number;
  previousValue: number;
  target?: number;
  className?: string;
}

export function ProgressTracker({ 
  timeframe, 
  currentValue, 
  previousValue, 
  target,
  className 
}: ProgressTrackerProps) {
  const change = currentValue - previousValue;
  const changePercent = previousValue > 0 ? ((change / previousValue) * 100) : 0;
  const isPositive = change >= 0;
  
  const progressToTarget = target ? Math.min((currentValue / target) * 100, 100) : 0;
  
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium capitalize">
              {timeframe}ly Progress
            </span>
          </div>
          <Badge 
            variant={isPositive ? "default" : "destructive"}
            className={cn(
              "text-xs",
              isPositive && "bg-success text-success-foreground"
            )}
          >
            {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">
              ${currentValue.toLocaleString()}
            </span>
            <span className={cn(
              "text-sm font-medium",
              isPositive ? "text-success" : "text-destructive"
            )}>
              {isPositive ? '+' : ''}${Math.abs(change).toLocaleString()}
            </span>
          </div>
          
          {target && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Goal Progress</span>
                <span className="font-medium">{progressToTarget.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary to-success rounded-full h-2 transition-all duration-500"
                  style={{ width: `${progressToTarget}%` }}
                />
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Target className="w-3 h-3" />
                <span>Target: ${target.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}