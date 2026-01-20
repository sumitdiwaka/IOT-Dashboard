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


dotenv.config();


const deviceRoutes = require('./routes/deviceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(helmet());


app.use(cors({
    origin: [
        "https://iot-dashboard-zvl5.onrender.com",  
        "http://localhost:3000",
        "http://localhost:5000",
        "https://localhost:3000"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));


app.options('*', cors());
// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//  routers
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


app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
       
        await connectDB();
        logger.success('Database connected successfully');

      
        mqttService.connect();
        logger.success('MQTT service initialized');

        const server = app.listen(PORT, () => {
            logger.success(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });

      
        initializeSocket(server);
        logger.success('Socket.io service initialized');

    } catch (error) {
        logger.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};


process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);

    process.exit(1);
});


process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});


process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    mqttService.disconnect();
    process.exit(0);
});

startServer();

module.exports = app;