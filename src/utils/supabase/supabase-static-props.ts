import { createClient as createClientPrimitive } from '@supabase/supabase-js';
import { Database } from '@/types';

export const createClientStaticProps = () =>
  createClientPrimitive<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
