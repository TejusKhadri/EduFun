-- Create discussion_posts table
CREATE TABLE public.discussion_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  upvotes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Create discussion_comments table
CREATE TABLE public.discussion_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.discussion_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  upvotes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  parent_comment_id UUID REFERENCES public.discussion_comments(id) ON DELETE CASCADE,
  is_hidden BOOLEAN NOT NULL DEFAULT false
);

-- Create post_votes table
CREATE TABLE public.post_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES public.discussion_posts(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Create comment_votes table
CREATE TABLE public.comment_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  comment_id UUID NOT NULL REFERENCES public.discussion_comments(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, comment_id)
);

-- Create user_reputation table
CREATE TABLE public.user_reputation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  reputation_points INTEGER NOT NULL DEFAULT 0,
  posts_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  helpful_votes_received INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community_badges table
CREATE TABLE public.community_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  badge_type TEXT NOT NULL UNIQUE,
  badge_name TEXT NOT NULL,
  badge_description TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  requirements JSONB NOT NULL,
  points_required INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_community_badges table
CREATE TABLE public.user_community_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_type TEXT NOT NULL REFERENCES public.community_badges(badge_type),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

-- Create moderation_reports table
CREATE TABLE public.moderation_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_user_id UUID NOT NULL,
  reported_content_type TEXT NOT NULL CHECK (reported_content_type IN ('post', 'comment')),
  reported_content_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  moderator_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.discussion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_community_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for discussion_posts
CREATE POLICY "Anyone can view non-hidden posts" ON public.discussion_posts
  FOR SELECT USING (NOT is_hidden);

CREATE POLICY "Users can create their own posts" ON public.discussion_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON public.discussion_posts
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for discussion_comments
CREATE POLICY "Anyone can view non-hidden comments" ON public.discussion_comments
  FOR SELECT USING (NOT is_hidden);

CREATE POLICY "Users can create their own comments" ON public.discussion_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.discussion_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for votes
CREATE POLICY "Users can view all votes" ON public.post_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own votes" ON public.post_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON public.post_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON public.post_votes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view all comment votes" ON public.comment_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own comment votes" ON public.comment_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comment votes" ON public.comment_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment votes" ON public.comment_votes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for reputation
CREATE POLICY "Anyone can view reputation" ON public.user_reputation
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own reputation" ON public.user_reputation
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reputation" ON public.user_reputation
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for badges
CREATE POLICY "Anyone can view badges" ON public.community_badges
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view user badges" ON public.user_community_badges
  FOR SELECT USING (true);

CREATE POLICY "Users can earn their own badges" ON public.user_community_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for moderation
CREATE POLICY "Users can create reports" ON public.moderation_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_user_id);

CREATE POLICY "Users can view their own reports" ON public.moderation_reports
  FOR SELECT USING (auth.uid() = reporter_user_id);

-- Add update triggers
CREATE TRIGGER update_discussion_posts_updated_at
  BEFORE UPDATE ON public.discussion_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discussion_comments_updated_at
  BEFORE UPDATE ON public.discussion_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_reputation_updated_at
  BEFORE UPDATE ON public.user_reputation
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default community badges
INSERT INTO public.community_badges (badge_type, badge_name, badge_description, badge_icon, requirements, points_required) VALUES
('first-post', 'First Post', 'Shared your first question or idea!', '🎉', '{"posts_count": 1}', 10),
('helpful-friend', 'Helpful Friend', 'Received 5 upvotes on your contributions', '🤝', '{"helpful_votes_received": 5}', 50),
('discussion-starter', 'Discussion Starter', 'Created 5 engaging posts', '💬', '{"posts_count": 5}', 100),
('wise-mentor', 'Wise Mentor', 'Helped others with 20 helpful comments', '🦉', '{"comments_count": 20, "helpful_votes_received": 10}', 200),
('community-champion', 'Community Champion', 'Earned 500 reputation points', '🏆', '{"reputation_points": 500}', 500),
('top-contributor', 'Top Contributor', 'Created 25+ posts and comments combined', '⭐', '{"posts_and_comments": 25}', 300);

