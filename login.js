import { supabase } from './supabase.js';

async function loadBcrypt() {
  const bcrypt = await import('https://cdn.jsdelivr.net/npm/bcryptjs@2.4.3/dist/bcrypt.min.js');
  return bcrypt;
}

async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (!username || !password) {
    alert('아이디와 비밀번호를 입력하세요.');
    return;
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !data) {
    alert('아이디를 찾을 수 없습니다.');
    return;
  }

  const bcrypt = await loadBcrypt();
  const isCorrect = bcrypt.compareSync(password, data.password);
  if (!isCorrect) {
    alert('비밀번호가 틀렸습니다.');
    return;
  }

  // ✅ sessionStorage로 저장
  sessionStorage.setItem('role', data.role);
  sessionStorage.setItem('username', data.username);
  sessionStorage.setItem('loginTime', Date.now());

  if (data.role === 'admin') {
    window.location.href = 'admin.html';
  } else if (data.role === 'teacher') {
    window.location.href = 'teacher.html';
  } else {
    window.location.href = 'student.html';
  }
}

window.login = login;
