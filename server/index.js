require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const connectDB = require('../server/src/config/db');
const { errorHandler, notFound } = require('./src/middleware/errorMiddleware');

const authRoutes = require('./src/routes/authRoutes');
const resumeRoutes = require('./src/routes/resumeRoutes');
const analysisRoutes = require('./src/routes/analysisRoutes');
const jobRoutes = require('./src/routes/jobRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ uploads/ folder created');
}

// Security
app.use(helmet());

// CORS — allow all localhost ports
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('dev'));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/job', jobRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running ✅' });
});

// Error handling — always last
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
