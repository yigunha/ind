// pages/select-4receive.js
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

let socket; // 소켓 인스턴스를 컴포넌트 외부에서 선언하여 여러 렌더링에서 재사용

export default function Select4ReceivePage() {
  const [totalSum, setTotalSum] = useState(0);
  const [studentsSelectedCount, setStudentsSelectedCount] = useState(0);
  const [selectedNumbersByStudent, setSelectedNumbersByStudent] = useState({});
  const [selectionCounts, setSelectionCounts] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 }); // 각 번호별 선택된 학생 수를 저장할 상태 추가

  useEffect(() => {
    // 소켓 초기화 및 연결
    if (!socket) {
      socket = io(window.location.origin, {
        pingInterval: 10000, // 10초마다 핑 전송
        pingTimeout: 5000,   // 5초 동안 핑 응답 없으면 연결 끊음
        transports: ['websocket'] // 웹소켓 전송 방식 강제
      });

      socket.on('connect', () => {
        console.log('Socket.IO connected to select-4receive');
      });

      socket.on('selectionUpdate', (data) => {
        console.log('Received selection update:', data);
        setTotalSum(data.totalSum);
        setStudentsSelectedCount(data.studentsSelectedCount);
        setSelectedNumbersByStudent(data.selectedNumbersByStudent);
        setSelectionCounts(data.selectionCounts); // 새로운 상태 업데이트
      });

      socket.on('disconnect', () => {
        console.log('Socket.IO disconnected from select-4receive');
        socket = null; // 소켓 인스턴스 초기화
      });

      socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
      });
    }

    // 컴포넌트 언마운트 시 소켓 연결 해제
    return () => {
      if (socket && socket.connected) { // 연결되어 있을 때만 disconnect 호출
        socket.disconnect();
        socket = null;
        console.log('Socket.IO cleanup: disconnected from select-4receive');
      }
    };
  }, []); // 의존성 배열 비워 컴포넌트 마운트 시 한 번만 실행되도록 함

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

      {/* 각 번호별 선택 현황 추가 */}
      <h2 style={{ color: '#555' }}>번호별 선택 현황</h2>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '30px', border: '1px solid #eee', padding: '15px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
        {[1, 2, 3, 4].map(num => (
          <div key={num} style={{ textAlign: 'center', minWidth: '80px' }}>
            <p style={{ margin: '0', fontSize: '1.1em', fontWeight: 'bold', color: '#666' }}>번호 {num}</p>
            <p style={{ margin: '5px 0 0', fontSize: '1.8em', fontWeight: 'bold', color: '#dc3545' }}>
              {selectionCounts[num]}명
            </p>
          </div>
        ))}
      </div>

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
                borderRadius: '50%',
                width: '35px',
                height: '35px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '1.1em',
                fontWeight: 'bold',
                color: '#333'
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