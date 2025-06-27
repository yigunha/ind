// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault(); // 폼 기본 제출 동작 방지
    setError(null); // 에러 메시지 초기화
    setLoading(true); // 로딩 시작

    if (!username || !password) {
      setError('ID와 비밀번호를 모두 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      // 1. Next.js API 라우트 (/api/login)로 로그인 요청 전송
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 2. 로그인 성공 시, JWT와 사용자 역할 저장 및 페이지 리다이렉션
        localStorage.setItem('jwt_token', data.token); // JWT 토큰 저장
        localStorage.setItem('userRole', data.userRole); // 사용자 역할 저장
        localStorage.setItem('isLoggedIn', 'true'); // 로그인 상태 표시 (보조적 역할)

        switch (data.userRole) {
          case 'admin':
            router.push('/gwan-ri-ja'); // Next.js에서는 .js 파일명이 경로가 됩니다.
            break;
          case 'teacher':
            router.push('/teacher');
            break;
          case 'student':
            router.push('/student');
            break;
          default:
            // 예상치 못한 역할인 경우
            setError('알 수 없는 사용자 역할입니다. 관리자에게 문의하세요.');
            // 혹시 모르니 토큰 및 역할 삭제 (보안 강화)
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('isLoggedIn');
            break;
        }
      } else {
        // 3. 로그인 실패 시, 에러 메시지 표시
        setError(data.message || '로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error('클라이언트 로그인 요청 오류:', err);
      setError('네트워크 오류 또는 서버 응답 오류가 발생했습니다.');
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  return (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '400px',
          boxSizing: 'border-box'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>로그인</h1>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="username" style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>ID:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
              }}
              disabled={loading} // 로딩 중에는 입력 비활성화
            />
          </div>
          <div style={{ marginBottom: '30px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>비밀번호:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
              }}
              disabled={loading} // 로딩 중에는 입력 비활성화
            />
          </div>
          {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading} // 로딩 중에는 버튼 비활성화
            style={{
                padding: '12px 20px',
                backgroundColor: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '18px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s ease',
                fontWeight: 'bold'
            }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}