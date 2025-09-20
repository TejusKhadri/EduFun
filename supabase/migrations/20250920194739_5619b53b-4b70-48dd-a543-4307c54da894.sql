-- Add trading-related community badges
INSERT INTO public.community_badges (badge_type, badge_name, badge_description, badge_icon, requirements, points_required) VALUES
('first-trade', 'First Trade', 'Made your very first stock purchase!', '🎉', '{"trades_count": 1}', 10),
('active-trader', 'Active Trader', 'Completed 5 successful trades', '📈', '{"trades_count": 5}', 50),
('trading-pro', 'Trading Pro', 'Completed 10+ trades like a pro!', '💪', '{"trades_count": 10}', 100),
('smart-investor', 'Smart Investor', 'Diversified portfolio across sectors', '🧠', '{"diversified_sectors": 3}', 150),
('bargain-hunter', 'Bargain Hunter', 'Found great deals in the market', '🎯', '{"profitable_trades": 3}', 75),
('researcher', 'Stock Researcher', 'Read company details before investing', '🔍', '{"research_actions": 5}', 25),
('patient-investor', 'Patient Investor', 'Held stocks for long-term gains', '💎', '{"holding_days": 30}', 200)
ON CONFLICT (badge_type) DO NOTHING;