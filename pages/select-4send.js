// pages/select-4send.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Select4Send() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null); // 사용자의 현재 선택 번호
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Supabase 클라이언트 임포트는 utils/supabaseClient.js 파일이 있다고 가정합니다.
  const { supabase } = require('../utils/supabaseClient'); 

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedUserId = localStorage.getItem('userId'); // userId도 localStorage에서 가져옴

    if (!storedUsername || !storedUserId) { // <<<<< storedUserId가 없으면 로그인 페이지로 리다이렉트
      router.push('/login');
    } else {
      setUsername(storedUsername);
      setUserId(storedUserId);
      setLoading(false);
      fetchUserSelection(storedUserId);
    }
  }, [router]);

  // 사용자의 현재 선택 번호를 불러오는 함수
  const fetchUserSelection = async (currentUserId) => {
    if (!currentUserId) return; // userId가 유효하지 않으면 요청하지 않음
    try {
      const { data, error } = await supabase
        .from('student_number_selections')
        .select('selected_number')
        .eq('user_id', currentUserId) // 올바른 userId (UUID)로 쿼리
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user selection:', error.message);
        setError('선택 정보를 불러오는 데 실패했습니다.');
      } else if (data) {
        setSelectedNumber(data.selected_number);
      }
    } catch (err) {
      console.error('Network error fetching user selection:', err);
      setError('네트워크 오류로 선택 정보를 불러올 수 없습니다.');
    }
  };

  const handleSelection = async (number) => {
    if (selectedNumber === number) {
      alert(`이미 ${number}번을 선택했습니다.`);
      return;
    }
    
    try {
        const { data: existingSelection, error: fetchError } = await supabase
            .from('student_number_selections')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
        }

        let updateError = null;
        if (existingSelection) {
            const { error } = await supabase
                .from('student_number_selections')
                .update({ selected_number: number, created_at: new Date().toISOString() })
                .eq('id', existingSelection.id);
            updateError = error;
        } else {
            const { error } = await supabase
                .from('student_number_selections')
                .insert([
                    { user_id: userId, username: username, selected_number: number }
                ]);
            updateError = error;
        }

        if (updateError) {
            console.error('Error updating/inserting selection:', updateError.message);
            setError(`선택 저장 실패: ${updateError.message}`);
        } else {
            setSelectedNumber(number);
            alert(`${number}번을 선택했습니다!`);
        }

    } catch (err) {
        console.error('Database operation error:', err);
        setError('데이터베이스 작업 중 오류가 발생했습니다.');
    }
  };

  const handleCancel = async () => {
    if (selectedNumber === null) {
      alert('아직 선택한 번호가 없습니다.');
      return;
    }

    try {
      const { error } = await supabase
        .from('student_number_selections')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error canceling selection:', error.message);
        setError('선택 취소 실패.');
      } else {
        setSelectedNumber(null);
        alert('선택을 취소했습니다.');
      }
    } catch (err) {
      console.error('Network error canceling selection:', err);
      setError('네트워크 오류로 선택을 취소할 수 없습니다.');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>로그인 정보 확인 중...</div>;
  if (error) return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>오류: {error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      <h1>번호 선택 페이지</h1>
      <p style={{ fontSize: '1.2em', marginBottom: '20px' }}>환영합니다, <strong style={{ color: 'darkblue' }}>{username}</strong>님!</p>
      
      {selectedNumber !== null ? (
        <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: 'green', marginBottom: '20px' }}>
          현재 선택 번호: {selectedNumber}
        </p>
      ) : (
        <p style={{ fontSize: '1.2em', color: '#555', marginBottom: '20px' }}>
          번호를 선택해주세요.
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', maxWidth: '300px', margin: '0 auto 30px' }}>
        {[1, 2, 3, 4].map((number) => (
          <button
            key={number}
            onClick={() => handleSelection(number)}
            style={{
              padding: '20px',
              fontSize: '2em',
              fontWeight: 'bold',
              backgroundColor: selectedNumber === number ? '#28a745' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '3px 3px 8px rgba(0,0,0,0.2)',
              transition: 'background-color 0.3s ease',
            }}
          >
            {number}
          </button>
        ))}
      </div>

      <button
        onClick={handleCancel}
        style={{
          padding: '12px 25px',
          fontSize: '1.1em',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
          transition: 'background-color 0.3s ease',
        }}
      >
        선택 취소
      </button>
    </div>
  );
}