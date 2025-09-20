import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Star, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LearnPageProps {
  onEarnCoins: (amount: number) => void;
  userId: string;
}

interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  coins: number;
  completed?: boolean;
}

const LEARNING_MODULES: LearningModule[] = [
  {
    id: 'what-is-stock',
    title: 'What is a Stock?',
    description: 'Learn the basics of what stocks are and how they work',
    difficulty: 'Beginner',
    duration: '5 min',
    coins: 50
  },
  {
    id: 'read-stock-prices',
    title: 'How to Read Stock Prices',
    description: 'Understand stock prices and what the numbers mean',
    difficulty: 'Beginner',
    duration: '8 min',
    coins: 75
  },
  {
    id: 'risk-reward',
    title: 'Risk and Reward',
    description: 'Learn about investment risk and potential rewards',
    difficulty: 'Intermediate',
    duration: '12 min',
    coins: 100
  },
  {
    id: 'building-portfolio',
    title: 'Building a Portfolio',
    description: 'How to diversify your investments across different stocks',
    difficulty: 'Advanced',
    duration: '15 min',
    coins: 150
  }
];

export function LearnPage({ onEarnCoins, userId }: LearnPageProps) {
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());

  const handleStartModule = async (module: LearningModule) => {
    if (completedModules.has(module.id)) {
      toast.info('You have already completed this module!');
      return;
    }

    // Simulate completing the module
    setTimeout(async () => {
      try {
        // Mark module as completed in database
        await supabase
          .from('learning_progress')
          .insert({
            user_id: userId,
            module_id: module.id,
            module_title: module.title,
            coins_earned: module.coins
          });

        // Update local state
        setCompletedModules(prev => new Set([...prev, module.id]));
        
        // Award coins
        onEarnCoins(module.coins);
        
        toast.success(`Completed "${module.title}"! Earned ${module.coins} coins! 🎉`);
      } catch (error) {
        console.error('Error completing module:', error);
        toast.error('Failed to complete module. Please try again.');
      }
    }, 2000); // Simulate 2 second completion time

    toast.info(`Starting "${module.title}"... Complete to earn ${module.coins} coins!`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-500 text-white';
      case 'Intermediate':
        return 'bg-amber-500 text-white';
      case 'Advanced':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Learning Center</h1>
        <p className="text-muted-foreground">Complete lessons to earn coins and become a better investor!</p>
      </div>

      {/* Learning Modules Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-bold text-foreground">Learning Center</h2>
              <p className="text-sm text-muted-foreground">
                Complete lessons to earn virtual coins and improve your investing skills!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Modules */}
      <div className="space-y-4">
        {LEARNING_MODULES.map((module) => {
          const isCompleted = completedModules.has(module.id);
          
          return (
            <Card key={module.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-foreground">{module.title}</h3>
                      {isCompleted && <Star className="w-5 h-5 text-amber-400 fill-current" />}
                    </div>
                    
                    <p className="text-muted-foreground mb-3">{module.description}</p>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={getDifficultyColor(module.difficulty)}>
                        {module.difficulty}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{module.duration}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-amber-600 font-semibold">
                        <Star className="w-4 h-4" />
                        +{module.coins} coins
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleStartModule(module)}
                      disabled={isCompleted}
                      className={isCompleted ? 'bg-green-500 hover:bg-green-500' : ''}
                    >
                      {isCompleted ? (
                        'Completed'
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}