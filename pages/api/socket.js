<<<<<<< HEAD
// pages/api/socket.js
import { Server } from 'socket.io';

// 전역 변수로 선택된 학생들의 숫자 정보를 저장합니다.
// { 'studentUsername1': 3, 'studentUsername2': 1, 'studentUsername3': null }
const studentSelections = {};

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket.IO is already running');
    res.end();
    return;
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io; // 서버 인스턴스에 Socket.IO 객체 저장

  console.log('Setting up Socket.IO');

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // 초기 데이터 전송 (새로운 선생님 페이지가 연결될 때)
    emitSelectionUpdate(io);

    // 학생으로부터 'studentSelection' 이벤트를 수신합니다.
    socket.on('studentSelection', (data) => {
      const { username, number } = data;
      console.log(`Received selection from ${username}: ${number}`);

      // 선택 정보 업데이트
      studentSelections[username] = number;

      // 모든 연결된 클라이언트(선생님 페이지)에게 업데이트된 정보 전송
      emitSelectionUpdate(io);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      // 필요하다면, 특정 소켓과 연결된 학생의 선택 정보를 초기화할 수도 있습니다.
      // 하지만 여기서는 사용자가 명시적으로 취소하거나 다른 선택을 할 때만 변경되도록 합니다.
    });
  });

  res.end();
};

// 선택된 데이터 계산 및 전송 함수
function emitSelectionUpdate(io) {
  let totalSum = 0;
  let studentsSelectedCount = 0;
  const selectedNumbersByStudent = {}; // 각 학생별 선택된 번호 (선생님 페이지 표시용)

  for (const username in studentSelections) {
    const number = studentSelections[username];
    if (typeof number === 'number' && !isNaN(number)) { // 숫자인 경우에만 합산 및 카운트
      totalSum += number;
      studentsSelectedCount++;
      selectedNumbersByStudent[username] = number;
    } else {
      // 취소된 경우나 유효하지 않은 값은 제외하고, 해당 학생의 선택을 지웁니다.
      // 이렇게 하면 '취소'한 학생은 총계나 카운트에 포함되지 않습니다.
      delete studentSelections[username]; // 이 부분은 로직에 따라 유연하게 처리
    }
  }

  // console.log('Current selections:', studentSelections); // 디버깅용
  console.log('Emitting update - Total Sum:', totalSum, 'Students Selected:', studentsSelectedCount);

  io.emit('selectionUpdate', {
    totalSum,
    studentsSelectedCount,
    selectedNumbersByStudent, // 각 학생별 선택된 번호도 함께 전송
  });
}

=======
// pages/api/socket.js
import { Server } from 'socket.io';

// 전역 변수로 선택된 학생들의 숫자 정보를 저장합니다.
// { 'studentUsername1': 3, 'studentUsername2': 1, 'studentUsername3': null }
const studentSelections = {};

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket.IO is already running');
    res.end();
    return;
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io; // 서버 인스턴스에 Socket.IO 객체 저장

  console.log('Setting up Socket.IO');

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // 초기 데이터 전송 (새로운 선생님 페이지가 연결될 때)
    emitSelectionUpdate(io);

    // 학생으로부터 'studentSelection' 이벤트를 수신합니다.
    socket.on('studentSelection', (data) => {
      const { username, number } = data;
      console.log(`Received selection from ${username}: ${number}`);

      // 선택 정보 업데이트
      studentSelections[username] = number;

      // 모든 연결된 클라이언트(선생님 페이지)에게 업데이트된 정보 전송
      emitSelectionUpdate(io);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      // 필요하다면, 특정 소켓과 연결된 학생의 선택 정보를 초기화할 수도 있습니다.
      // 하지만 여기서는 사용자가 명시적으로 취소하거나 다른 선택을 할 때만 변경되도록 합니다.
    });
  });

  res.end();
};

// 선택된 데이터 계산 및 전송 함수
function emitSelectionUpdate(io) {
  let totalSum = 0;
  let studentsSelectedCount = 0;
  const selectedNumbersByStudent = {}; // 각 학생별 선택된 번호 (선생님 페이지 표시용)

  for (const username in studentSelections) {
    const number = studentSelections[username];
    if (typeof number === 'number' && !isNaN(number)) { // 숫자인 경우에만 합산 및 카운트
      totalSum += number;
      studentsSelectedCount++;
      selectedNumbersByStudent[username] = number;
    } else {
      // 취소된 경우나 유효하지 않은 값은 제외하고, 해당 학생의 선택을 지웁니다.
      // 이렇게 하면 '취소'한 학생은 총계나 카운트에 포함되지 않습니다.
      delete studentSelections[username]; // 이 부분은 로직에 따라 유연하게 처리
    }
  }

  // console.log('Current selections:', studentSelections); // 디버깅용
  console.log('Emitting update - Total Sum:', totalSum, 'Students Selected:', studentsSelectedCount);

  io.emit('selectionUpdate', {
    totalSum,
    studentsSelectedCount,
    selectedNumbersByStudent, // 각 학생별 선택된 번호도 함께 전송
  });
}

>>>>>>> 7adfbd1c97ca611d06e414ca80d620744c064b3a
export default SocketHandler;