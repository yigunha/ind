// pages/select-4send.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase, checkSupabaseConfig } from '../utils/supabaseClient';

export default function Select4Send() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 환경 변수 확인
    if (!checkSupabaseConfig()) {
      setError('Supabase 설정이 올바르지 않습니다. 환경 변수를 확인해주세요.');
      setLoading(false);
      return;
    }

    // 클라이언트 사이드에서만 localStorage 접근
    if (typeof window !== 'undefined' && router.isReady) {
      const storedUsername = localStorage.getItem('username');
      const storedUserId = localStorage.getItem('userId');

      console.log("useEffect: storedUsername:", storedUsername);
      console.log("useEffect: storedUserId:", storedUserId);

      if (!storedUsername || !storedUserId) {
        router.push('/login');
      } else {
        setUsername(storedUsername);
        setUserId(storedUserId);
        fetchUserSelection(storedUserId);
      }
    }

    // --- Realtime 구독 설정 (데이터 초기화 시 학생 화면도 초기화) ---
    const channel = supabase
      .channel('student_selections_changes') // 선생님 페이지와 동일한 채널 이름
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_number_selections' },
        (payload) => {
          console.log('Realtime Change received in student page!', payload);

          // DELETE 이벤트가 발생했을 때 현재 사용자의 선택 번호를 초기화
          if (payload.eventType === 'DELETE') {
            // 삭제된 데이터가 현재 사용자의 데이터이거나, 모든 데이터가 삭제되는 경우 (전체 초기화)
            if (!payload.old || (payload.old.user_id && payload.old.user_id === userId) || Object.keys(payload.old).length === 0) {
              console.log('My selection is being reset due to delete event.');
              setSelectedNumber(null); // 선택 초기화
            }
          } else if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // 자신의 데이터가 업데이트된 경우를 처리합니다.
            if (payload.new.user_id === userId) {
              setSelectedNumber(payload.new.selected_number);
            }
          }
        }
      )
      .subscribe();

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      supabase.removeChannel(channel);
    };
  }, [router.isReady, userId]);

  const fetchUserSelection = async (currentUserId) => {
    if (!currentUserId) {
        setLoading(false);
        return;
    }
    
    try {
      console.log("Fetching selection for user:", currentUserId);
      
      const { data, error } = await supabase
        .from('student_number_selections')
        .select('selected_number')
        .eq('user_id', currentUserId)
	      .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          console.log("No existing selection found for this user.");
        } else {
          console.error('Error fetching user selection:', error);
          setError(`선택 정보를 불러오는 데 실패했습니다: ${error.message}`);
        }
      } else if (data) {
        console.log("Found existing selection:", data.selected_number);
        setSelectedNumber(data.selected_number);
      }
    } catch (err) {
      console.error('선택 정보를 불러오는 중 오류:', err);
      setError(err.message || '선택 정보를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false); // 초기 로딩 상태 여기서 해제
    }
  };

  const handleSelection = async (number) => {
    if (!checkSupabaseConfig()) {
      setError('Supabase 설정이 올바르지 않습니다.');
      return;
    }

    if (!userId) {
      setError('로그인 정보가 없습니다. 다시 로그인해주세요.');
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Attempting to save selection:", number, "for user:", userId);

      // 먼저 기존 선택이 있는지 확인
      const { data: existingSelection, error: fetchErr } = await supabase
        .from('student_number_selections')
        .select('id') // id 컬럼을 가져와서 업데이트 시 사용
        .eq('user_id', userId)
        .maybeSingle(); // 단일 결과를 기대하거나 없는 경우 null 반환

      if (fetchErr && fetchErr.code !== 'PGRST116') { // PGRST116: no rows found (데이터가 없는 것은 에러가 아님)
        throw new Error(`기존 선택 불러오기 실패: ${fetchErr.message}`);
      }

      let result;
      if (existingSelection) {
        console.log("Updating existing selection with ID:", existingSelection.id);
        result = await supabase
          .from('student_number_selections')
          .update({ selected_number: number })
          .eq('id', existingSelection.id); // id를 기준으로 업데이트
      } else {
        console.log("Inserting new selection");
        result = await supabase
          .from('student_number_selections')
          .insert({ 
            username: username, 
            selected_number: number, 
            user_id: userId 
          });
      }

      if (result.error) {
        console.error('데이터 저장 실패:', result.error);
        setError(`선택 저장 실패: ${result.error.message}`);
      } else {
        console.log("Selection saved successfully");
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

  if (typeof window === 'undefined') {
    return <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '1.2em' }}>로딩 중...</div>;
  }

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '1.2em' }}>로딩 중...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', color: 'red', fontSize: '1.2em' }}>
        오류: {error}
        <br />
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: '10px', padding: '10px 20px', fontSize: '1em' }}
        >
          다시 시도
        </button>
      </div>
    );
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
            disabled={selectedNumber !== null || loading} // selectedNumber 상태를 기반으로 disabled 제어
            style={{
              padding: '20px',
              fontSize: '2em',
              fontWeight: 'bold',
              backgroundColor: selectedNumber === number ? '#28a745' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: (selectedNumber !== null || loading) ? 'not-allowed' : 'pointer',
              boxShadow: '3px 3px 8px rgba(0,0,0,0.2)',
              transition: 'background-color 0.3s ease',
              opacity: (selectedNumber !== null || loading) ? 0.6 : 1,
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