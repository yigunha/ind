// pages/api/upload-excel.js
import { supabase } from '../../utils/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// JWT 검증 함수
const verifyToken = (token) => {
  try {
    // JWT_SECRET 환경 변수가 서버 측에 설정되어 있어야 합니다.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('JWT 검증 오류:', error.message);
    return null;
  }
};

export default async function handler(req, res) {
  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 1. JWT 토큰 검증 (관리자 권한 확인)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '인증 토큰이 제공되지 않았습니다.' });
  }

  const token = authHeader.split(' ')[1];
  const decodedToken = verifyToken(token);

if (!decodedToken || decodedToken.userRole !== 'admin') {
    return res.status(403).json({ message: '이 작업을 수행할 권한이 없습니다. 관리자만 가능합니다.' });
  }

  const usersToUpload = req.body; // 클라이언트에서 전송된 사용자 데이터 배열

  if (!Array.isArray(usersToUpload) || usersToUpload.length === 0) {
    return res.status(400).json({ message: '유효한 사용자 데이터가 제공되지 않았습니다.' });
  }

  const upsertResults = []; // 삽입/업데이트 결과를 저장할 배열

  try {
    for (const user of usersToUpload) {
      const { username, password, role } = user;

      if (!username || !password) {
        upsertResults.push({ username, status: '실패', message: 'ID 또는 비밀번호 누락.' });
        continue;
      }

      // 2. 비밀번호 해싱
      const hashedPassword = await bcrypt.hash(String(password), 10);

      // 3. Supabase DB에 사용자 데이터 삽입 또는 업데이트 (upsert)
      // username이 이미 존재하면 업데이트, 없으면 삽입
      const { data, error } = await supabase
        .from('users')
        .upsert(
          {
            username: username,
            password: hashedPassword, // 해시된 비밀번호 저장
            role: role || 'student', // role이 없으면 'student'로 기본값 설정
          },
          {
            onConflict: 'username', // username이 충돌하면 (이미 존재하면) 업데이트
            ignoreDuplicates: false // 중복될 경우 기존 레코드 업데이트 (기본값)
          }
        );

      if (error) {
        console.error(`사용자 ${username} upsert 오류:`, error.message);
        upsertResults.push({ username, status: '실패', message: error.message });
      } else {
        upsertResults.push({ username, status: '성공', message: '데이터 처리 완료' });
      }
    }

    // 모든 사용자 처리 결과 반환
    const successfulCount = upsertResults.filter(r => r.status === '성공').length;
    const failedCount = upsertResults.filter(r => r.status === '실패').length;

    res.status(200).json({
      message: `파일 업로드 및 DB 저장이 완료되었습니다. 성공: ${successfulCount}명, 실패: ${failedCount}명`,
      details: upsertResults,
    });

  } catch (err) {
    console.error('Excel 업로드 API 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생하여 데이터를 처리할 수 없습니다.' });
  }
}