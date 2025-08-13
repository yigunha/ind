// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';

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
      // Supabase 인증 시 email 필드 사용
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      });

      if (signInError) throw signInError;

      // 로그인 성공 후 유저 role 조회
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('role, username')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      // 필요한 최소한의 데이터만 localStorage에 저장
      localStorage.setItem('userRole', userProfile.role);
      localStorage.setItem('username', userProfile.username);
      localStorage.setItem('isLoggedIn', 'true');

      // role에 따라 페이지 이동
      if (userProfile.role === 'admin') router.push('/gwan-ri-ja');
      else if (userProfile.role === 'teacher') router.push('/teacher');
      else if (userProfile.role === 'student') router.push('/student');
      else setError('알 수 없는 사용자 역할입니다.');

    } catch (err) {
      console.error('로그인 오류:', err);
      setError(err.message || '아이디 또는 비밀번호가 잘못되었습니다.');
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
          min-height: 100vh;
          background-color: #f0f2f5;
          font-family: Arial, sans-serif;
        }
        h1 {
          color: #333;
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