-- Functions for reputation and badge management
CREATE OR REPLACE FUNCTION public.update_post_votes()
RETURNS TRIGGER AS $$
BEGIN
  -- Update post upvotes count
  UPDATE public.discussion_posts 
  SET upvotes = (
    SELECT COUNT(*) 
    FROM public.post_votes 
    WHERE post_id = NEW.post_id AND vote_type = 'upvote'
  ) - (
    SELECT COUNT(*) 
    FROM public.post_votes 
    WHERE post_id = NEW.post_id AND vote_type = 'downvote'
  )
  WHERE id = NEW.post_id;
  
  -- Update user reputation
  PERFORM public.update_user_reputation_from_votes(NEW.post_id, 'post');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_comment_votes()
RETURNS TRIGGER AS $$
BEGIN
  -- Update comment upvotes count
  UPDATE public.discussion_comments 
  SET upvotes = (
    SELECT COUNT(*) 
    FROM public.comment_votes 
    WHERE comment_id = NEW.comment_id AND vote_type = 'upvote'
  ) - (
    SELECT COUNT(*) 
    FROM public.comment_votes 
    WHERE comment_id = NEW.comment_id AND vote_type = 'downvote'
  )
  WHERE id = NEW.comment_id;
  
  -- Update user reputation
  PERFORM public.update_user_reputation_from_votes(NEW.comment_id, 'comment');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_user_reputation_from_votes(content_id UUID, content_type TEXT)
RETURNS VOID AS $$
DECLARE
  content_owner UUID;
  upvote_count INTEGER;
