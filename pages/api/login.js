// pages/api/login.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // 여기에 로그인 처리 로직 (ID/PW 확인, 데이터베이스 조회, JWT 발행 등)을 작성합니다.
    // 예를 들어:
    const { username, password } = req.body;

    // 실제 인증 로직 (예: 데이터베이스 조회 및 비밀번호 비교)
    if (username === 'master1' && password === '1234') { // 임시 예시
      // 로그인 성공 시 응답
      return res.status(200).json({ message: 'Login successful' });
    } else {
      // 로그인 실패 시 응답
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } else {
    // POST 요청이 아닌 다른 메서드 요청 시 (405 Method Not Allowed)
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}