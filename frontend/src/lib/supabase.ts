import { createClient } from '@supabase/supabase-js';
// We use a clean type import to prevent bundler strictness issues
import type { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase Environment Variables inside .env file');
}

// Fallback to any if the strict interface mapping has a declaration mismatch
export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey);