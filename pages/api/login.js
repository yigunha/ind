// pages/api/login.js

// 실제 JWT 토큰 생성을 위해 'jsonwebtoken' 라이브러리가 필요합니다.
// 설치되어 있지 않다면, 프로젝트 루트에서 다음 명령어를 실행하세요:
// npm install jsonwebtoken
// 또는
// yarn add jsonwebtoken

// bcrypt.js 같은 비밀번호 해싱 라이브러리도 필요할 수 있습니다.
// npm install bcryptjs
// 또는
// yarn add bcryptjs

import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs'; // 실제 비밀번호 해싱 비교 시 사용

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    // --- 실제 인증 로직 시작 ---
    // 이 부분은 실제 데이터베이스 조회 및 비밀번호 해싱 비교 로직으로 대체되어야 합니다.
    // 현재는 제공된 정보(username: master1, password: 1234, role: admin)를 바탕으로 임시 구현합니다.

    let userRole = null;
    let userId = null; // JWT 페이로드에 사용자 ID를 포함하는 것이 일반적
    let isValidCredentials = false;

    // !!! 중요: 이 임시 로직을 실제 데이터베이스 연동 및 비밀번호 해싱 비교 로직으로 대체하세요.
    // 예시: Supabase에서 사용자 조회 및 비밀번호 비교
    // const { data: users, error } = await supabase.from('users').select('*').eq('username', username);
    // if (users && users.length > 0) {
    //   const user = users[0];
    //   if (await bcrypt.compare(password, user.password)) { // 해싱된 비밀번호 비교
    //     isValidCredentials = true;
    //     userRole = user.role;
    //     userId = user.id;
    //   }
    // }

    // 현재는 단순 비교 (개발/테스트 용도)
    //if (username === 'master1' && password === '1234') {
    //  isValidCredentials = true;
    //  userRole = 'admin'; // 데이터베이스에서 조회된 user.role 값
    //  userId = 1; // 임시 사용자 ID
   // }
    // --- 실제 인증 로직 끝 ---


    if (isValidCredentials && userRole) { // 로그인 성공 (유효한 자격 증명과 역할이 결정되었을 때)
      // JWT Secret Key는 환경 변수(.env.local)로 관리하는 것이 보안상 매우 중요합니다.
      // 예: process.env.JWT_SECRET_KEY
      // 개발 환경에서는 임시로 사용할 수 있지만, 절대 실제 프로덕션 코드에 하드코딩하지 마세요.
      const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your_very_secret_jwt_key_here'; // 이 값을 변경하세요!

      try {
        // JWT 토큰 생성
        const token = jwt.sign(
          { userId: userId, username: username, userRole: userRole }, // 토큰 페이로드
          SECRET_KEY,
          { expiresIn: '1h' } // 토큰 만료 시간 설정 (예: 1시간)
        );

        return res.status(200).json({
          message: 'Login successful',
          userRole: userRole, // 클라이언트가 이 필드를 기대합니다.
          token: token,      // 클라이언트가 이 필드를 기대합니다.
        });

      } catch (error) {
        console.error("JWT 토큰 생성 오류:", error);
        return res.status(500).json({ message: '서버 오류: 토큰 생성에 실패했습니다.' });
      }

    } else {
      // 로그인 실패 시 응답 (유효하지 않은 자격 증명)
      return res.status(401).json({ message: '유효하지 않은 ID 또는 비밀번호입니다.' });
    }
  } else {
    // POST 요청이 아닌 다른 HTTP 메서드 요청 시
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}