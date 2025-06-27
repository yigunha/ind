import { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!username || !password) {
      setError('ID와 비밀번호를 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (err) {
        console.error('JSON 파싱 오류:', err);
      }

      if (response.ok) {
        localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('userRole', data.userRole);
        localStorage.setItem('username', data.username);
        localStorage.setItem('isLoggedIn', 'true');

        switch (data.userRole) {
          case 'admin':
            router.push('/gwan-ri-ja');
            break;
          case 'teacher':
            router.push('/teacher');
            break;
          case 'student':
            router.push('/student');
            break;
          default:
            setError('알 수 없는 사용자 역할입니다.');
        }
      } else {
        setError(data?.message || '로그인 실패');
      }
    } catch (err) {
      console.error('요청 오류:', err);
      setError('네트워크 또는 서버 오류입니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial' }}>
      <h1>로그인</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="ID"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />
        <br />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}
