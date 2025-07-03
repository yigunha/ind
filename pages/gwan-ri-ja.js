import { useState } from 'react';

export default function GwanRiJa() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('파일을 선택해주세요');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/upload-excel', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        alert('업로드 성공');
      } else {
        alert(`서버 오류: ${result.error}`);
      }
    } catch (error) {
      alert(`서버 오류: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>관리자 엑셀 업로드</h2>
      <input type="file" accept=".xlsx" onChange={handleFileChange} />
      <button onClick={handleUpload}>업로드</button>
    </div>
  );
}
