// pages/select-4send.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';

let socket;

export default function Select4SendPage() {
  const router = useRouter();
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      router.replace('/login');
      return;
    }

    socket = io(window.location.origin);

    socket.on('connect', () => {
      console.log('Socket.IO connected from select-4send');
    });

    return () => {
      if (socket) {
        socket.disconnect();
        console.log('Socket.IO disconnected from select-4send');
      }
    };
  }, [router]);

  const handleSelectNumber = (number) => {
    setSelectedNumber(number);
    if (socket && username) {
      socket.emit('studentSelection', { username, number });
    }
  };

  const handleCancelSelection = () => {
    setSelectedNumber(null);
    if (socket && username) {
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
              backgroundColor: selectedNumber === num ? '#28a745' : '#007bff',
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
        disabled={selectedNumber === null}
        style={{
          padding: '12px 20px',
          fontSize: '1.1em',
          backgroundColor: '#ffc107',
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