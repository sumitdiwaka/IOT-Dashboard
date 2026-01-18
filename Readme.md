# 🚀 Unified IoT Dashboard

A complete, real-time IoT monitoring platform built with modern web technologies. This dashboard enables seamless integration and monitoring of multiple IoT devices with real-time data visualization, device management, and analytics.

![IoT Dashboard](https://img.shields.io/badge/IoT-Dashboard-blue)
![React](https://img.shields.io/badge/React-18.2-blue)
![Node.js](https://img.shields.io/badge/Node.js-18-green)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)
![MQTT](https://img.shields.io/badge/MQTT-4.3-orange)

## ✨ Features

### 🌐 Real-time Dashboard
- Live device monitoring with real-time updates
- Interactive charts and data visualization
- Device status indicators and metrics
- Responsive design for all screen sizes

### 🔧 Device Management
- Add, edit, and delete IoT devices
- Real-time device synchronization across browsers
- Device search and filtering
- Device status monitoring (active/inactive/offline)

### 📊 Data Analytics
- Time-series data analysis
- Device type distribution charts
- Performance metrics and statistics
- Historical data visualization

### 🔌 IoT Integration
- MQTT protocol support for IoT communication
- Simulated IoT device data generator
- Real-time data ingestion and processing
- WebSocket-based real-time updates

### 🛡️ System Features
- Modular and scalable architecture
- RESTful API design
- JWT authentication ready
- Error handling and logging
- Health monitoring endpoints

## 🏗️ System Architecture
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ IoT Devices │───▶│ MQTT Broker │───▶│ Backend API │
│ (Simulated) │ │ │ │ (Node.js) │
└─────────────────┘ └─────────────────┘ └─────────┬───────┘
│
┌─────────────────┐ ┌─────────────────┐ ┌─────────▼───────┐
│ Dashboard UI │◀───│ Socket.io │◀───│ MongoDB │
│ (React) │ │ (Real-time) │ │ Database │
└─────────────────┘ └─────────────────┘ └─────────────────┘


## 📦 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **MQTT.js** - IoT communication protocol
- **Socket.io** - Real-time bidirectional communication

### Frontend
- **React 18** - UI library
- **Material-UI** - Component library
- **Chart.js** - Data visualization
- **Socket.io Client** - Real-time updates
- **Axios** - HTTP client

### DevOps & Tools
- **Docker** - Containerization
- **Postman** - API testing
- **Git** - Version control
- **Nodemon** - Development server

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local or Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/iot-dashboard.git
cd iot-dashboard
Setup Backend

bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
Setup Frontend

bash
cd frontend
npm install
npm start
Access the Application

Backend API: http://localhost:5000

Frontend Dashboard: http://localhost:3000

API Documentation: http://localhost:5000/api-docs

⚙️ Configuration
Environment Variables
Backend (.env)

env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/iot_dashboard
MQTT_BROKER_URL=mqtt://test.mosquitto.org
JWT_SECRET=your_secret_key
Frontend (.env)

env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
Database Setup
bash
# Using MongoDB Atlas (Recommended)
1. Create free cluster at https://cloud.mongodb.com
2. Get connection string
3. Update MONGODB_URI in .env

# Using Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Update MONGODB_URI=mongodb://localhost:27017/iot_dashboard
📡 API Documentation
Base URL: http://localhost:5000/api
Endpoints
Health Check
text
GET /health
Returns API health status.

Devices Management
text
GET    /api/devices          - Get all devices
GET    /api/devices/:id      - Get single device
POST   /api/devices          - Create new device
PUT    /api/devices/:id      - Update device
DELETE /api/devices/:id      - Delete device
GET    /api/devices/:id/data - Get device data
GET    /api/devices/:id/stats - Get device statistics
Dashboard
text
GET /api/dashboard/summary   - Get dashboard summary
GET /api/dashboard/metrics   - Get real-time metrics
GET /api/dashboard/timeseries - Get time-series data
Example Requests
Create Device

bash
curl -X POST http://localhost:5000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "sensor-001",
    "name": "Temperature Sensor",
    "type": "temperature",
    "location": "Living Room"
  }'
Get Dashboard Summary

bash
curl http://localhost:5000/api/dashboard/summary
🎮 Device Simulator
The project includes a built-in device simulator that generates realistic IoT data:

bash
# Start simulator
cd backend
npm run simulate

# Simulated devices include:
# - Temperature sensors
# - Humidity sensors  
# - Light sensors
# - Motion sensors
# - Energy meters
🖥️ Frontend Features
Dashboard Page
Real-time metrics display
Interactive charts and graphs
Device status overview
Connection statistics

Devices Page
Device listing with search/filter
Add/edit/delete devices
Device detail views
Real-time status updates

Analytics Page:-
Historical data analysis
Device performance metrics
Usage patterns visualization

Real-time Features
Live data updates via WebSocket
Cross-browser device synchronization
Instant notifications
No page refresh required

🔧 Development
Project Structure
text
iot-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── app.js         # Main application
│   ├── .env               # Environment variables
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/     # React components
    │   ├── pages/         # Page components
    │   ├── services/      # API services
    │   └── App.js         # Main App component
    ├── public/            # Static files
    └── package.json
Running Tests
bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
Building for Production
bash
# Build frontend
cd frontend
npm run build

# Start production server
cd backend
npm start
🐳 Docker Deployment
Using Docker Compose
yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/iot_dashboard
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
Build and Run
bash
docker-compose up --build

📈 Performance Features
Real-time Optimization: WebSocket for instant updates
Database Indexing: Optimized MongoDB queries
Caching: In-memory caching for frequent requests
Lazy Loading: Code splitting for faster initial load
Pagination: Efficient data handling for large datasets

🔒 Security Features
Input Validation: Comprehensive request validation
CORS Configuration: Secure cross-origin requests
Helmet.js: Security headers
Rate Limiting: API request limiting
Environment Variables: Secure configuration management

📱 Mobile Responsive
Mobile-first design
Touch-friendly interface
Adaptive layouts
Progressive Web App ready

🤝 Contributing
Fork the repository
Create a feature branch
Commit your changes
Push to the branch
Open a Pull Request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Material-UI for the component library
Chart.js for data visualization
MQTT.js for IoT communication
Socket.io for real-time communication