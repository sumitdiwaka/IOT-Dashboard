import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import theme from './styles/theme';
import './styles/global.css';

// Layout and Pages
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import DeviceDetailPage from './pages/DeviceDetailPage';
import Analytics from './pages/Analytics';

// Services
import socketService from './services/socket';

function App() {
  const [socketStatus, setSocketStatus] = useState('connecting');

  useEffect(() => {
    socketService.connect();

    const handleSocketConnected = () => {
      setSocketStatus('connected');
    };

    const handleSocketDisconnected = () => {
      setSocketStatus('disconnected');
    };

    socketService.subscribe('socket:connected', handleSocketConnected);
    socketService.subscribe('socket:disconnected', handleSocketDisconnected);

    const checkConnection = setInterval(() => {
      if (!socketService.isConnected && socketStatus !== 'connecting') {
        console.log('Attempting to reconnect...');
        socketService.connect();
      }
    }, 10000);

    return () => {
      socketService.unsubscribe('socket:connected', handleSocketConnected);
      socketService.unsubscribe('socket:disconnected', handleSocketDisconnected);
      clearInterval(checkConnection);
    };
  }, [socketStatus]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Layout socketStatus={socketStatus} />}>
            <Route index element={<Dashboard />} />
            <Route path="devices" element={<Devices />} />
            <Route path="devices/:deviceId" element={<DeviceDetailPage />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </ThemeProvider>
  );
}

export default App;