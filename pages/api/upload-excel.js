import formidable from 'formidable';
import * as XLSX from 'xlsx';
import fs from 'fs';
import bcrypt from 'bcryptjs';
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

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: '파일 파싱 오류' });

    const file = files.file;
    const workbook = XLSX.readFile(file.filepath);
    const sheetName = workbook.SheetNames[0];
    const users = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      const { username, password, role } = user;
      if (!username || !password) {
        failCount++;
        continue;
      }

      const hashed = await bcrypt.hash(String(password), 10);

      const { error } = await supabase.from('users').insert({
        username,
        password: hashed,
        role: role || 'student',
      });

      if (error) {
        failCount++;
      } else {
        successCount++;
      }
    }

    res.status(200).json({
      message: '업로드 완료',
      success: successCount,
      failed: failCount,
    });
  });
}
