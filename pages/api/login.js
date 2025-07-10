// pages/api/login.js
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // CORS 헤더 추가
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { username, password } = req.body;

    // 입력값 검증
    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        message: '사용자명과 비밀번호를 모두 입력해주세요.' 
      });
    }

    console.log('로그인 시도:', username); // 디버깅용

    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, password, role')
      .eq('username', username);

    console.log('DB 조회 결과:', { users, error }); // 디버깅용

    if (error) {
      console.error('DB 에러:', error);
      return res.status(500).json({ 
        success: false,
        message: '서버 오류가 발생했습니다.' 
      });
    }

    if (!users || users.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: '존재하지 않는 사용자입니다.' 
      });
    }

    const user = users[0];

    // 비밀번호 검증
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: '비밀번호가 일치하지 않습니다.' 
      });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        userRole: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 성공 응답
    return res.status(200).json({
      success: true,
      message: '로그인 성공',
      token,
      username: user.username,
      userRole: user.role,
      userId: user.id,
    });

  } catch (error) {
    console.error('로그인 API 에러:', error);
    return res.status(500).json({ 
      success: false,
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
}
