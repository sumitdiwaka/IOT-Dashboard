const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const mqttService = require('./services/mqttService');
const { initializeSocket } = require('./services/socketService');
const { errorHandler } = require('./middlewares/errorMiddleware');
const logger = require('./utils/logger');

// Load env vars
dotenv.config();

// Route files
const deviceRoutes = require('./routes/deviceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use(helmet());

// Enable CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Mount routers
app.use('/api/devices', deviceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date(),
        service: 'IoT Dashboard Backend',
        version: '1.0.0'
    });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Connect to database
        await connectDB();
        logger.success('Database connected successfully');

        // Start MQTT service
        mqttService.connect();
        logger.success('MQTT service initialized');

        const server = app.listen(PORT, () => {
            logger.success(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });

        // Initialize Socket.io
        initializeSocket(server);
        logger.success('Socket.io service initialized');

    } catch (error) {
        logger.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    // Close server & exit process
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    mqttService.disconnect();
    process.exit(0);
});

startServer();

module.exports = app; // For testing