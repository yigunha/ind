import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const uploadDir = path.join(process.cwd(), 'public/uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({ multiples: false, uploadDir, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ Form parsing error:", err);
      return res.status(500).json({ error: 'Form parsing failed' });
    }

    if (!files.file) {
      console.error("❌ No file uploaded");
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = files.file.filepath;
    console.log("📁 Uploaded file path:", filePath);

    try {
      // TODO: 엑셀 파싱 후 Supabase 저장 로직 삽입 예정
      return res.status(200).json({ message: 'File uploaded successfully' });
    } catch (e) {
      console.error("❌ File processing error:", e);
      return res.status(500).json({ error: 'Failed to process file' });
    }
  });
}
