// pages/api/socket.js
import { Server } from 'socket.io';

// 서버 메모리에 학생들의 선택을 저장할 객체
const studentSelections = {}; // 예: { 'studentUsername1': 3, 'studentUsername2': 1, ... }

// 선택 현황을 모든 연결된 클라이언트에게 브로드캐스트하는 함수
function emitSelectionUpdate(io) {
  let totalSum = 0;
  let studentsSelectedCount = 0;
  const selectedNumbersByStudent = {};
  const selectionCounts = { 1: 0, 2: 0, 3: 0, 4: 0 }; // 각 번호별 선택 횟수 초기화

  for (const username in studentSelections) {
    const number = studentSelections[username];
    if (typeof number === 'number' && !isNaN(number)) {
      totalSum += number;
      studentsSelectedCount++;
      selectedNumbersByStudent[username] = number;
      if (selectionCounts[number] !== undefined) {
        selectionCounts[number]++; // 선택된 번호 카운트 증가
      }
    }
  }

  // 업데이트된 데이터를 모든 클라이언트에게 'selectionUpdate' 이벤트로 전송
  io.emit('selectionUpdate', {
    totalSum,
    studentsSelectedCount,
    selectedNumbersByStudent,
    selectionCounts // 새로운 카운트 데이터 포함
  });

  console.log('Emitting update - Total Sum:', totalSum, 'Students Selected:', studentsSelectedCount, 'Selected Numbers:', selectedNumbersByStudent, 'Selection Counts:', selectionCounts);
}

// Next.js API 라우트 핸들러
const SocketHandler = (req, res) => {
  // 이미 Socket.IO 서버가 실행 중인 경우
  if (res.socket.server.io) {
    console.log('Socket.IO is already running');
    res.end();
    return;
  }

  // Socket.IO 서버 생성 및 설정
  const io = new Server(res.socket.server, {
    pingInterval: 10000, // 클라이언트와 동일하게 10초마다 핑 전송
    pingTimeout: 5000,   // 클라이언트와 동일하게 5초 동안 핑 응답 없으면 타임아웃
    transports: ['websocket'] // 웹소켓 전송 방식 강제
  });
  res.socket.server.io = io; // 서버 소켓 인스턴스를 res.socket.server에 저장

  console.log('Setting up Socket.IO');

  // 클라이언트 연결 이벤트 리스너
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // 새 클라이언트 연결 시 현재 선택 현황을 즉시 전송
    emitSelectionUpdate(io);

    // 'studentSelection' 이벤트 리스너 (학생이 숫자를 선택했을 때)
    socket.on('studentSelection', (data) => {
      const { username, number } = data;
      console.log(`Received selection from ${username}: ${number}`);

      if (typeof number === 'number' && !isNaN(number)) {
        studentSelections[username] = number; // 학생의 선택 정보 업데이트 또는 추가
      } else { // number가 null이거나 유효하지 않은 값일 경우 (선택 취소)
        delete studentSelections[username]; // 해당 학생의 선택 정보 삭제
      }

      // 선택 정보가 변경될 때마다 모든 클라이언트에게 업데이트 전송
      emitSelectionUpdate(io);
    });

    // 클라이언트 연결 해제 이벤트 리스너
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);

      // 연결이 끊긴 클라이언트의 선택 정보 제거
      // 연결 해제 시 해당 클라이언트의 username을 알 수 없으므로, 모든 studentSelections를 순회하며 socket.id로 매핑된 정보를 찾아 제거하는 로직이 필요할 수 있습니다.
      // 현재 예제에서는 socket.id와 username 매핑이 없으므로, 단순히 모든 클라이언트에 업데이트를 전송합니다.
      // (실제 프로덕션 환경에서는 사용자 ID와 소켓 ID 매핑 로직이 필요할 수 있습니다.)
      
      // 연결 끊김 시에도 업데이트된 현황을 모든 클라이언트에게 전송 (선택 학생 수 감소 등 반영)
      emitSelectionUpdate(io); 
    });
  });

  // 초기 HTTP 요청 종료
  res.end();
};

export default SocketHandler;