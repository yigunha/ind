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
        console.error('JSON 파싱 실패:', err);
      }

      if (response.ok) {
        localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('userRole', data.userRole);
        localStorage.setItem('username', data.username);
        localStorage.setItem('isLoggedIn', 'true');

        if (data.userRole === 'admin') router.push('/gwan-ri-ja');
        else if (data.userRole === 'teacher') router.push('/teacher');
        else if (data.userRole === 'student') router.push('/student');
        else setError('알 수 없는 사용자 역할입니다.');
      } else {
        setError(data?.message || '로그인 실패');
      }
    } catch (err) {
      setError('네트워크 또는 서버 오류');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>로그인</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
        {error && <p className="error-text">{error}</p>}
      </form>
    </div>
  );
}
