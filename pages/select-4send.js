// pages/select-4send.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { supabase } from '../utils/supabaseClient'; // Supabase 클라이언트 임포트

export default function Select4Send() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);
  const [currentSelection, setCurrentSelection] = useState(null); // 현재 선택 값 상태

  useEffect(() => {
    const storedUsername = Cookies.get('username');
    const storedUserId = Cookies.get('userId');

    if (!storedUsername || !storedUserId) {
      router.push('/login'); // 로그인 정보 없으면 로그인 페이지로
    } else {
      setUsername(storedUsername);
      setUserId(storedUserId);
      // 페이지 로드 시 현재 사용자의 마지막 선택을 불러옴 (선택적)
      fetchUserSelection(storedUserId);
    }
  }, [router]);

  // 사용자의 마지막 선택을 불러오는 함수
  const fetchUserSelection = async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('student_number_selections')
      .select('selected_number')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }) // 가장 최신 선택
      .limit(1)
      .single(); // 단일 레코드만 가져옴

    if (error && error.code !== 'PGRST116') { // PGRST116은 데이터 없을 때 발생
      console.error('Error fetching user selection:', error.message);
    } else if (data) {
      setCurrentSelection(data.selected_number);
    }
  };

  const handleSelection = async (number) => {
    if (!userId || !username) {
      alert('로그인 정보가 없습니다. 다시 로그인해주세요.');
      router.push('/login');
      return;
    }

    try {
      // Supabase에 데이터 upsert (삽입 또는 업데이트)
      // user_id를 기준으로 이미 존재하는 레코드가 있다면 업데이트, 없다면 삽입
      const { data, error } = await supabase
        .from('student_number_selections')
        .upsert(
          { 
            user_id: userId, 
            username: username, 
            selected_number: number 
          },
          { 
            onConflict: 'user_id', // user_id가 중복될 경우 업데이트
            ignoreDuplicates: false // 중복 레코드를 무시하지 않고 업데이트 (기존 레코드의 created_at이 변경되지 않음)
          }
        )
        .select(); // 업데이트된 레코드를 반환

      if (error) {
        throw error;
      }

      console.log('Selection updated:', data);
      setCurrentSelection(number); // UI 업데이트
      alert(`${number}번을 선택했습니다!`);

    } catch (error) {
      console.error('Error updating selection:', error.message);
      alert(`선택 실패: ${error.message}`);
    }
  };

  const handleCancel = async () => {
    if (!userId) {
      alert('로그인 정보가 없습니다.');
      return;
    }

    try {
      // Supabase에서 해당 user_id의 모든 선택 기록 삭제
      const { error } = await supabase
        .from('student_number_selections')
        .delete()
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      console.log('Selection cancelled for user:', userId);
      setCurrentSelection(null); // UI 업데이트
      alert('선택을 취소했습니다.');

    } catch (error) {
      console.error('Error cancelling selection:', error.message);
      alert(`취소 실패: ${error.message}`);
    }
  };

  const handleGoBack = () => {
    router.push('/student'); // 학생 메인 페이지로 돌아가기
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h1>숫자 선택 페이지</h1>
      <p>환영합니다, {username}!</p>
      {currentSelection !== null && (
        <p>현재 선택: **{currentSelection}**번</p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            onClick={() => handleSelection(num)}
            style={{
              padding: '20px',
              fontSize: '24px',
              fontWeight: 'bold',
              backgroundColor: currentSelection === num ? 'green' : 'blue',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            {num}
          </button>
        ))}
      </div>
      <button
        onClick={handleCancel}
        style={{
          marginTop: '20px',
          padding: '15px 30px',
          fontSize: '18px',
          backgroundColor: 'red',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        선택 취소
      </button>
      <button
        onClick={handleGoBack}
        style={{
          marginTop: '10px',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#555',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        뒤로 가기
      </button>
    </div>
  );
}