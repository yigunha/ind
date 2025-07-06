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

  // console.log('클라이언트에서 받은 요청:', { username, password }); // 디버깅용

  const { data: users, error } = await supabase
    .from('users')
    .select('id, username, password, role') // id를 select에 포함시킴
    .eq('username', username);

  if (error || users.length === 0) {
    return res.status(401).json({ message: '존재하지 않는 사용자입니다.' });
  }

  const user = users[0];

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
  }

  // 비밀번호가 일치하면 JWT 토큰 생성
  const token = jwt.sign(
    { userId: user.id, username: user.username, userRole: user.role }, // user.id를 페이로드에 포함
    process.env.JWT_SECRET,
    { expiresIn: '1h' } // 토큰 유효 기간 1시간 설정
  );

  // 로그인 성공 시 응답
  return res.status(200).json({
    message: '로그인 성공',
    token,
    userRole: user.role,
    username: user.username,
    userId: user.id, // <<<<< 이 부분이 가장 중요합니다! 이 부분을 꼭 포함시켜야 합니다.
  });
}