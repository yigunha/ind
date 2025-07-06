// pages/api/login.js
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { username, password } = req.body;

  const { data: users, error } = await supabase
    .from('users')
    .select('id, username, password, role') // 'id' 컬럼을 반드시 선택해야 합니다.
    .eq('username', username);

  if (error || users.length === 0) {
    return res.status(401).json({ message: '존재하지 않는 사용자입니다.' });
  }

  const user = users[0];

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
  }

  // JWT 토큰 생성 시 userId를 포함
  const token = jwt.sign(
    { userId: user.id, username: user.username, userRole: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // ★★★ 로그인 성공 시 응답에 userId를 명시적으로 포함해야 합니다. ★★★
  return res.status(200).json({
    message: '로그인 성공',
    token,
    userRole: user.role,
    username: user.username,
    userId: user.id, // <<<<< 이 부분이 userId를 클라이언트로 보내는 핵심입니다!
  });
}