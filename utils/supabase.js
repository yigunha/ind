// utils/supabase.js
import { createClient } from '@supabase/supabase-js'

// .env.local 파일에서 환경 변수를 가져옵니다.
// NEXT_PUBLIC_ 접두사가 붙은 환경 변수는 클라이언트 측 코드에서 접근 가능합니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 환경 변수가 올바르게 설정되었는지 확인 (개발 단계에서 유용)
// 이 로그는 브라우저 콘솔과 서버 측 (Next.js 개발 서버) 콘솔 모두에 나타날 수 있습니다.
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Check your .env.local file.');
  console.error('Current Supabase URL:', supabaseUrl);
  console.error('Current Supabase Anon Key:', supabaseAnonKey ? '***** (present)' : 'not present');
  // 실제 프로덕션에서는 이 대신 애플리케이션 크래시 또는 오류 페이지로 리디렉션할 수 있습니다.
  // 예를 들어, throw new Error('Supabase configuration missing');
}

// Supabase 클라이언트 인스턴스를 생성하여 내보냅니다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);