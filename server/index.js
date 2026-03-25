const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

// CONNECT DATABASE
connectDB();

const app = express();

// // MIDDLEWARE
// app.use(cors());
// app.use(express.json());

// // ROUTES
// app.use("/api/auth", require("./routes/auth"));
// app.use("/api/students", require("./routes/students"));
// app.use("/api/teachers", require("./routes/teachers"));
// app.use("/api/lessons", require("./routes/lessons"));

// TEST
app.get("/", (req, res) => {
  res.send("LearnBright API Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});