const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pg = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// 세션ID를 저장할 Map (실제 서비스는 DB/Redis 등 사용 권장)
const userSessionMap = new Map();

// 로그인
router.post('/login', async (req, res) => {
  // 이미 로그인된 사용자는 거부
  if (req.session.user) {
    return res.status(403).send('이미 로그인된 사용자입니다.');
  }

  const { username, password, rememberMe } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(401).send('사용자를 찾을 수 없습니다.');
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send('비밀번호 불일치');

    // 기존 세션이 있으면 강제 로그아웃
    const prevSession = userSessionMap.get(username);
    if (prevSession && req.sessionStore) {
      req.sessionStore.destroy(prevSession, () => {});
    }

    req.session.user = {
      username: user.username,
      role: user.role
    };

    // 세션ID 저장
    userSessionMap.set(username, req.sessionID);

    // 자동 로그인(세션 만료 시간 연장)
    if (rememberMe) {
      req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 7일
    } else {
      req.session.cookie.expires = false; // 브라우저 세션 쿠키(브라우저 종료시 만료)
    }

    if (user.role === 'teacher') return res.redirect('/teacher.html');
    else return res.redirect('/student.html');
  } catch (err) {
    res.status(500).send('서버 오류');
  } finally {
    client.release();
  }
});

// 로그아웃 시 세션ID 제거
router.post('/logout', (req, res) => {
  if (req.session && req.session.user) {
    userSessionMap.delete(req.session.user.username);
  }
  req.session.destroy(() => {
    res.redirect('/index.html'); // ← 여기만 수정
  });
});

module.exports = router;
