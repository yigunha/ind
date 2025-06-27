// logout 함수
export function logout() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}

// 역할 검사 + 세션 시간 체크
export function checkRole(requiredRole) {
  const role = sessionStorage.getItem('role');
  const loginTime = parseInt(sessionStorage.getItem('loginTime'), 10);
  const now = Date.now();
  const maxSession = 60 * 60 * 1000; // 60분

  if (!role || role !== requiredRole || isNaN(loginTime) || now - loginTime > maxSession) {
    alert('접근 권한이 없거나 세션이 만료되었습니다.');
    logout();
  }
}

// 자동 로그아웃: 60분 내 무활동 시 로그아웃
export function startAutoLogout(minutes = 60) {
  const ms = minutes * 60 * 1000;
  let timeout;

  function reset() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      alert('자동 로그아웃되었습니다.');
      logout();
    }, ms);
  }

  window.addEventListener('mousemove', reset);
  window.addEventListener('keydown', reset);
  window.addEventListener('click', reset);
  reset();
}
