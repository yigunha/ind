// pages/login.js
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
        // localStorage에 인증 정보 저장
        localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('userRole', data.userRole);
        localStorage.setItem('username', data.username);
        localStorage.setItem('userId', data.userId); // <<<<< 서버에서 받은 userId를 localStorage에 저장합니다!
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
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
      <style jsx>{`
        .login-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          background-color: #f0f2f5;
          font-family: Arial, sans-serif;
        }
        h1 {
          color: #333;
          margin-top: 30px;
          margin-bottom: 30px;

        }
        form {
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
          max-width: 400px;
        }
        input[type='text'],
        input[type='password'] {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
        button {
          padding: 12px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 18px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        button:hover:not(:disabled) {
          background-color: #0056b3;
        }
        button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        .error-message {
          color: red;
          font-size: 14px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}