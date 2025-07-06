// pages/select-4receive.js
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

let socket;

export default function Select4ReceivePage() {
  const [totalSum, setTotalSum] = useState(0);
  const [studentsSelectedCount, setStudentsSelectedCount] = useState(0);
  const [selectedNumbersByStudent, setSelectedNumbersByStudent] = useState({});

  useEffect(() => {
    socket = io(window.location.origin);

    socket.on('connect', () => {
      console.log('Socket.IO connected to select-4receive');
    });

    socket.on('selectionUpdate', (data) => {
      console.log('Received selection update:', data);
      setTotalSum(data.totalSum);
      setStudentsSelectedCount(data.studentsSelectedCount);
      setSelectedNumbersByStudent(data.selectedNumbersByStudent);
    });

    return () => {
      if (socket) {
        socket.disconnect();
        console.log('Socket.IO disconnected from select-4receive');
      }
    };
  }, []);

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
}