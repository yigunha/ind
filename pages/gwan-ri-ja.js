import { useState } from 'react';

export default function GwanRiJa() {
  const [uploadResult, setUploadResult] = useState(null);

  const handleUpload = async () => {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput || !fileInput.files.length) {
      alert('파일을 선택하세요');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
      const res = await fetch('/api/upload-excel', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      setUploadResult(result);
    } catch (error) {
      console.error('업로드 실패:', error);
      alert('업로드 중 오류 발생');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>관리자 엑셀 업로드</h2>

      <input type="file" id="fileInput" accept=".xlsx" />
      <button onClick={handleUpload}>업로드</button>

      {uploadResult && (
        <div style={{ marginTop: '10px', color: 'green' }}>
          업로드 결과: {JSON.stringify(uploadResult)}
        </div>
      )}
    </div>
  );
}
