import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// formidable 파서 설정 (파일 저장 경로 등)
export const config = {
  api: {
    bodyParser: false, // formidable이 본문을 처리하므로 Next.js의 bodyParser 비활성화
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const form = formidable({
    uploadDir: path.join(process.cwd(), 'public/uploads'), // 파일이 저장될 경로
    keepExtensions: true, // 원본 파일 확장자 유지
    maxFileSize: 10 * 1024 * 1024, // 10MB 제한
  });

  try {
    await fs.promises.mkdir(form.options.uploadDir, { recursive: true }); // 디렉토리가 없으면 생성

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ error: 'Error parsing form data' });
      }

      const excelFile = files.excel[0]; // formidable@3 이상에서는 files.fieldName이 배열입니다.
      if (!excelFile) {
        return res.status(400).json({ error: 'No Excel file uploaded.' });
      }

      // 파일 처리 로직 (예: DB 저장, 내용 읽기 등)
      // 여기서는 단순히 성공 메시지를 보냅니다.
      console.log('Upload successful:', excelFile.filepath);

      res.status(200).json({ message: 'Upload successful!', path: excelFile.filepath });
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'File upload failed.' });
  }
}