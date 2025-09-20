import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Award, BookOpen, TrendingUp } from 'lucide-react';

interface EducationalTipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tip: {
    title: string;
    content: string;
    badge: string;
  };
}

export const EducationalTipDialog: React.FC<EducationalTipDialogProps> = ({
  open,
  onOpenChange,
  tip
}) => {
  const getBadgeInfo = (badgeType: string) => {
    switch (badgeType) {
      case 'smart-investor':
        return { icon: '🧠', name: 'Smart Investor', color: 'bg-blue-100 text-blue-800' };
      case 'bargain-hunter':
        return { icon: '🎯', name: 'Bargain Hunter', color: 'bg-green-100 text-green-800' };
      case 'researcher':
        return { icon: '🔍', name: 'Researcher', color: 'bg-purple-100 text-purple-800' };
      case 'patient-investor':
        return { icon: '💎', name: 'Patient Investor', color: 'bg-yellow-100 text-yellow-800' };
      default:
        return { icon: '⭐', name: 'Wise Trader', color: 'bg-orange-100 text-orange-800' };
    }
  };

  const badgeInfo = getBadgeInfo(tip.badge);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            💡 Learning Moment!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tip Content */}
          <Card className="border-warning/20 bg-gradient-to-br from-warning/5 to-orange/5">
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-3">🎓</div>
                <h3 className="text-lg font-semibold text-foreground">
                  {tip.title}
                </h3>
              </div>
              
              <p className="text-muted-foreground leading-relaxed text-center">
                {tip.content}
              </p>
              
              {/* Badge Preview */}
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">{badgeInfo.icon}</div>
                <Badge className={badgeInfo.color}>
                  {badgeInfo.name}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Keep learning to earn this badge!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Educational Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <BookOpen className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="text-xs text-muted-foreground">Learning</div>
              <div className="font-semibold">+5 XP</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-success" />
              <div className="text-xs text-muted-foreground">Skill</div>
              <div className="font-semibold">+1 Level</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Award className="h-5 w-5 mx-auto mb-1 text-warning" />
              <div className="text-xs text-muted-foreground">Progress</div>
              <div className="font-semibold">+10%</div>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
          >
            🚀 Continue Learning!
          </Button>

          {/* Fun Footer */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              💫 Great investors never stop learning! Keep exploring to unlock more tips and badges.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};