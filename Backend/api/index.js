// backend/api/index.js
const express = require('express');
const cors = require('cors');
const connectDB = require('../config/db'); // Adjust path if necessary

const app = express();
connectDB();

// Updated CORS configuration
const allowedOrigins = [
  'http://localhost:5173', // Your local frontend
  'https://your-frontend-app.vercel.app', // You'll update this later
];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Your routes
app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/leads', require('../routes/leadRoutes'));

// Export the app for Vercel
module.exports = app;