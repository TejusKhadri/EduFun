-- Create table for tracking daily portfolio snapshots
CREATE TABLE public.portfolio_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  portfolio_value NUMERIC NOT NULL DEFAULT 0,
  total_returns NUMERIC NOT NULL DEFAULT 0,
  rank_position INTEGER,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, recorded_at)
);

-- Create table for tracking achievements
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, achievement_type)
);

-- Enable Row Level Security
ALTER TABLE public.portfolio_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for portfolio_history
CREATE POLICY "Users can view their own portfolio history"
ON public.portfolio_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolio history"
ON public.portfolio_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policies for user_achievements
CREATE POLICY "Users can view their own achievements"
ON public.user_achievements
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view all achievements for leaderboard"
ON public.user_achievements
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own achievements"
ON public.user_achievements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function to automatically record daily portfolio snapshots
CREATE OR REPLACE FUNCTION public.record_daily_portfolio_snapshot()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert or update today's snapshot
  INSERT INTO public.portfolio_history (user_id, portfolio_value, total_returns)
  VALUES (NEW.user_id, NEW.total_portfolio_value, NEW.total_returns)
  ON CONFLICT (user_id, recorded_at)
  DO UPDATE SET
    portfolio_value = NEW.total_portfolio_value,
    total_returns = NEW.total_returns,
    created_at = now();
  
  RETURN NEW;
END;
$$;

-- Create trigger to record snapshots when profiles are updated
CREATE TRIGGER record_portfolio_snapshot_trigger
  AFTER UPDATE OF total_portfolio_value, total_returns ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.record_daily_portfolio_snapshot();

-- Function to get user's performance over time
CREATE OR REPLACE FUNCTION public.get_user_performance_history(
  user_uuid UUID,
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
  date DATE,
  portfolio_value NUMERIC,
  total_returns NUMERIC,
  rank_position INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ph.recorded_at as date,
    ph.portfolio_value,
    ph.total_returns,
    ph.rank_position
  FROM public.portfolio_history ph
  WHERE ph.user_id = user_uuid
    AND ph.recorded_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
  ORDER BY ph.recorded_at DESC;
END;
$$;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_profile RECORD;
  portfolio_count INTEGER;
  transaction_count INTEGER;
BEGIN
  -- Get user profile data
  SELECT * INTO user_profile
  FROM public.profiles
  WHERE user_id = user_uuid;
  
  IF user_profile IS NULL THEN
    RETURN;
  END IF;
  
  -- Count portfolio entries (for diversification)
  SELECT COUNT(DISTINCT stock_symbol) INTO portfolio_count
  FROM public.portfolios
  WHERE user_id = user_uuid AND shares > 0;
  
  -- Count transactions (for trading activity)
  SELECT COUNT(*) INTO transaction_count
  FROM public.transactions
  WHERE user_id = user_uuid;
  
  -- Award achievements based on criteria
  
  -- First Trade Achievement
  IF transaction_count >= 1 THEN
    INSERT INTO public.user_achievements (user_id, achievement_type, achievement_name)
    VALUES (user_uuid, 'beginner', 'First Trade')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;
  
  -- Active Trader Achievement
  IF transaction_count >= 10 THEN
    INSERT INTO public.user_achievements (user_id, achievement_type, achievement_name)
    VALUES (user_uuid, 'trader', 'Active Trader')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;
  
  -- Diversified Portfolio Achievement
  IF portfolio_count >= 5 THEN
    INSERT INTO public.user_achievements (user_id, achievement_type, achievement_name)
    VALUES (user_uuid, 'diversified', 'Diversified Portfolio')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;
  
  -- Profit Master Achievement
  IF user_profile.total_returns >= 25 THEN
    INSERT INTO public.user_achievements (user_id, achievement_type, achievement_name)
    VALUES (user_uuid, 'profit-master', 'Profit Master')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;
  
  -- Big Investor Achievement
  IF user_profile.total_portfolio_value >= 50000 THEN
    INSERT INTO public.user_achievements (user_id, achievement_type, achievement_name)
    VALUES (user_uuid, 'whale', 'Big Investor')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;
  
END;
$$;