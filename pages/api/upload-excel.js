import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import { read, utils } from 'xlsx';

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
    if (err) {
      console.error('Form parsing error:', err);
      return res.status(500).send('파일 파싱 실패');
    }

    const file = files.file;
    if (!file) return res.status(400).send('파일 없음');

    try {
      const buffer = await fileToBuffer(file);
      const workbook = read(buffer);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = utils.sheet_to_json(sheet);

      for (const row of jsonData) {
        const { id, password, role } = row;
        const { error } = await supabase.from('users').insert([
          { id, password, role },
        ]);
        if (error) {
          console.error('Insert error:', error);
        }
      }

      res.status(200).send('업로드 성공');
    } catch (e) {
      console.error('Error:', e);
      res.status(500).send('업로드 실패');
    }
  });
}

function fileToBuffer(file) {
  return new Promise((resolve, reject) => {
