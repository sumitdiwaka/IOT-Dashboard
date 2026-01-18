import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';
import {
  DeviceHub as DeviceIcon,
  Wifi as ConnectedIcon,
  WifiOff as OfflineIcon,
  Timeline as DataIcon,
} from '@mui/icons-material';
import { dashboardAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const SummaryCards = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const data = await dashboardAPI.getSummary();
      setSummary(data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching summary:', err);
      setError(err.message);
      // Set default data when API fails
      setSummary({
        totalDevices: 5,
        activeDevices: 5,
        offlineDevices: 0,
        connectionRate: 100,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !summary) return <LoadingSpinner />;

  // Default cards data
  const cards = [
    {
      title: 'Total Devices',
      value: summary?.totalDevices || 0,
      icon: <DeviceIcon fontSize="large" />,
      color: '#2196f3',
      progress: 100,
    },
    {
      title: 'Active Devices',
      value: summary?.activeDevices || 0,
      icon: <ConnectedIcon fontSize="large" />,
      color: '#4caf50',
      progress: summary?.totalDevices 
        ? (summary.activeDevices / summary.totalDevices) * 100 
        : 0,
    },
    {
      title: 'Offline Devices',
      value: summary?.offlineDevices || 0,
      icon: <OfflineIcon fontSize="large" />,
      color: '#f44336',
      progress: summary?.totalDevices 
        ? (summary.offlineDevices / summary.totalDevices) * 100 
        : 0,
    },
    {
      title: 'Connection Rate',
      value: `${summary?.connectionRate || 0}%`,
      icon: <DataIcon fontSize="large" />,
      color: '#ff9800',
      progress: summary?.connectionRate || 0,
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} lg={3} key={index}>
          <Card className="fade-in" sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: `${card.color}20`,
                    color: card.color,
                  }}
                >
                  {card.icon}
                </Box>
                <Typography variant="h4" component="div">
                  {card.value}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {card.title}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={typeof card.progress === 'number' ? card.progress : 0}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: `${card.color}20`,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: card.color,
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {typeof card.progress === 'number' ? card.progress.toFixed(1) : '0.0'}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default SummaryCards;