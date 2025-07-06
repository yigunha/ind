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

function emitSelectionUpdate(io) {
  let totalSum = 0;
  let studentsSelectedCount = 0;
  const selectedNumbersByStudent = {};

  for (const username in studentSelections) {
    const number = studentSelections[username];
    if (typeof number === 'number' && !isNaN(number)) {
      totalSum += number;
      studentsSelectedCount++;
      selectedNumbersByStudent[username] = number;
    }
  }

  console.log('Emitting update - Total Sum:', totalSum, 'Students Selected:', studentsSelectedCount);

  io.emit('selectionUpdate', {
    totalSum,
    studentsSelectedCount,
    selectedNumbersByStudent,
  });
}

export default SocketHandler;