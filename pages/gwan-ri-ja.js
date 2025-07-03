import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function GwanRiJaPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) setUsername(storedUsername);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    router.replace('/login');
  };

  const handleUpload = async () => {
    if (!file) return alert('엑셀 파일을 선택하세요.');

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload-excel', {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();
    setUploadResult(result);
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

      {/* 엑셀 업로드 UI */}
      <h3>엑셀로 사용자 업로드</h3>
      <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} style={{ marginLeft: '10px' }}>
        업로드
      </button>

      {uploadResult && (
        <div style={{ marginTop: '20px', color: 'green' }}>
          ✅ 업로드 결과: 성공 {uploadResult.success}명 / 실패 {uploadResult.failed}명
        </div>
      )}
    </div>
  );
}
