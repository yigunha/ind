import formidable from 'formidable';
import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

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

  const form = new formidable.IncomingForm();
  form.uploadDir = './';
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) {
      return res.status(400).json({ error: '파일 업로드 실패' });
    }

    const filepath = files.file[0].filepath;
    const workbook = XLSX.readFile(filepath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    let failed = 0;

    for (const row of jsonData) {
      const { id, password, role } = row;
      const { error } = await supabase.from('users').insert([{ id, password, role }]);
      if (error) {
        console.error('Insert error:', error);
        failed++;
      }
    }

    fs.unlinkSync(filepath); // 업로드 파일 삭제

    return res.status(200).json({
      success: jsonData.length - failed,
      failed,
    });
  });
}
