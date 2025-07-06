<<<<<<< HEAD
// pages/teacher.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function TeacherPage() {
  const router = useRouter();
  const [username, setUsername] = useState(''); // 사용자 이름 표시용 상태

  useEffect(() => {
    // 로컬 스토리지에서 사용자 이름 가져와 표시 (UX 개선 목적)
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    // 로컬 스토리지에서 모든 인증 정보 제거
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');

    // 로그인 페이지로 리다이렉트
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
          marginRight: '10px', // 버튼 간격
          marginBottom: '30px'
        }}
      >
        로그아웃
      </button>

      <button
        onClick={handleGoToReceivePage}
        style={{
          padding: '10px 15px',
          backgroundColor: '#28a745', // 초록색 버튼
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
      {/* 선생님을 위한 추가 기능이나 정보가 여기에 들어갈 수 있습니다. */}
    </div>
  );
=======
// pages/teacher.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function TeacherPage() {
  const router = useRouter();
  const [username, setUsername] = useState(''); // 사용자 이름 표시용 상태

  useEffect(() => {
    // 로컬 스토리지에서 사용자 이름 가져와 표시 (UX 개선 목적)
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    // 로컬 스토리지에서 모든 인증 정보 제거
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');

    // 로그인 페이지로 리다이렉트
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
          marginRight: '10px', // 버튼 간격
          marginBottom: '30px'
        }}
      >
        로그아웃
      </button>

      <button
        onClick={handleGoToReceivePage}
        style={{
          padding: '10px 15px',
          backgroundColor: '#28a745', // 초록색 버튼
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
      {/* 선생님을 위한 추가 기능이나 정보가 여기에 들어갈 수 있습니다. */}
    </div>
  );
>>>>>>> 7adfbd1c97ca611d06e414ca80d620744c064b3a
}