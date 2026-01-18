import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
  useEffect(() => {
    // Initialize socket connection
    socketService.connect();

    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
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