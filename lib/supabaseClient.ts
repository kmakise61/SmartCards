import { createClient } from '@supabase/supabase-js';

// Credentials provided by the user
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://vtzgxhgpthmrqcukrtkw.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_sudHaHtazrsHacjoSomM6w_4FXWgG0L';

export const supabase = createClient(supabaseUrl, supabaseKey);