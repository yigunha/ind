// pages/gwan-ri-ja.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import FileUpload from '../components/FileUpload'; // 파일 업로드 컴포넌트 임포트

export default function GwanRiJaPage() {
  const router = useRouter();
  const [username, setUsername] = useState(''); // 사용자 이름 표시용 상태

  useEffect(() => {
    // 로컬 스토리지에서 사용자 이름 가져와 표시 (UX 개선 목적)
    const storedUsername = localStorage.getItem('username'); // 로그인 시 사용자 이름도 저장하면 좋음
    if (storedUsername) {
      setUsername(storedUsername);
    }
    // 실제 사용자 이름은 JWT에서 디코딩하여 서버 측에서 확인하는 것이 더 정확하고 안전합니다.
  }, []);

  const handleLogout = () => {
    // 로컬 스토리지에서 모든 인증 정보 제거
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username'); // 저장했다면 제거

    // 로그인 페이지로 리다이렉트
    router.replace('/login');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333' }}>관리자 페이지</h1>
      <p>환영합니다, {username || '관리자'}님!</p>
      <button
        onClick={handleLogout}
        style={{
          padding: '10px 15px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '30px'
        }}
      >
        로그아웃
      </button>

      <hr style={{ margin: '30px 0', borderColor: '#eee' }} />

      {/* 파일 업로드 기능 포함 */}
      <FileUpload />
    </div>
  );
}