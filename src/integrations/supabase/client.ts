import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://xxxx.supabase.co";
const supabaseAnonKey = "xxxx";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);