<<<<<<< HEAD
// pages/select-4receive.js
import { useEffect, useState } from 'react';
import io from 'socket.io-client'; // Socket.IO 클라이언트 라이브러리

let socket; // 소켓 인스턴스를 외부에 선언하여 재사용

export default function Select4ReceivePage() {
  const [totalSum, setTotalSum] = useState(0); // 선택된 숫자의 총계
  const [studentsSelectedCount, setStudentsSelectedCount] = useState(0); // 선택한 학생 수
  const [selectedNumbersByStudent, setSelectedNumbersByStudent] = useState({}); // 각 학생별 선택된 번호

  useEffect(() => {
    // Socket.IO 클라이언트 초기화
    socket = io(window.location.origin);

    socket.on('connect', () => {
      console.log('Socket.IO connected to select-4receive');
    });

    // 서버로부터 'selectionUpdate' 이벤트를 수신합니다.
    socket.on('selectionUpdate', (data) => {
      console.log('Received selection update:', data);
      setTotalSum(data.totalSum);
      setStudentsSelectedCount(data.studentsSelectedCount);
      setSelectedNumbersByStudent(data.selectedNumbersByStudent);
    });

    // 컴포넌트 언마운트 시 소켓 연결 해제
    return () => {
      if (socket) {
        socket.disconnect();
        console.log('Socket.IO disconnected from select-4receive');
      }
    };
  }, []); // 의존성 배열 비워 한 번만 실행

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333' }}>선생님 페이지 (실시간 현황)</h1>
      <p style={{ fontSize: '1.2em' }}>
        선택된 숫자의 총계: <span style={{ fontWeight: 'bold', color: '#007bff' }}>{totalSum}</span>
      </p>
      <p style={{ fontSize: '1.2em', marginBottom: '20px' }}>
        선택한 학생 수: <span style={{ fontWeight: 'bold', color: '#28a745' }}>{studentsSelectedCount}</span>
      </p>

      <hr style={{ margin: '30px 0', borderColor: '#eee' }} />

      <h2 style={{ color: '#555' }}>각 학생별 선택 현황</h2>
      {studentsSelectedCount === 0 ? (
        <p>아직 선택한 학생이 없습니다.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {Object.entries(selectedNumbersByStudent).map(([username, number]) => (
            <li key={username} style={{
              padding: '10px 0',
              borderBottom: '1px dotted #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: 'bold' }}>{username}</span>
              <span style={{
                backgroundColor: '#f0f0f0',
                padding: '5px 10px',
                borderRadius: '5px',
                minWidth: '50px',
                textAlign: 'center'
              }}>
                {number}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
=======
// pages/select-4receive.js
import { useEffect, useState } from 'react';
import io from 'socket.io-client'; // Socket.IO 클라이언트 라이브러리

let socket; // 소켓 인스턴스를 외부에 선언하여 재사용

export default function Select4ReceivePage() {
  const [totalSum, setTotalSum] = useState(0); // 선택된 숫자의 총계
  const [studentsSelectedCount, setStudentsSelectedCount] = useState(0); // 선택한 학생 수
  const [selectedNumbersByStudent, setSelectedNumbersByStudent] = useState({}); // 각 학생별 선택된 번호

  useEffect(() => {
    // Socket.IO 클라이언트 초기화
    socket = io(window.location.origin);

    socket.on('connect', () => {
      console.log('Socket.IO connected to select-4receive');
    });

    // 서버로부터 'selectionUpdate' 이벤트를 수신합니다.
    socket.on('selectionUpdate', (data) => {
      console.log('Received selection update:', data);
      setTotalSum(data.totalSum);
      setStudentsSelectedCount(data.studentsSelectedCount);
      setSelectedNumbersByStudent(data.selectedNumbersByStudent);
    });

    // 컴포넌트 언마운트 시 소켓 연결 해제
    return () => {
      if (socket) {
        socket.disconnect();
        console.log('Socket.IO disconnected from select-4receive');
      }
    };
  }, []); // 의존성 배열 비워 한 번만 실행

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333' }}>선생님 페이지 (실시간 현황)</h1>
      <p style={{ fontSize: '1.2em' }}>
        선택된 숫자의 총계: <span style={{ fontWeight: 'bold', color: '#007bff' }}>{totalSum}</span>
      </p>
      <p style={{ fontSize: '1.2em', marginBottom: '20px' }}>
        선택한 학생 수: <span style={{ fontWeight: 'bold', color: '#28a745' }}>{studentsSelectedCount}</span>
      </p>

      <hr style={{ margin: '30px 0', borderColor: '#eee' }} />

      <h2 style={{ color: '#555' }}>각 학생별 선택 현황</h2>
      {studentsSelectedCount === 0 ? (
        <p>아직 선택한 학생이 없습니다.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {Object.entries(selectedNumbersByStudent).map(([username, number]) => (
            <li key={username} style={{
              padding: '10px 0',
              borderBottom: '1px dotted #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: 'bold' }}>{username}</span>
              <span style={{
                backgroundColor: '#f0f0f0',
                padding: '5px 10px',
                borderRadius: '5px',
                minWidth: '50px',
                textAlign: 'center'
              }}>
                {number}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
>>>>>>> 7adfbd1c97ca611d06e414ca80d620744c064b3a
}