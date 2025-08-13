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

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>데이터 로딩 중...</div>;
  if (error) return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>오류: {error}</div>;

  const sortedUsernames = Object.keys(selections).sort();

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h1>선택 현황판 (선생님 페이지)</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '15px', marginTop: '30px' }}>
        {sortedUsernames.length > 0 ? (
          sortedUsernames.map((username) => (
            <div
              key={username}
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '15px',
                backgroundColor: '#f9f9f9',
                boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
              }}
            >
              <h3 style={{ margin: '0 0 10px', fontSize: '18px', color: '#333' }}>{username}</h3>
              <p style={{ margin: '0', fontSize: '28px', fontWeight: 'bold', color: '#007bff' }}>{selections[username]}</p>
            </div>
          ))
        ) : (
          <p style={{ gridColumn: '1 / -1', color: '#777' }}>아직 선택한 학생이 없습니다.</p>
        )}
      </div>
    </div>
  );
}