import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  
} from '@mui/icons-material';
import { dashboardAPI } from '../../services/api';
import socketService from '../../services/socket';
import StatusIndicator from '../common/StatusIndicator';

const RealTimeMetrics = () => {
  const [metrics, setMetrics] = useState({ totalReadings: 0, activeDevicesCount: 0 });
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchMetrics();
    
    // Subscribe to real-time updates
    socketService.subscribe('dashboard:update', handleRealTimeUpdate);
    
    const interval = setInterval(fetchMetrics, 10000); // Refresh every 10 seconds
    
    return () => {
      socketService.unsubscribe('dashboard:update', handleRealTimeUpdate);
      clearInterval(interval);
    };
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await dashboardAPI.getMetrics();
      setMetrics(data.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRealTimeUpdate = (data) => {
    setMetrics(prev => ({
      ...prev,
      totalReadings: prev.totalReadings + 1,
    }));
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" component="div">
            Real-time Metrics
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label="Live"
              color="success"
              size="small"
              icon={<TrendingUpIcon fontSize="small" />}
            />
            <IconButton size="small" onClick={fetchMetrics} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: 'primary.dark',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Typography variant="h3" component="div" gutterBottom>
                {metrics.totalReadings.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Data Readings
              </Typography>
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  fontSize: 100,
                  opacity: 0.1,
                }}
              >
                📊
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: 'secondary.dark',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Typography variant="h3" component="div" gutterBottom>
                {metrics.activeDevicesCount}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Active Devices Streaming
              </Typography>
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  fontSize: 100,
                  opacity: 0.1,
                }}
              >
                📡
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Last Update
                  </Typography>
                  <Typography variant="body1">
                    {formatTime(lastUpdate)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="text.secondary">
                    Data Flow
                  </Typography>
                  <StatusIndicator status="active" />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default RealTimeMetrics;