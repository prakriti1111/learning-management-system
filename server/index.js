require('dotenv').config();
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
console.log("PORT:", process.env.PORT);
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');
const cron     = require('node-cron');

const app = express();

app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/admin',     require('./routes/admin'));
app.use('/api/students',  require('./routes/students'));
app.use('/api/teachers',  require('./routes/teachers'));
app.use('/api/parents',   require('./routes/parents'));
app.use('/api/lessons',   require('./routes/lessons'));
app.use('/api/progress',  require('./routes/progress'));
app.use('/api/meetings',  require('./routes/meetings'));
app.use('/api/quizzes',   require('./routes/quizzes'));
app.use('/api/feedback',  require('./routes/feedback'));
app.use('/api/ai',        require('./routes/ai'));
app.use('/api/analytics', require('./routes/analytics'));

app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', time: new Date().toISOString() })
);

app.get('/', (req, res) => {
  res.send('ShikshaHub Backend Running...! 🚀');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

cron.schedule('30 2 * * 0', async () => {
  try {
    const { generateWeeklyParentReports } = require('./services/reportService');
    await generateWeeklyParentReports();
  } catch (e) {
    console.error('[CRON] Weekly reports failed:', e.message);
  }
}, { timezone: 'UTC' });

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  });