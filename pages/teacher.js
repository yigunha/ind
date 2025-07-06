// pages/teacher.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function TeacherPage() {
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
    router.replace('/login');
  };

  const handleGoToReceivePage = () => {
    router.push('/select-4receive'); // select-4receive 페이지로 이동
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333' }}>선생님 페이지</h1>
      <p>환영합니다, {username || '선생님'}님!</p>
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
        onClick={handleGoToReceivePage}
        style={{
          padding: '10px 15px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '30px'
        }}
      >
        학생 선택 현황 보기 (select-4receive)
      </button>

      <hr style={{ margin: '30px 0', borderColor: '#eee' }} />

      <p>이곳은 선생님만 접근할 수 있는 페이지입니다. 여기에 선생님 관련 내용을 추가하세요.</p>
    </div>
  );
}