// pages/select-4send.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient'; // 여기로 이동!

export default function Select4Send() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!router.isReady) {
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
      fetchUserSelection(storedUserId);
    }
  }, [router.isReady, router]);

  const fetchUserSelection = async (currentUserId) => {
    if (!currentUserId) return;
    try {
      const { data, error } = await supabase
        .from('student_number_selections')
        .select('selected_number')
        .eq('user_id', currentUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user selection:', error.message);
        setError('선택 정보를 불러오는 데 실패했습니다.');
      } else if (data) {
        setSelectedNumber(data.selected_number);
      }
    } catch (err) {
      console.error('선택 정보를 불러오는 중 오류:', err);
      setError(err.message || '선택 정보를 불러오는 데 실패했습니다.');
    }
  };

  const handleSelection = async (number) => {
    if (!userId) {
      setError('로그인 정보가 없습니다. 다시 로그인해주세요.');
      router.push('/login');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { data: existingSelection, error: fetchErr } = await supabase
        .from('student_number_selections')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (fetchErr && fetchErr.code !== 'PGRST116') {
        throw new Error(`기존 선택 불러오기 실패: ${fetchErr.message}`);
      }

      let updateError = null;
      if (existingSelection) {
        const { error: updateErr } = await supabase
          .from('student_number_selections')
          .update({ selected_number: number })
          .eq('user_id', userId)
          .eq('id', existingSelection.id);
        updateError = updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from('student_number_selections')
          .insert({ username: username, selected_number: number, user_id: userId });
        updateError = insertErr;
      }

      if (updateError) {
        console.error('데이터 저장 실패:', updateError);
        setError(`선택 저장 실패: ${updateError.message}`);
      } else {
        setSelectedNumber(number);
        alert('번호가 성공적으로 저장되었습니다!');
      }
    } catch (err) {
      console.error('선택 처리 중 오류:', err);
      setError(err.message || '번호 선택 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/student');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '1.2em' }}>로딩 중...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red', fontSize: '1.2em' }}>오류: {error}</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', marginBottom: '25px' }}>안녕하세요, {username}님!</h1>

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
        }}
      >
        돌아가기
      </button>
    </div>
  );
}
