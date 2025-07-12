// pages/select-4send.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase, checkSupabaseConfig } from '../utils/supabaseClient';

export default function Select4Send() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null); // 학생이 선택한 번호
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 환경 변수 확인
    if (!checkSupabaseConfig()) {
      setError('Supabase 설정이 올바르지 않습니다. 환경 변수를 확인해주세요.');
      setLoading(false);
      return;
    }

    // 클라이언트 사이드에서만 localStorage 접근 및 사용자 정보 설정
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
        fetchUserSelection(storedUserId); // 사용자의 기존 선택 불러오기
      }
    }

    // --- Realtime 구독 설정: 선생님 페이지에서 초기화 시 학생 페이지도 초기화 ---
    const channel = supabase
      .channel('student_selections_changes') // 선생님 페이지와 동일한 채널 이름
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_number_selections' },
        (payload) => {
          console.log('Realtime Change received in student page!', payload);

          // DELETE 이벤트가 발생했을 때 현재 사용자의 선택 번호를 초기화
          if (payload.eventType === 'DELETE') {
            // payload.old가 비어있으면 전체 삭제로 간주 (선생님 페이지의 delete().neq(...) 로직)
            // 또는 특정 user_id 데이터가 삭제되었을 때
            if (!payload.old || (payload.old.user_id && payload.old.user_id === userId) || Object.keys(payload.old).length === 0) {
              console.log('My selection is being reset due to delete event.');
              setSelectedNumber(null); // 선택 번호 초기화 (핵심: 버튼 재활성화)
            }
          } else if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // 자신의 데이터가 업데이트될 경우를 대비하여 처리 (다른 학생의 선택은 영향 없음)
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
  }, [router.isReady, userId]); // userId 의존성 추가

  // 사용자의 기존 선택 번호 불러오기
  const fetchUserSelection = async (currentUserId) => {
    if (!currentUserId) {
        setLoading(false); // userId가 없으면 로딩 상태 해제
        return;
    }
    
    try {
      console.log("Fetching selection for user:", currentUserId);
      const { data, error } = await supabase
        .from('student_number_selections')
        .select('selected_number')
        .eq('user_id', currentUserId)
        .maybeSingle(); // 단일 결과를 기대하거나 없는 경우 null 반환

      if (error) {
        if (error.code === 'PGRST116') { // PostgreSQL No rows found (선택된 데이터가 없음)
          console.log("No existing selection found for this user.");
        } else {
          console.error('Error fetching user selection:', error);
          setError(`선택 정보를 불러오는 데 실패했습니다: ${error.message}`);
        }
      } else if (data) {
        console.log("Found existing selection:", data.selected_number);
        setSelectedNumber(data.selected_number); // 기존 선택 불러와서 상태 업데이트
      }
    } catch (err) {
      console.error('선택 정보를 불러오는 중 오류:', err);
      setError(err.message || '선택 정보를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false); // 최종 로딩 상태 해제
    }
  };

  // 번호 선택 및 Supabase 저장 핸들러
  const handleSelection = async (number) => {
    // 요청: 이미 번호가 선택되어 있거나, 데이터 처리 중일 경우, 추가 선택을 막음
    if (selectedNumber !== null || loading) {
      console.log("Selection blocked: A number is already selected or loading. Current selected:", selectedNumber);
      return; // 여기서 함수 실행을 중단하여 다른 버튼을 눌러도 선택이 변경되지 않게 함
    }

    if (!checkSupabaseConfig()) {
      setError('Supabase 설정이 올바르지 않습니다.');
      return;
    }

    if (!userId) {
      setError('로그인 정보가 없습니다. 다시 로그인해주세요.');
      router.push('/login');
      return;
    }

    setLoading(true); // 데이터 저장 시작 시 로딩 상태 설정
    setError(null);

    try {
      console.log("Attempting to save selection:", number, "for user:", userId);
      // upsert를 사용하여 user_id가 존재하면 업데이트, 없으면 삽입
      // 이 로직은 student_number_selections 테이블의 user_id 컬럼에 UNIQUE 제약 조건이 필요합니다.
      const { data, error: upsertError } = await supabase
        .from('student_number_selections')
        .upsert(
          { username: username, selected_number: number, user_id: userId },
          { onConflict: 'user_id' } // 'user_id'를 기준으로 충돌 감지 및 업데이트
        );

      if (upsertError) {
        console.error('데이터 저장 실패:', upsertError);
        setError(`선택 저장 실패: ${upsertError.message}`);
      } else {
        console.log("Selection saved successfully");
        setSelectedNumber(number); // 성공 시 UI에 선택된 번호 반영
        alert('번호가 성공적으로 저장되었습니다!');
      }
    } catch (err) {
      console.error('선택 처리 중 오류:', err);
      setError(err.message || '번호 선택 중 오류가 발생했습니다.');
    } finally {
      setLoading(false); // 데이터 저장 완료 후 로딩 상태 해제
    }
  };

  const handleCancel = () => {
    router.push('/student');
  };

  // 로딩, 오류, UI 렌더링 로직
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
            // 핵심: selectedNumber가 null이 아니거나 로딩 중일 때 버튼 비활성화
            // 이렇게 하면 한 번 선택하면 초기화되기 전까지 다른 번호를 선택할 수 없습니다.
            disabled={selectedNumber !== null || loading}
            style={{
              padding: '20px',
              fontSize: '2em',
              fontWeight: 'bold',
              backgroundColor: selectedNumber === number ? '#28a745' : '#007bff', // 선택된 번호는 다른 색
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: (selectedNumber !== null || loading) ? 'not-allowed' : 'pointer', // 비활성화 시 마우스 커서 변경
              boxShadow: '3px 3px 8px rgba(0,0,0,0.2)',
              transition: 'background-color 0.3s ease',
              opacity: (selectedNumber !== null || loading) ? 0.6 : 1, // 비활성화 시 투명도 조절
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