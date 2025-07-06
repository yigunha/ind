// pages/select-4send.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';

let socket; // 소켓 인스턴스를 컴포넌트 외부에서 선언하여 여러 렌더링에서 재사용

export default function Select4SendPage() {
  const router = useRouter();
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // 사용자 이름 확인 및 설정
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      // 사용자 이름 없으면 로그인 페이지로 리다이렉트
      router.replace('/login');
      return;
    }

    // 소켓 초기화 및 연결
    if (!socket) {
      socket = io(window.location.origin, {
        pingInterval: 10000, // 10초마다 핑 전송 (기본 25000ms)
        pingTimeout: 5000,   // 5초 동안 핑 응답 없으면 연결 끊음 (기본 20000ms)
        transports: ['websocket'] // 웹소켓 전송 방식 강제
      });

      socket.on('connect', () => {
        console.log('Socket.IO connected from select-4send');
        // 연결 성공 시, 현재 사용자 정보로 초기 선택 상태 전송 (선택된 숫자가 있다면)
        if (selectedNumber !== null && username) {
          socket.emit('studentSelection', { username, number: selectedNumber });
        }
      });

      socket.on('disconnect', () => {
        console.log('Socket.IO disconnected from select-4send');
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
        console.log('Socket.IO cleanup: disconnected from select-4send');
      }
    };
  }, [router, username, selectedNumber]); // username과 selectedNumber도 의존성 배열에 추가

  // 숫자 선택 핸들러
  const handleSelectNumber = (number) => {
    setSelectedNumber(number);
    if (socket && username) {
      socket.emit('studentSelection', { username, number });
      console.log(`Emitted studentSelection: ${username}, ${number}`);
    } else {
      console.warn("Socket not connected or username not set when trying to emit.");
    }
  };

  // 선택 취소 핸들러
  const handleCancelSelection = () => {
    setSelectedNumber(null);
    if (socket && username) {
      socket.emit('studentSelection', { username, number: null }); // null을 보내서 선택 취소 알림
      console.log(`Emitted studentSelection: ${username}, null (cancel)`);
    } else {
      console.warn("Socket not connected or username not set when trying to emit (cancel).");
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <h1 style={{ color: '#333' }}>숫자 선택 페이지</h1>
      <p style={{ fontSize: '1.1em', color: '#555' }}>환영합니다, <span style={{ fontWeight: 'bold' }}>{username}</span>님!</p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
        maxWidth: '400px',
        margin: '30px auto',
        padding: '20px',
        border: '1px solid #eee',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            onClick={() => handleSelectNumber(num)}
            style={{
              padding: '20px 30px',
              fontSize: '1.5em',
              backgroundColor: selectedNumber === num ? '#28a745' : '#007bff', // 선택 시 초록색, 평소엔 파란색
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              transition: 'background-color 0.3s ease'
            }}
          >
            {num}
          </button>
        ))}
      </div>

      <button
        onClick={handleCancelSelection}
        disabled={selectedNumber === null} // 선택된 숫자가 없을 때 비활성화
        style={{
          padding: '12px 20px',
          fontSize: '1.1em',
          backgroundColor: '#ffc107', // 노란색
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
          opacity: selectedNumber === null ? 0.6 : 1, // 비활성화 시 투명도 조절
        }}
      >
        선택 취소
      </button>

      <div style={{ marginTop: '50px' }}>
        <button
          onClick={() => router.back()}
          style={{
            padding: '10px 15px',
            backgroundColor: '#6c757d', // 회색
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          뒤로 가기
        </button>
      </div>
    </div>
  );
}