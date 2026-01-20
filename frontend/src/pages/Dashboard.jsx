// import React, { useEffect } from 'react';
// import { Container, Typography, Box } from '@mui/material';
// import SummaryCards from '../components/dashboard/SummaryCards';
// import RealTimeMetrics from '../components/dashboard/RealTimeMetrics';
// import Charts from '../components/dashboard/Charts';
// import DeviceList from '../components/dashboard/DeviceList';
// import socketService from '../services/socket';

// const Dashboard = () => {
//   useEffect(() => {
//     // Connect socket when dashboard loads
//     socketService.connect();

//     return () => {
//       // Don't disconnect - keep connection alive for other pages
//     };
//   }, []);

//   return (
//     <Container maxWidth="xl">
//       <Box mb={4}>
//         <Typography variant="h4" gutterBottom>
//           Dashboard Overview
//         </Typography>
//         <Typography variant="body1" color="text.secondary">
//           Real-time monitoring of all connected IoT devices
//         </Typography>
//       </Box>

//       <SummaryCards />
//       <RealTimeMetrics />
//       <Charts />
//       <DeviceList />
//     </Container>
//   );
// };

// export default Dashboard;

import React, { useEffect } from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';
import SummaryCards from '../components/dashboard/SummaryCards';
import RealTimeMetrics from '../components/dashboard/RealTimeMetrics';
import Charts from '../components/dashboard/Charts';
import DeviceList from '../components/dashboard/DeviceList';
import socketService from '../services/socket';
import { dataSimulator } from '../services/dataSimulator';

const Dashboard = () => {
  useEffect(() => {
    // Connect socket
    socketService.connect();
    
    // Start data simulator
    dataSimulator.start();
    
    // Update title with live indicator
    const originalTitle = document.title;
    const interval = setInterval(() => {
      document.title = document.title.includes('●') 
        ? originalTitle 
        : `● ${originalTitle}`;
    }, 1000);

    return () => {
      socketService.disconnect();
      dataSimulator.stop();
      clearInterval(interval);
      document.title = originalTitle;
    };
  }, []);

  return (
    <Container maxWidth="xl">
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h4" gutterBottom>
              📊 IoT Dashboard Live
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Real-time monitoring of connected devices 
            </Typography>
          </Box>
          <Alert severity="info" sx={{ maxWidth: 400 }}>
            <Typography variant="caption">
              🔥 <strong>Live Mode Active</strong> - Data updates in real-time
            </Typography>
          </Alert>
        </Box>
      </Box>

      <SummaryCards />
      <RealTimeMetrics />
      <Charts />
      <DeviceList />
      
      {/* Live Status Indicator */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          🔄 Auto-refresh enabled • 📡 Listening for MQTT data • ⚡ Real-time processing
        </Typography>
      </Box>
    </Container>
  );
};

export default Dashboard;