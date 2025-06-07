const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const bcrypt = require('bcrypt');
const pg = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/users', upload.single('excelFile'), async (req, res) => {
  if (!req.file) return res.status(400).send('파일이 없습니다.');

  const mode = req.body.mode || 'append'; // 기본값: 추가 업로드

  const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const users = xlsx.utils.sheet_to_json(sheet);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (mode === 'replace') {
      await client.query('DELETE FROM users');
    }
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password.toString(), 10);
      await client.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) ON CONFLICT (username) DO NOTHING',
        [user.username, hashedPassword, user.role]
      );
    }
    await client.query('COMMIT');
    res.send(`업로드 완료 (${users.length}명)`);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).send('DB 저장 중 오류 발생');
  } finally {
    client.release();
  }
});

router.post('/users/delete', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM users');
    res.send('모든 사용자가 삭제되었습니다.');
  } catch (err) {
    res.status(500).send('삭제 중 오류 발생');
  } finally {
    client.release();
  }
});

module.exports = router;
