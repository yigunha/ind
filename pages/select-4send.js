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
        path: '/api/socket', // ✨ 이 줄을 추가합니다.
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
      });

      socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error from select-4send:', error);
      });
    }

    // 컴포넌트 언마운트 시 소켓 연결 해제 (선택 사항, 필요에 따라)
    // return () => {
    //   if (socket) {
    //     socket.disconnect();
    //   }
    // };
  }, [username, router, selectedNumber]); // selectedNumber 의존성 추가

  const handleSelectNumber = (number) => {
    setSelectedNumber(number);
    if (socket && username) {
      socket.emit('studentSelection', { username, number });
    }
  };

  const handleCancelSelection = () => {
    setSelectedNumber(null);
    if (socket && username) {
      // 선택 취소 시 서버에 null 값 전송하여 해당 학생 정보 제거
      socket.emit('studentSelection', { username, number: null });
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <h1 style={{ color: '#333' }}>선택하기 페이지</h1>
      <p>환영합니다, {username}님! 숫자를 선택해주세요.</p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
        maxWidth: '400px',
        margin: '30px auto'
      }}>
        {[1, 2, 3, 4].map(num => (
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
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          뒤로가기
        </button>
      </div>
    </div>
  );
}