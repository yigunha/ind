// hash.js
const bcrypt = require('bcrypt');

const plainPassword = '1234'; // 원하는 비밀번호
bcrypt.hash(plainPassword, 10, (err, hash) => {
  if (err) throw err;
  console.log('✅ 생성된 해시:', hash);
});
