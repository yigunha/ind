import { useState } from 'react';

export default function GwanRiJaPage() {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert('파일을 선택해주세요.');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload-excel', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('❌ 서버 오류:', text);
        alert('서버 오류: ' + text);
        return;
      }

      const result = await res.json();
      console.log('✅ 업로드 결과:', result);
      alert('업로드 성공!');
    } catch (err) {
      console.error('❌ 예외 발생:', err);
      alert('예외 발생: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '2rem', color: 'white' }}>
      <h1>관리자 엑셀 업로드</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} style={{ marginLeft: '1rem' }}>업로드</button>
    </div>
  );
}
