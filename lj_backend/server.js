// backend/server.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // import your db.js
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const journalRoutes = require('./routes/journalRoutes');

const app = express();

// Allow frontend (replace with your actual frontend URL if different)
app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5173"],
  methods: ["GET","POST","PATCH","DELETE"],
  allowedHeaders: ["Content-Type"]
}));


app.use(express.json());

// Connect to MongoDB Atlas
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/journal', journalRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
