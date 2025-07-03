const bcrypt = require("bcryptjs");

bcrypt.hash("1234", 10).then(hash => {
  console.log("해시된 비밀번호:", hash);
});
