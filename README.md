### 🗃️ 데이터베이스 초기화 (users 테이블 생성)

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student'))
);
