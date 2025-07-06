// pages/select-4send.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client'; // Socket.IO 클라이언트 라이브러리

let socket; // 소켓 인스턴스를 외부에 선언하여 재사용

export default function Select4SendPage() {
  const router = useRouter();
  const [selectedNumber, setSelectedNumber] = useState(null); // 선택된 숫자
  const [username, setUsername] = useState(''); // 현재 로그인한 학생 이름

  useEffect(() => {
    // 로컬 스토리지에서 사용자 이름 가져오기
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      // 사용자 이름이 없으면 로그인 페이지로 리다이렉트
      router.replace('/login');
      return;
    }

    // Socket.IO 클라이언트 초기화
    // `window.location.origin`을 사용하여 현재 서버 주소로 연결
    socket = io(window.location.origin);

    // 연결 성공 시
    socket.on('connect', () => {
      console.log('Socket.IO connected from select-4send');
    });

    // 컴포넌트 언마운트 시 소켓 연결 해제
    return () => {
      if (socket) {
        socket.disconnect();
        console.log('Socket.IO disconnected from select-4send');
      }
    };
  }, [router]); // router 의존성 추가

  // 숫자 선택 핸들러
  const handleSelectNumber = (number) => {
    setSelectedNumber(number);
    if (socket && username) {
      // 서버로 선택 정보 전송
      socket.emit('studentSelection', { username, number });
    }
  };

  // 취소 버튼 핸들러
  const handleCancelSelection = () => {
    setSelectedNumber(null); // 선택 해제
    if (socket && username) {
      // 서버로 선택 취소 정보 전송 (null 값 전송)
      socket.emit('studentSelection', { username, number: null });
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <h1 style={{ color: '#333' }}>숫자 선택 페이지</h1>
      <p style={{ fontSize: '1.2em' }}>환영합니다, {username}님!</p>
      <p style={{ fontSize: '1.1em', marginBottom: '30px' }}>
        선택된 숫자: {selectedNumber !== null ? selectedNumber : '없음'}
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            onClick={() => handleSelectNumber(num)}
            style={{
              padding: '20px 30px',
              fontSize: '1.5em',
              backgroundColor: selectedNumber === num ? '#28a745' : '#007bff', // 선택 시 초록색, 기본 파란색
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
        disabled={selectedNumber === null} // 선택된 숫자가 없으면 비활성화
        style={{
          padding: '12px 20px',
          fontSize: '1.1em',
          backgroundColor: '#ffc107', // 노란색 (취소)
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
          opacity: selectedNumber === null ? 0.6 : 1,
        }}
      >
        취소
      </button>

      <div style={{ marginTop: '50px' }}>
        <button
          onClick={() => router.back()}
          style={{
            padding: '10px 15px',
            backgroundColor: '#6c757d', // 회색 (뒤로가기)
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