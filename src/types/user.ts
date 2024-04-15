import { Database } from '@/types/supabase';
import { User } from '@supabase/supabase-js';

export type CombinedUserType = User & Database['public']['Tables']['profile']['Row'];
