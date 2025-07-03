import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const uploadDir = path.join(process.cwd(), 'public/uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = new formidable.IncomingForm({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('❌ Formidable 오류:', err);
      return res.status(500).json({ error: '파일 업로드 실패' });
    }

    if (!files.file) {
      return res.status(400).json({ error: '파일이 없습니다.' });
    }

    const uploadedFile = files.file[0];
    console.log('✅ 업로드된 파일:', uploadedFile.originalFilename);

    return res.status(200).json({ message: '업로드 성공', fileName: uploadedFile.originalFilename });
  });
}
