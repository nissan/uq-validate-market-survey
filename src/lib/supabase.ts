import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

console.log('Initializing Supabase client with:', { supabaseUrl, hasAnonKey: !!supabaseAnonKey });

export const supabase = createClient(supabaseUrl, supabaseAnonKey);