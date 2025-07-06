// utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing in environment variables.');
  // 개발 환경에서만 오류를 발생시키고, 배포 환경에서는 조용히 넘어갈 수 있도록 처리
  if (process.env.NODE_ENV === 'development') {
    throw new Error('Supabase environment variables are not set!');
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);