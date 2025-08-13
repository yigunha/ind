// pages/student.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { storage } from '../utils/storage'; // 새로운 storage 유틸리티 import

export default function StudentPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUsername = storage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    // storage 유틸리티를 사용해서 모든 데이터 제거
    storage.removeItem('jwt_token');
    storage.removeItem('userRole');
    storage.removeItem('isLoggedIn');
    storage.removeItem('username');
    storage.removeItem('userId');
    router.replace('/login');
  };

  const handleGoToSelection = () => {
    router.push('/select-4send1');
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
    </div>
  );
}