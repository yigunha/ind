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

  console.log('클라이언트에서 받은 요청:', { username, password });

  const { data: users, error } = await supabase
    .from('users')
    .select('id, username, password, role')
    .eq('username', username);

  if (error || users.length === 0) {
    return res.status(401).json({ message: '존재하지 않는 사용자입니다.' });
  }

  const user = users[0];

// 사용자 조회 후
if (user) {
  console.log("입력된 유저명:", username);
  console.log("입력된 비밀번호:", password);
  console.log("조회된 유저:", user);
}

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
  }

  const token = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      userRole: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return res.status(200).json({
    message: 'Login successful',
    token,
    userRole: user.role,
    username: user.username,
  });
}




