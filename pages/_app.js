// pages/_app.js
import '../styles/globals.css'; // 전역 CSS 파일 (기본적으로 존재할 수 있음)
import AuthGuard from '../components/AuthGuard'; // AuthGuard 컴포넌트 임포트
import { useRouter } from 'next/router';

// 각 경로에 허용된 역할을 정의 (이 부분을 수정하여 권한 설정)
const authRoutes = {
  '/gwan-ri-ja': ['admin'],
  '/teacher': ['teacher', 'admin'], // 선생님 페이지는 선생님과 관리자 모두 접근 가능
  '/student': ['student', 'teacher', 'admin'], // 학생 페이지는 모든 역할 접근 가능
  // 필요에 따라 더 많은 경로와 역할 추가
};

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // 로그인 페이지는 AuthGuard의 적용을 받지 않습니다.
  const isLoginPage = router.pathname === '/login';

  // AuthGuard에 필요한 allowedRoles를 동적으로 결정
  const allowedRoles = authRoutes[router.pathname];

  return (
    <>
      {isLoginPage ? (
        <Component {...pageProps} />
      ) : (
        // 로그인 페이지가 아닌 경우에만 AuthGuard로 감쌈
        <AuthGuard allowedRoles={allowedRoles}>
          <Component {...pageProps} />
        </AuthGuard>
      )}
    </>
  );
}

export default MyApp;