const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

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

dotenv.config();

// CONNECT DATABASE
connectDB();


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});