BEGIN
  -- Get content owner
  IF content_type = 'post' THEN
    SELECT user_id INTO content_owner FROM public.discussion_posts WHERE id = content_id;
    SELECT COUNT(*) INTO upvote_count FROM public.post_votes WHERE post_id = content_id AND vote_type = 'upvote';
  ELSE
    SELECT user_id INTO content_owner FROM public.discussion_comments WHERE id = content_id;
    SELECT COUNT(*) INTO upvote_count FROM public.comment_votes WHERE comment_id = content_id AND vote_type = 'upvote';
  END IF;
  
  -- Update user reputation
  INSERT INTO public.user_reputation (user_id, helpful_votes_received, reputation_points)
  VALUES (content_owner, upvote_count, upvote_count * 10)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    helpful_votes_received = (
      SELECT COUNT(*) FROM (
        SELECT pv.user_id FROM public.post_votes pv 
        JOIN public.discussion_posts dp ON pv.post_id = dp.id 
        WHERE dp.user_id = content_owner AND pv.vote_type = 'upvote'
        UNION ALL
        SELECT cv.user_id FROM public.comment_votes cv 
        JOIN public.discussion_comments dc ON cv.comment_id = dc.id 
        WHERE dc.user_id = content_owner AND cv.vote_type = 'upvote'
      ) all_votes
    ),
    reputation_points = (
      SELECT COUNT(*) * 10 FROM (
        SELECT pv.user_id FROM public.post_votes pv 
        JOIN public.discussion_posts dp ON pv.post_id = dp.id 
        WHERE dp.user_id = content_owner AND pv.vote_type = 'upvote'
        UNION ALL
        SELECT cv.user_id FROM public.comment_votes cv 
        JOIN public.discussion_comments dc ON cv.comment_id = dc.id 
        WHERE dc.user_id = content_owner AND cv.vote_type = 'upvote'
      ) all_votes
    ) + (
      SELECT COALESCE(posts_count * 5, 0) + COALESCE(comments_count * 2, 0)
      FROM public.user_reputation WHERE user_id = content_owner
    ),
    updated_at = now();
    
  -- Check and award badges
  PERFORM public.check_and_award_community_badges(content_owner);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.check_and_award_community_badges(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  user_rep RECORD;
  posts_count INTEGER;
  comments_count INTEGER;
BEGIN
  -- Get user reputation data
  SELECT * INTO user_rep FROM public.user_reputation WHERE user_id = user_uuid;
  
  IF user_rep IS NULL THEN
    -- Initialize reputation if it doesn't exist
    SELECT COUNT(*) INTO posts_count FROM public.discussion_posts WHERE user_id = user_uuid;
    SELECT COUNT(*) INTO comments_count FROM public.discussion_comments WHERE user_id = user_uuid;
    
    INSERT INTO public.user_reputation (user_id, posts_count, comments_count, reputation_points)
    VALUES (user_uuid, posts_count, comments_count, (posts_count * 5) + (comments_count * 2));
    
    SELECT * INTO user_rep FROM public.user_reputation WHERE user_id = user_uuid;
  END IF;
  
  -- Award badges based on criteria
  
  -- First Post
  IF user_rep.posts_count >= 1 THEN
    INSERT INTO public.user_community_badges (user_id, badge_type)
    VALUES (user_uuid, 'first-post')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- Helpful Friend  
  IF user_rep.helpful_votes_received >= 5 THEN
    INSERT INTO public.user_community_badges (user_id, badge_type)
    VALUES (user_uuid, 'helpful-friend')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- Discussion Starter
  IF user_rep.posts_count >= 5 THEN
    INSERT INTO public.user_community_badges (user_id, badge_type)
    VALUES (user_uuid, 'discussion-starter')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- Wise Mentor
  IF user_rep.comments_count >= 20 AND user_rep.helpful_votes_received >= 10 THEN
    INSERT INTO public.user_community_badges (user_id, badge_type)
    VALUES (user_uuid, 'wise-mentor')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- Community Champion
  IF user_rep.reputation_points >= 500 THEN
    INSERT INTO public.user_community_badges (user_id, badge_type)
    VALUES (user_uuid, 'community-champion')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- Top Contributor
  IF (user_rep.posts_count + user_rep.comments_count) >= 25 THEN
    INSERT INTO public.user_community_badges (user_id, badge_type)
    VALUES (user_uuid, 'top-contributor')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for vote updates
CREATE TRIGGER trigger_update_post_votes
  AFTER INSERT OR UPDATE OR DELETE ON public.post_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_votes();

CREATE TRIGGER trigger_update_comment_votes
  AFTER INSERT OR UPDATE OR DELETE ON public.comment_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_comment_votes();

-- Function to update reputation when posts/comments are created
CREATE OR REPLACE FUNCTION public.update_reputation_on_content_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user reputation counts
  INSERT INTO public.user_reputation (user_id, posts_count, comments_count, reputation_points)
  VALUES (
    NEW.user_id, 
    CASE WHEN TG_TABLE_NAME = 'discussion_posts' THEN 1 ELSE 0 END,
    CASE WHEN TG_TABLE_NAME = 'discussion_comments' THEN 1 ELSE 0 END,
    CASE WHEN TG_TABLE_NAME = 'discussion_posts' THEN 5 ELSE 2 END
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    posts_count = user_reputation.posts_count + CASE WHEN TG_TABLE_NAME = 'discussion_posts' THEN 1 ELSE 0 END,
    comments_count = user_reputation.comments_count + CASE WHEN TG_TABLE_NAME = 'discussion_comments' THEN 1 ELSE 0 END,
    reputation_points = user_reputation.reputation_points + CASE WHEN TG_TABLE_NAME = 'discussion_posts' THEN 5 ELSE 2 END,
    updated_at = now();
    
  -- Check and award badges
  PERFORM public.check_and_award_community_badges(NEW.user_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_reputation_on_post_creation
  AFTER INSERT ON public.discussion_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_reputation_on_content_creation();

CREATE TRIGGER trigger_reputation_on_comment_creation
  AFTER INSERT ON public.discussion_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_reputation_on_content_creation();