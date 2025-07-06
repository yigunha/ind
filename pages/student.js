// pages/student.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function StudentPage() {
  const router = useRouter();
  const [username, setUsername] = useState(''); // 사용자 이름 표시용 상태

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userId'); // userId도 로그아웃 시 제거
    router.replace('/login');
  };

  const handleGoToSelection = () => {
    router.push('/select-4send'); // select-4send 페이지로 이동
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333' }}>학생 페이지</h1>
      <p>환영합니다, {username || '학생'}님!</p>
      <button
        onClick={handleLogout}
        style={{
          padding: '10px 15px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginRight: '10px',
          marginBottom: '30px'
        }}
      >
        로그아웃
      </button>

      <button
        onClick={handleGoToSelection}
        style={{
          padding: '10px 15px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '30px'
        }}
      >
        선택 페이지로 이동
      </button>

      {/* 기타 학생 관련 기능 여기에 추가 */}
    </div>
  );
}