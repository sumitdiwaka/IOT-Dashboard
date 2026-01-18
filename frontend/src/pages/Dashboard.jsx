import React, { useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import SummaryCards from '../components/dashboard/SummaryCards';
import RealTimeMetrics from '../components/dashboard/RealTimeMetrics';
import Charts from '../components/dashboard/Charts';
import DeviceList from '../components/dashboard/DeviceList';
import socketService from '../services/socket';

const Dashboard = () => {
  useEffect(() => {
    // Connect socket when dashboard loads
    socketService.connect();

    return () => {
      // Don't disconnect - keep connection alive for other pages
    };
  }, []);

  return (
    <Container maxWidth="xl">
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Real-time monitoring of all connected IoT devices
        </Typography>
      </Box>

      <SummaryCards />
      <RealTimeMetrics />
      <Charts />
      <DeviceList />
    </Container>
  );
};

export default Dashboard;