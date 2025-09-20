import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Star, Play, Video } from 'lucide-react';
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
  videoUrl?: string;
}

interface VideoContent {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  category: 'basics' | 'analysis' | 'strategy' | 'psychology';
  duration: string;
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

const VIDEO_CONTENT: VideoContent[] = [
  {
    id: 'stocks-explained',
    title: 'Stocks Explained - Stock Market for Beginners',
    description: 'Complete introduction to stocks and how the stock market works',
    youtubeId: 'hE2NsJGpEq4',
    category: 'basics',
    duration: '12:35'
  },
  {
    id: 'stock-analysis',
    title: 'How to Analyze Stocks - Technical Analysis',
    description: 'Learn the fundamentals of stock analysis and chart reading',
    youtubeId: '3SJ2WR8LZ0c',
    category: 'analysis',
    duration: '15:42'
  },
  {
    id: 'portfolio-strategy',
    title: 'How to Build a Stock Portfolio',
    description: 'Strategies for building a diversified investment portfolio',
    youtubeId: 'jjQ2iTI8nqQ',
    category: 'strategy',
    duration: '18:25'
  },
  {
    id: 'investor-psychology',
    title: 'Psychology of Investing - Emotions & Money',
    description: 'Understanding the psychological aspects of investing',
    youtubeId: 'oOJvzZ_5ONc',
    category: 'psychology',
    duration: '14:18'
  },
  {
    id: 'risk-management',
    title: 'Risk Management in Trading',
    description: 'How to manage risk and protect your investments',
    youtubeId: 'IP1A6zZQf9I',
    category: 'strategy',
    duration: '16:30'
  },
  {
    id: 'market-basics',
    title: 'How Stock Markets Work',
    description: 'Deep dive into how stock exchanges and markets operate',
    youtubeId: 'F3QpgXBtDeo',
    category: 'basics',
    duration: '13:45'
  }
];

export function LearnPage({ onEarnCoins, userId }: LearnPageProps) {
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'modules' | 'videos'>('modules');
  const [selectedVideo, setSelectedVideo] = useState<VideoContent | null>(null);

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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basics':
        return 'bg-blue-500 text-white';
      case 'analysis':
        return 'bg-purple-500 text-white';
      case 'strategy':
        return 'bg-orange-500 text-white';
      case 'psychology':
        return 'bg-pink-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handleVideoClick = (video: VideoContent) => {
    setSelectedVideo(video);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Learning Center</h1>
        <p className="text-muted-foreground">Complete lessons to earn coins and become a better investor!</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('modules')}
          className={`pb-2 px-1 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'modules'
              ? 'text-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Learning Modules
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`pb-2 px-1 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'videos'
              ? 'text-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Video className="w-4 h-4" />
          Video Library
        </button>
      </div>

      {activeTab === 'modules' && (
        <>
          {/* Learning Modules Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="text-xl font-bold text-foreground">Learning Modules</h2>
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
        </>
      )}

      {activeTab === 'videos' && (
        <div className="space-y-6">
          {selectedVideo ? (
            /* Video Player */
            <div className="space-y-4">
              <Button 
                onClick={() => setSelectedVideo(null)}
                variant="outline"
                className="mb-4"
              >
                ← Back to Video Library
              </Button>
              
              <Card>
                <CardContent className="p-6">
                  <div className="aspect-video mb-4">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
                      title={selectedVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-lg"
                    ></iframe>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-foreground">{selectedVideo.title}</h2>
                      <Badge className={getCategoryColor(selectedVideo.category)}>
                        {selectedVideo.category}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{selectedVideo.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Video className="w-4 h-4" />
                      Duration: {selectedVideo.duration}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Video Library */
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Video className="w-6 h-6 text-primary" />
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Video Library</h2>
                      <p className="text-sm text-muted-foreground">
                        Watch expert videos to learn about investing and trading
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {VIDEO_CONTENT.map((video) => (
                  <Card key={video.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleVideoClick(video)}>
                    <CardContent className="p-0">
                      <div className="aspect-video relative">
                        <img
                          src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors rounded-t-lg">
                          <div className="bg-white/90 rounded-full p-3">
                            <Play className="w-6 h-6 text-gray-900" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {video.duration}
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getCategoryColor(video.category)}>
                            {video.category}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{video.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}