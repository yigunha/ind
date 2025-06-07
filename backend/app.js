const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
const pg = require('pg');
const pgSession = require('connect-pg-simple')(session);
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const pgPool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const sessionMiddleware = session({
  store: new pgSession({ pool: pgPool }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
});

app.use(sessionMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/views')));

const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
app.use('/auth', authRoutes);
app.use('/upload', uploadRoutes);

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

const responseCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
const respondedUsers = new Set();

io.on('connection', (socket) => {
  const session = socket.request.session;
  if (!session || !session.user) return;

  const userId = session.user.username;
  const role = session.user.role;

  socket.on('submitChoice', (number) => {
    if (role !== 'student') return;
    if (!respondedUsers.has(userId) && [1, 2, 3, 4].includes(number)) {
      responseCounts[number]++;
      respondedUsers.add(userId);
      io.emit('updateCounts', responseCounts);
    }
  });

  socket.on('cancelChoice', (number) => {
    if (role !== 'student') return;
    if (respondedUsers.has(userId)) {
      if (responseCounts[number] > 0) responseCounts[number]--;
      respondedUsers.delete(userId);
      io.emit('updateCounts', responseCounts);
    }
  });

  socket.on('resetAll', () => {
    if (role !== 'teacher') return;
    Object.keys(responseCounts).forEach(key => responseCounts[key] = 0);
    respondedUsers.clear();
    io.emit('updateCounts', responseCounts);
    io.emit('resetAll');  // 🔁 student 버튼도 초기화용 전파
  });

  if (role === 'teacher') {
    socket.emit('updateCounts', responseCounts);
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
