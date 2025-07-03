import { useState } from 'react';

export default function GwanRiJaPage() {
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    const fileInput = document.getElementById('excelFile');
    if (!fileInput || !fileInput.files.length) {
      alert('파일을 선택하세요');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    const res = await fetch('/api/upload-excel', {
      method: 'POST',
      body: formData,
    });

    const json = await res.json();
    setResult(json);
  };

  return (
    <div>
      <h1>학생 엑셀 업로드</h1>
      <input type="file" id="excelFile" accept=".xlsx" />
      <button onClick={handleUpload}>업로드</button>
      {result && (
        <div>
          <p>성공: {result.success}</p>
          <p>실패: {result.failed}</p>
        </div>
      )}
    </div>
  );
}
