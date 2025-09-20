import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { 
  ChevronUp, 
  ChevronDown, 
  MessageSquare, 
  Flag,
  Pin,
  Clock,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  upvotes: number;
  created_at: string;
  user_id: string;
  is_pinned: boolean;
  tags: string[];
  user_profile?: {
    display_name: string;
    avatar_url: string;
  };
  comment_count?: number;
  user_vote?: string;
}

interface PostCardProps {
  post: Post;
  onVote: (postId: string, voteType: 'upvote' | 'downvote') => void;
  currentUserId: string;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onVote, currentUserId }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const { toast } = useToast();

  const getCategoryColor = (category: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      stocks: 'bg-green-100 text-green-800',
      tips: 'bg-yellow-100 text-yellow-800',
      news: 'bg-purple-100 text-purple-800',
      questions: 'bg-orange-100 text-orange-800',
      strategies: 'bg-indigo-100 text-indigo-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      general: '💬',
      stocks: '📈',
      tips: '💡',
      news: '📰',
      questions: '❓',
      strategies: '🎯'
    };
    return icons[category as keyof typeof icons] || '💬';
  };

  const toggleComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      try {
        const { data, error } = await supabase
          .from('discussion_comments')
          .select(`
            *,
            profiles!discussion_comments_user_id_fkey (
              display_name,
              avatar_url
            )
          `)
          .eq('post_id', post.id)
          .is('parent_comment_id', null)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setComments(data || []);
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast({
          title: "Error",
          description: "Failed to load comments",
          variant: "destructive"
        });
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('discussion_comments')
        .insert({
          post_id: post.id,
          user_id: currentUserId,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      toast({
        title: "Success!",
        description: "Your comment has been added! 🎉"
      });
      
      // Refresh comments
      toggleComments();
      setTimeout(() => toggleComments(), 100);
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    }
  };

  const handleReport = async () => {
    try {
      const { error } = await supabase
        .from('moderation_reports')
        .insert({
          reporter_user_id: currentUserId,
          reported_content_type: 'post',
          reported_content_id: post.id,
          reason: 'Inappropriate content'
        });

      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Thank you for helping keep our community safe! 🛡️"
      });
    } catch (error) {
      console.error('Error reporting post:', error);
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="hover-scale transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {post.is_pinned && (
                <Pin className="h-4 w-4 text-primary" />
              )}
              <Badge className={getCategoryColor(post.category)}>
                {getCategoryIcon(post.category)} {post.category}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {format(new Date(post.created_at), 'MMM d, yyyy')}
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 line-clamp-2">
              {post.title}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.user_profile?.avatar_url} />
                <AvatarFallback>
                  <User className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {post.user_profile?.display_name || 'Anonymous'}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <Button
              variant={post.user_vote === 'upvote' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onVote(post.id, 'upvote')}
              className="h-8 w-8 p-0"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-2 py-1 rounded bg-muted">
              {post.upvotes}
            </span>
            <Button
              variant={post.user_vote === 'downvote' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onVote(post.id, 'downvote')}
              className="h-8 w-8 p-0"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {post.content}
        </p>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleComments}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            {post.comment_count || 0} Comments
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReport}
            className="flex items-center gap-2 text-muted-foreground hover:text-destructive"
          >
            <Flag className="h-4 w-4" />
            Report
          </Button>
        </div>
        
        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t">
            {loadingComments ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Add Comment */}
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                    />
                    <Button
                      onClick={handleAddComment}
                      size="sm"
                      disabled={!newComment.trim()}
                    >
                      💬 Add Comment
                    </Button>
                  </div>
                </div>
                
                {/* Comments List */}
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 bg-muted/50 p-3 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.profiles?.avatar_url} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {comment.profiles?.display_name || 'Anonymous'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
                
                {comments.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No comments yet. Be the first to share your thoughts! 💭
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};