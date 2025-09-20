import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PostCard } from './PostCard';
import { CreatePostDialog } from './CreatePostDialog';
import { UserReputationCard } from './UserReputationCard';
import { CommunityBadges } from './CommunityBadges';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  TrendingUp, 
  Search, 
  Filter,
  Award,
  Users,
  Star
} from 'lucide-react';
import { format } from 'date-fns';

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  upvotes: number;
  created_at: string;
  user_id: string;
  is_pinned: boolean;
  tags: string[] | null;
  user_profile?: {
    display_name: string;
    avatar_url: string;
  } | null;
  comment_count?: number;
  user_vote?: string;
}

interface CommunityPageProps {
  userId: string;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ userId }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [userReputation, setUserReputation] = useState<any>(null);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const { toast } = useToast();

  const categories = [
    { id: 'all', name: 'All Posts', icon: '📢' },
    { id: 'general', name: 'General Discussion', icon: '💬' },
    { id: 'stocks', name: 'Stock Analysis', icon: '📈' },
    { id: 'tips', name: 'Trading Tips', icon: '💡' },
    { id: 'news', name: 'Market News', icon: '📰' },
    { id: 'questions', name: 'Questions', icon: '❓' },
    { id: 'strategies', name: 'Strategies', icon: '🎯' }
  ];

  useEffect(() => {
    fetchPosts();
    fetchUserStats();
  }, [selectedCategory, searchTerm]);

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('discussion_posts')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get comment counts, user votes, and profiles for each post
      const postsWithCounts = await Promise.all(
        (data || []).map(async (post) => {
          // Get user profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', post.user_id)
            .maybeSingle();

          // Get comment count
          const { count: commentCount } = await supabase
            .from('discussion_comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          // Get user's vote
          const { data: voteData } = await supabase
            .from('post_votes')
            .select('vote_type')
            .eq('post_id', post.id)
            .eq('user_id', userId)
            .maybeSingle();

          return {
            ...post,
            user_profile: profileData,
            comment_count: commentCount || 0,
            user_vote: voteData?.vote_type,
            tags: post.tags || []
          };
        })
      );

      setPosts(postsWithCounts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load community posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Get user reputation
      const { data: repData } = await supabase
        .from('user_reputation')
        .select('*')
        .eq('user_id', userId)
        .single();

      setUserReputation(repData);

      // Get user badges
      const { data: badgeData } = await supabase
        .from('user_community_badges')
        .select(`
          *,
          community_badges (*)
        `)
        .eq('user_id', userId);

      setUserBadges(badgeData || []);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleVote = async (postId: string, voteType: 'upvote' | 'downvote') => {
    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('post_votes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote if same type
          await supabase
            .from('post_votes')
            .delete()
            .eq('id', existingVote.id);
        } else {
          // Update vote type
          await supabase
            .from('post_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);
        }
      } else {
        // Create new vote
        await supabase
          .from('post_votes')
          .insert({
            post_id: postId,
            user_id: userId,
            vote_type: voteType
          });
      }

      fetchPosts(); // Refresh to show updated votes
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to record your vote",
        variant: "destructive"
      });
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Community Discussion
            </h1>
          </div>
          <p className="text-muted-foreground">
            Share ideas, ask questions, and learn from fellow young investors! 🚀
          </p>
        </div>
        <Button 
          onClick={() => setShowCreatePost(true)}
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
        >
          📝 Start Discussion
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* User Stats */}
          <UserReputationCard 
            reputation={userReputation} 
            badges={userBadges}
          />
          
          {/* Community Stats */}
          <Card className="hover-scale">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Community Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Posts</span>
                <Badge variant="secondary">{posts.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Today</span>
                <Badge variant="secondary" className="bg-success/10 text-success">
                  {posts.filter(p => 
                    new Date(p.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                  ).length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left p-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'hover:bg-muted'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span className="text-sm">{category.name}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search discussions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to start a conversation!
                  </p>
                  <Button onClick={() => setShowCreatePost(true)}>
                    Create First Post
                  </Button>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onVote={handleVote}
                  currentUserId={userId}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Post Dialog */}
      <CreatePostDialog
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
        userId={userId}
        onPostCreated={fetchPosts}
        categories={categories.filter(c => c.id !== 'all')}
      />
    </div>
  );
};