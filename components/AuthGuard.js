// components/AuthGuard.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken'; // JWT 디코딩을 위해 필요

// 역할별 리다이렉트 경로 맵 (권한이 없을 때 이동할 페이지)
const roleRedirectMap = {
  admin: '/gwan-ri-ja',
  teacher: '/teacher',
  student: '/student',
  // 다른 역할이 있다면 여기에 추가
};

export default function AuthGuard({ children, allowedRoles }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // 인증 상태 확인 중 로딩 상태

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem('jwt_token'); // 로컬 스토리지에서 JWT 가져오기

      // 1. 토큰이 없는 경우 (로그인되지 않음)
      if (!token) {
        // 현재 페이지가 로그인 페이지가 아니면 로그인 페이지로 리다이렉트
        if (router.pathname !== '/login') {
          router.replace('/login');
        } else {
          setLoading(false); // 이미 로그인 페이지면 로딩 완료
        }
        return;
      }

      try {
        // 2. JWT 디코딩 및 검증 (클라이언트 측 검증은 참고용이며, 서버 측 검증이 필수적)
        // 실제 프로덕션에서는 서버 API를 통해 토큰 유효성 및 만료를 검사하는 것이 더 안전합니다.
        const decoded = jwt.decode(token); // 토큰 디코딩 (서명 검증X)
        const currentTime = Date.now() / 1000; // 현재 시간 (초)

        // 토큰 만료 여부 확인
        if (!decoded || decoded.exp < currentTime) {
          console.log('JWT 토큰 만료 또는 유효하지 않음');
          // 토큰 만료 시 로컬 스토리지에서 제거하고 로그인 페이지로 리다이렉트
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('isLoggedIn');
          if (router.pathname !== '/login') {
            router.replace('/login');
          } else {
            setLoading(false);
          }
          return;
        }

        const userRole = decoded.userRole; // 디코딩된 토큰에서 역할 정보 추출

        // 3. 허용된 역할과 현재 사용자의 역할 비교
        // allowedRoles가 정의되어 있고, 현재 사용자의 역할이 allowedRoles에 포함되어 있지 않은 경우
        if (allowedRoles && !allowedRoles.includes(userRole)) {
          console.log(`Access Denied: ${userRole} cannot access ${router.pathname}. Redirecting.`);
          const redirectPath = roleRedirectMap[userRole] || '/login'; // 해당 역할의 기본 페이지 또는 로그인 페이지로
          router.replace(redirectPath);
          return;
        }

        // 모든 검증 통과
        setLoading(false);

      } catch (error) {
        console.error('JWT 토큰 처리 오류:', error);
        // 토큰이 유효하지 않은 경우 로그인 페이지로 리다이렉트
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('isLoggedIn');
        if (router.pathname !== '/login') {
          router.replace('/login');
        } else {
          setLoading(false);
        }
      }
    };

    checkAuth();
  }, [router, allowedRoles]); // router 객체와 allowedRoles가 변경될 때마다 재실행

  // 로딩 중이거나 권한 확인 중일 때 표시할 내용
  if (loading) {
    return (
      <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          fontSize: '24px',
          color: '#555'
      }}>
        인증 확인 중...
      </div>
    );
  }

  // 모든 검증 통과 시 자식 컴포넌트 렌더링
  return children;
}