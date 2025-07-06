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
    // router가 준비될 때까지 기다립니다.
    if (!router.isReady) { // <<<<< 이 조건이 중요합니다!
      return;
    }

    const storedUsername = localStorage.getItem('username');
    const storedUserId = localStorage.getItem('userId');

    console.log("useEffect: storedUsername:", storedUsername);
    console.log("useEffect: storedUserId:", storedUserId);

    if (!storedUsername || !storedUserId) {
      router.push('/login');
    } else {
      setUsername(storedUsername);
      setUserId(storedUserId);
      setLoading(false);
      // 페이지 로드 시 현재 사용자의 마지막 선택을 불러옴
      fetchUserSelection(storedUserId);
    }
  }, [router.isReady, router]); // <<<<< 의존성 배열에 router.isReady 추가

  // 사용자의 현재 선택 번호를 불러오는 함수
  const fetchUserSelection = async (currentUserId) => {
    if (!currentUserId) { // currentUserId가 null이면 함수 실행 중단
        console.warn('fetchUserSelection: currentUserId is null or undefined');
        setError('사용자 정보를 불러올 수 없습니다.'); // 사용자에게 표시할 에러 메시지
        return;
    }
    try {
      const { data, error } = await supabase
        .from('student_number_selections')
        .select('selected_number')
        .eq('user_id', currentUserId)
        .single(); // 단일 레코드만 가져옵니다.

      if (error && error.code !== 'PGRST116') { // PGRST116은 '없음'을 의미, 에러 아님
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

  // 번호 선택 및 데이터베이스에 저장
  const handleSelection = async (number) => {
    if (!userId) {
      setError('사용자 ID를 찾을 수 없습니다. 다시 로그인해주세요.');
      router.push('/login');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // 기존 선택이 있는지 확인
      const { data: existingData, error: fetchError } = await supabase
        .from('student_number_selections')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116은 데이터 없음 오류
        throw fetchError;
      }

      let updateError;
      if (existingData) {
        // 기존 선택이 있으면 업데이트
        const { error: updateErr } = await supabase
          .from('student_number_selections')
          .update({ selected_number: number })
          .eq('user_id', userId);
        updateError = updateErr;
      } else {
        // 기존 선택이 없으면 새로 삽입
        const { error: insertErr } = await supabase
          .from('student_number_selections')
          .insert({ user_id: userId, username: username, selected_number: number });
        updateError = insertErr;
      }

      if (updateError) {
        throw updateError;
      }

      setSelectedNumber(number);
      alert(`${number}번을 선택했습니다.`);
    } catch (err) {
      console.error('Error saving selection:', err);
      setError(`선택 저장 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 선택 취소 함수
  const handleCancel = async () => {
    if (!userId) {
        setError('사용자 ID를 찾을 수 없습니다. 다시 로그인해주세요.');
        router.push('/login');
        return;
    }
    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('student_number_selections')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        throw deleteError;
      }

      setSelectedNumber(null);
      alert('선택을 취소했습니다.');
    } catch (err) {
      console.error('Error canceling selection:', err);
      setError(`선택 취소 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>로딩 중...</div>;
  if (error) return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>오류: {error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', marginBottom: '25px' }}>
        환영합니다, {username || '게스트'}님!
      </h1>

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