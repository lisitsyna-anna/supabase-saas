import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types';

// Note: supabaseAdmin uses the SUPABASE_SERVICE_KEY which you must only use in a secure server-side context
// as it has admin privileges and overwrites RLS policies!

export const createClientAdmin = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || ''
  );
