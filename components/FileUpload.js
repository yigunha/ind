// components/FileUpload.js
import { useState } from 'react';
import * as XLSX from 'xlsx'; // xlsx 파싱 라이브러리 임포트

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // 업로드 로딩 상태

  const handleFileChange = (e) => {
    setMessage(''); // 새 파일 선택 시 메시지 초기화
    setFile(e.target.files[0]); // 선택된 파일 저장
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('업로드할 Excel 파일을 선택해주세요.');
      return;
    }

    setMessage('파일을 읽는 중...');
    setLoading(true);

    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' }); // Excel 파일 읽기
        const sheetName = workbook.SheetNames[0]; // 첫 번째 시트 이름 가져오기
        const worksheet = workbook.Sheets[sheetName]; // 첫 번째 시트 데이터 가져오기

        // 시트 데이터를 JSON 배열로 변환
        // header: 1 옵션은 첫 번째 행을 헤더로 사용하여 객체 배열로 변환합니다.
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // 첫 번째 행은 헤더이므로 건너뛰고 실제 데이터만 사용
        const usersToUpload = jsonData.slice(1).map(row => ({
          username: row[0], // Excel 첫 번째 컬럼이 username이라고 가정
          password: row[1], // Excel 두 번째 컬럼이 password라고 가정
          role: row[2] || 'student', // Excel 세 번째 컬럼이 role, 없으면 'student' 기본값
        }));

        // Supabase DB에 데이터 전송을 위한 API 라우트 호출
        setMessage('데이터를 서버로 전송 중...');
        const token = localStorage.getItem('jwt_token'); // 로컬 스토리지에서 JWT 토큰 가져오기

        if (!token) {
          setMessage('로그인 토큰을 찾을 수 없습니다. 다시 로그인해주세요.');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/upload-excel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // JWT 토큰을 Authorization 헤더에 포함
          },
          body: JSON.stringify(usersToUpload), // 파싱된 사용자 데이터를 JSON 문자열로 변환하여 전송
        });

        const result = await response.json(); // 서버 응답 파싱

        if (response.ok) {
          setMessage(result.message || '파일 업로드 및 데이터 저장이 성공적으로 완료되었습니다.');
          setFile(null); // 파일 선택 초기화
        } else {
          setMessage(`업로드 실패: ${result.message || '서버 오류가 발생했습니다.'}`);
        }

      };

      reader.onerror = (error) => {
        console.error('파일 읽기 오류:', error);
        setMessage('파일을 읽는 중 오류가 발생했습니다.');
        setLoading(false);
      };

      reader.readAsArrayBuffer(file); // 파일을 ArrayBuffer로 읽기

    } catch (error) {
      console.error('파일 처리 중 오류:', error);
      setMessage('파일 처리 중 예상치 못한 오류가 발생했습니다.');
    } finally {
      // FileReader의 onload/onerror가 끝난 후에 setLoading(false)가 호출되도록 함
      // 이 부분이 중요함: reader.onload 내에서 setLoading(false)를 호출해야 합니다.
    }
  };

  return (
    <div style={{
        border: '1px solid #ddd',
        padding: '20px',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        marginBottom: '30px'
    }}>
      <h2 style={{ color: '#333', marginTop: '0' }}>Excel 사용자 데이터 업로드 (.xlsx)</h2>
      <p style={{ color: '#666', fontSize: '0.9em' }}>
        파일은 첫 번째 시트에 `username`, `password`, `role` 순서로 컬럼이 있어야 합니다.
        (`role`이 없으면 `student`로 기본 설정됩니다.)
      </p>
      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileChange}
        disabled={loading} // 로딩 중 비활성화
        style={{ marginBottom: '15px' }}
      />
      <button
        onClick={handleUpload}
        disabled={!file || loading} // 파일이 없거나 로딩 중이면 버튼 비활성화
        style={{
          padding: '10px 20px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: (!file || loading) ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.3s ease',
          fontWeight: 'bold'
        }}
      >
        {loading ? '업로드 중...' : '업로드'}
      </button>
      {message && <p style={{
          marginTop: '15px',
          color: message.startsWith('업로드 실패') ? 'red' : 'green',
          fontWeight: 'bold'
      }}>{message}</p>}
    </div>
  );
}