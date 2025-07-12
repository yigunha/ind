// pages/select-4receive.js
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient'; // Supabase 클라이언트 임포트

export default function Select4Receive() {
  const [selections, setSelections] = useState({}); // { username: selectedNumber } 형태
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. 초기 데이터 불러오기
    const fetchInitialSelections = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('student_number_selections')
        .select('username, selected_number');

      if (error) {
        console.error('Error fetching initial selections:', error.message);
        setError('초기 데이터를 불러오는 데 실패했습니다.');
        setLoading(false);
        return;
      }

      const initialData = {};
      data.forEach(item => {
        initialData[item.username] = item.selected_number;
      });
      setSelections(initialData);
      setLoading(false);
    };

    fetchInitialSelections();

    // 2. Realtime 구독 설정
    const channel = supabase
      .channel('student_selections_changes') // 고유한 채널 이름
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_number_selections' },
        (payload) => {
          console.log('Realtime Change received!', payload);
          setSelections((prevSelections) => {
            const newSelections = { ...prevSelections };
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              newSelections[payload.new.username] = payload.new.selected_number;
            } else if (payload.eventType === 'DELETE') {
              delete newSelections[payload.old.username];
            }
            return newSelections;
          });
        }
      )
      .subscribe();

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // 빈 배열: 마운트 시 한 번만 실행

  // 데이터 초기화 핸들러
  const handleResetData = async () => {
    if (!window.confirm('정말로 모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('student_number_selections')
      .delete()
      .neq('username', 'non_existent_user'); // 모든 행을 삭제하기 위한 조건 (항상 참)

    if (error) {
      console.error('Error resetting data:', error.message);
      setError('데이터 초기화에 실패했습니다.');
    } else {
      setSelections({}); // 성공적으로 삭제되면 로컬 상태도 초기화
      console.log('All data reset successfully!');
    }
    setLoading(false);
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>데이터 로딩 중...</div>;
  if (error) return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>오류: {error}</div>;

  const sortedUsernames = Object.keys(selections).sort();

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h1>선택 현황판 (선생님 페이지)</h1>

      {/* 데이터 초기화 버튼 */}
      <button
        onClick={handleResetData}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#dc3545', // 빨간색
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        데이터 초기화
      </button>

      {/* 표 형태로 데이터 표시 */}
      <div style={{ marginTop: '30px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '12px 15px', borderBottom: '1px solid #ddd', textAlign: 'left' }}>username</th>
              <th style={{ padding: '12px 15px', borderBottom: '1px solid #ddd', textAlign: 'left' }}>정답</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsernames.length > 0 ? (
              sortedUsernames.map((username) => (
                <tr key={username} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 15px', textAlign: 'left' }}>{username}</td>
                  <td style={{ padding: '10px 15px', textAlign: 'left' }}>{selections[username]}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" style={{ padding: '10px 15px', textAlign: 'center', color: '#777' }}>아직 선택한 학생이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}