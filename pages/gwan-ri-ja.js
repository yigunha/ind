import { useState } from 'react';

export default function GwanRiJa() {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('excelFile');
    if (!fileInput.files.length) {
      alert('파일을 선택하세요.');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    setUploading(true);

    try {
      const res = await fetch('/api/upload-excel', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("❌ Upload failed:", result.error);
        alert("업로드 실패: " + result.error);
      } else {
        console.log("✅ Upload success:", result.message);
        alert("업로드 성공!");
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      alert("서버 오류: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2>관리자 엑셀 업로드</h2>
      <form onSubmit={handleUpload}>
        <input type="file" id="excelFile" accept=".xlsx,.xls" />
        <button type="submit" disabled={uploading}>
          {uploading ? "업로드 중..." : "업로드"}
        </button>
      </form>
    </div>
  );
}
