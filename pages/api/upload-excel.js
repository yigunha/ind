import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import xlsx from 'xlsx';

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(process.cwd(), '/public/uploads');
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: '파일 파싱 오류' });

    const file = files.file;
    if (!file || !file.filepath) {
      return res.status(400).json({ error: '파일이 없습니다.' });
    }

    try {
      const workbook = xlsx.readFile(file.filepath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      let success = 0, failed = 0;
      for (const row of data) {
        const { id, name, class: className } = row;
        if (!id || !name || !className) {
          failed++;
          continue;
        }

        const { error } = await supabase.from('students').insert([{ id, name, class: className }]);
        if (error) failed++;
        else success++;
      }

      fs.unlinkSync(file.filepath); // 업로드된 파일 삭제
      return res.status(200).json({ success, failed });

    } catch (e) {
      return res.status(500).json({ error: '파일 처리 오류', detail: e.message });
    }
  });
}
