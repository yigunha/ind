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

    // 새 연결 시 현재 선택 현황 전송
    emitSelectionUpdate(io);

    socket.on('studentSelection', (data) => {
      const { username, number } = data;
      console.log(`Received selection from ${username}: ${number}`);

      if (typeof number === 'number' && !isNaN(number)) {
        studentSelections[username] = number;
      } else { // number가 null이거나 유효하지 않은 값일 경우 (취소)
        delete studentSelections[username]; // 해당 학생의 선택 정보 삭제
      }

      emitSelectionUpdate(io); // 선택 변경 시 업데이트 전송
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      emitSelectionUpdate(io); // disconnect 시에도 업데이트 전송
    });
  });

  res.end();
};

function emitSelectionUpdate(io) {
  let totalSum = 0;
  let studentsSelectedCount = 0;
  const selectedNumbersByStudent = {};
  const selectionCounts = { 1: 0, 2: 0, 3: 0, 4: 0 }; // 각 번호별 선택된 학생 수를 저장할 객체

  for (const username in studentSelections) {
    const number = studentSelections[username];
    if (typeof number === 'number' && !isNaN(number)) {
      totalSum += number;
      studentsSelectedCount++;
      selectedNumbersByStudent[username] = number;
      
      // 각 번호별 카운트 증가 (유효한 번호일 경우에만)
      if (selectionCounts[number] !== undefined) {
        selectionCounts[number]++;
      }
    }
  }

  console.log('Emitting update - Total Sum:', totalSum, 'Students Selected:', studentsSelectedCount, 'Selection Counts:', selectionCounts);

  io.emit('selectionUpdate', {
    totalSum,
    studentsSelectedCount,
    selectedNumbersByStudent,
    selectionCounts, // 각 번호별 카운트 데이터 포함
  });
}

export default SocketHandler;