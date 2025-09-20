-- Check the current portfolios table structure and update stock_name column to allow longer names
ALTER TABLE public.portfolios 
ALTER COLUMN stock_name TYPE TEXT;

-- Update existing truncated stock names to full company names
UPDATE public.portfolios 
SET stock_name = CASE 
  WHEN stock_symbol = 'AAPL' THEN 'Apple Inc.'
  WHEN stock_symbol = 'MSFT' THEN 'Microsoft Corporation'
  WHEN stock_symbol = 'GOOGL' THEN 'Alphabet Inc.'
  WHEN stock_symbol = 'META' THEN 'Meta Platforms, Inc.'
  WHEN stock_symbol = 'NVDA' THEN 'NVIDIA Corporation'
  WHEN stock_symbol = 'AMZN' THEN 'Amazon.com, Inc.'
  WHEN stock_symbol = 'TSLA' THEN 'Tesla, Inc.'
  WHEN stock_symbol = 'DIS' THEN 'The Walt Disney Company'
  WHEN stock_symbol = 'NFLX' THEN 'Netflix, Inc.'
  WHEN stock_symbol = 'KO' THEN 'The Coca-Cola Company'
  WHEN stock_symbol = 'PEP' THEN 'PepsiCo, Inc.'
  WHEN stock_symbol = 'MCD' THEN 'McDonald\'s Corporation'
  WHEN stock_symbol = 'SBUX' THEN 'Starbucks Corporation'
  WHEN stock_symbol = 'NKE' THEN 'Nike, Inc.'
  WHEN stock_symbol = 'JPM' THEN 'JPMorgan Chase & Co.'
  WHEN stock_symbol = 'BAC' THEN 'Bank of America Corporation'
  WHEN stock_symbol = 'JNJ' THEN 'Johnson & Johnson'
  WHEN stock_symbol = 'PFE' THEN 'Pfizer Inc.'
  WHEN stock_symbol = 'XOM' THEN 'Exxon Mobil Corporation'
  WHEN stock_symbol = 'BA' THEN 'The Boeing Company'
  WHEN stock_symbol = 'PG' THEN 'Procter & Gamble Company'
  WHEN stock_symbol = 'UL' THEN 'Unilever PLC'
  WHEN stock_symbol = 'F' THEN 'Ford Motor Company'
  WHEN stock_symbol = 'GM' THEN 'General Motors Company'
  WHEN stock_symbol = 'WMT' THEN 'Walmart Inc.'
  WHEN stock_symbol = 'COST' THEN 'Costco Wholesale Corporation'
  WHEN stock_symbol = 'HD' THEN 'The Home Depot, Inc.'
  WHEN stock_symbol = 'TGT' THEN 'Target Corporation'
  ELSE stock_name
END
WHERE stock_symbol IN ('AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA', 'AMZN', 'TSLA', 'DIS', 'NFLX', 'KO', 'PEP', 'MCD', 'SBUX', 'NKE', 'JPM', 'BAC', 'JNJ', 'PFE', 'XOM', 'BA', 'PG', 'UL', 'F', 'GM', 'WMT', 'COST', 'HD', 'TGT');