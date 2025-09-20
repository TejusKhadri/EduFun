-- Fix search_path security warnings for the functions
CREATE OR REPLACE FUNCTION public.get_leaderboard_data()
RETURNS TABLE(
  rank_position bigint,
  display_name text, 
  total_portfolio_value numeric,
  total_returns numeric,
  user_group text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY p.total_portfolio_value DESC) as rank_position,
    COALESCE(p.display_name, 'Anonymous User') as display_name,
    p.total_portfolio_value,
    p.total_returns,
    p.user_group
  FROM public.profiles p
  WHERE p.total_portfolio_value > 0  -- Only show users with actual investments
  ORDER BY p.total_portfolio_value DESC
  LIMIT 100;  -- Limit to top 100 for performance
END;
$function$;

-- Fix search_path for user rank function
CREATE OR REPLACE FUNCTION public.get_user_rank(user_uuid uuid)
RETURNS TABLE(
  user_rank bigint,
  display_name text,
  total_portfolio_value numeric,
  total_returns numeric,
  user_group text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  WITH ranked_users AS (
    SELECT 
      p.id,
      p.display_name,
      p.total_portfolio_value,
      p.total_returns,
      p.user_group,
      ROW_NUMBER() OVER (ORDER BY p.total_portfolio_value DESC) as rank_position
    FROM public.profiles p
    WHERE p.total_portfolio_value > 0
  )
  SELECT 
    ru.rank_position,
    ru.display_name,
    ru.total_portfolio_value,
    ru.total_returns,
    ru.user_group
  FROM ranked_users ru
  WHERE ru.id = user_uuid;
END;
$function$;