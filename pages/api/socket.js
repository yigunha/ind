// pages/api/socket.js
import { Server } from 'socket.io';

const studentSelections = {}; // { 'studentUsername1': 3, 'studentUsername2': 1, ... }

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket.IO is already running');
    res.end();
    return;
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  console.log('Setting up Socket.IO');

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    emitSelectionUpdate(io);

    socket.on('studentSelection', (data) => {
      const { username, number } = data;
      console.log(`Received selection from ${username}: ${number}`);

      if (typeof number === 'number' && !isNaN(number)) {
        studentSelections[username] = number;
      } else { // number가 null이거나 유효하지 않은 값일 경우 (취소)
        delete studentSelections[username]; // 해당 학생의 선택 정보 삭제
      }

      emitSelectionUpdate(io);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  res.end();
};

// --- 이 함수를 아래 코드로 교체하세요 ---
function emitSelectionUpdate(io) {
  let totalSum = 0;
  let studentsSelectedCount = 0;
  const selectedNumbersByStudent = {};
  // 각 번호별 선택된 학생 수를 저장할 객체 추가
  const selectionCounts = { 1: 0, 2: 0, 3: 0, 4: 0 }; 

  for (const username in studentSelections) {
    const number = studentSelections[username];
    if (typeof number === 'number' && !isNaN(number)) {
      totalSum += number;
      studentsSelectedCount++;
      selectedNumbersByStudent[username] = number;
      // 각 번호별 카운트 증가
      if (selectionCounts[number] !== undefined) {
        selectionCounts[number]++;
      }
    }
  }

  console.log('Emitting update - Total Sum:', totalSum, 'Students Selected:', studentsSelectedCount, 'Selection Counts:', selectionCounts);

  // 'selectionUpdate' 이벤트로 현황 데이터 전송 시 selectionCounts 추가
  io.emit('selectionUpdate', {
    totalSum,
    studentsSelectedCount,
    selectedNumbersByStudent,
    selectionCounts, // 새로 추가된 부분
  });
}

export default SocketHandler;