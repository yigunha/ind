// utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 환경 변수 디버깅
console.log('Environment check:');
console.log('URL present:', !!supabaseUrl);
console.log('Key present:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing in environment variables.');
  console.error('URL:', supabaseUrl);
  console.error('Key:', supabaseAnonKey ? 'Present' : 'Missing');
  
  // 개발 환경에서만 오류를 발생시키고, 배포 환경에서는 더미 클라이언트 생성
  if (process.env.NODE_ENV === 'development') {
    throw new Error('Supabase environment variables are not set!');
  } else {
    // 배포 환경에서는 더미 클라이언트로 404 오류 방지
    console.warn('Creating dummy Supabase client due to missing environment variables');
  }
}

// 환경 변수가 없을 때 더미 값으로 클라이언트 생성 (404 오류 방지)
const finalUrl = supabaseUrl || 'https://dummy.supabase.co';
const finalKey = supabaseAnonKey || 'dummy-key';

export const supabase = createClient(finalUrl, finalKey);

// 환경 변수가 제대로 설정되었는지 확인하는 함수
export const checkSupabaseConfig = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};
