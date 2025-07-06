// pages/select-4receive.js
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

let socket;

export default function Select4ReceivePage() {
  const [totalSum, setTotalSum] = useState(0);
  const [studentsSelectedCount, setStudentsSelectedCount] = useState(0);
  const [selectedNumbersByStudent, setSelectedNumbersByStudent] = useState({});
  // 각 번호별 선택된 학생 수를 저장할 상태 추가
  const [selectionCounts, setSelectionCounts] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 }); // 새로 추가된 부분

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
      setSelectionCounts(data.selectionCounts); // 새로 추가된 부분
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
      {/* --- 여기까지 새로 추가 --- */}

      <hr style={{ margin: '30px 0', borderColor: '#eee' }} />

      <h2 style={{ color: '#555' }}>각 학생별 선택 현황</h2>
      {studentsSelectedCount === 0 ? (
        <p>아직 선택한 학생이 없습니다.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {Object.entries(selectedNumbersByStudent).map(([username, number]) => (
            <li key={