import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

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
    // 업로드 디렉토리가 없으면 생성 (재귀적으로)
    await fs.promises.mkdir(form.options.uploadDir, { recursive: true });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ error: 'Error parsing form data' });
      }

      // 'excel'은 파일 입력 필드의 name 속성입니다.
      // formidable@3 이상에서는 files.fieldName이 배열 형태입니다.
      const excelFile = files.excel ? files.excel[0] : null; 
      if (!excelFile) {
        return res.status(400).json({ error: 'No Excel file uploaded.' });
      }

      console.log('Upload successful:', excelFile.filepath);

      res.status(200).json({ message: 'Upload successful!', path: excelFile.filepath });
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'File upload failed.' });
  }
}