import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { deviceAPI } from '../../services/api';
import socketService from '../../services/socket';
import StatusIndicator from '../common/StatusIndicator';
import LoadingSpinner from '../common/LoadingSpinner';

const DeviceDetail = ({ deviceId }) => {
  const [device, setDevice] = useState(null);
  const [deviceData, setDeviceData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [realTimeData, setRealTimeData] = useState(null);

  useEffect(() => {
    fetchDeviceDetails();
    socketService.joinDeviceRoom(deviceId);
    socketService.subscribe('device:data', handleRealTimeData);

    const interval = setInterval(fetchDeviceDetails, 30000);

    return () => {
      socketService.leaveDeviceRoom(deviceId);
      socketService.unsubscribe('device:data', handleRealTimeData);
      clearInterval(interval);
    };
  }, [deviceId]);

  const fetchDeviceDetails = async () => {
    try {
      setLoading(true);
      const [deviceRes, dataRes, statsRes] = await Promise.all([
        deviceAPI.getDevice(deviceId),
        deviceAPI.getDeviceData(deviceId, { limit: 10 }),
        deviceAPI.getDeviceStats(deviceId),
      ]);
      
      setDevice(deviceRes.data);
      setDeviceData(dataRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching device details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRealTimeData = (data) => {
    if (data.deviceId === deviceId) {
      setRealTimeData(data);
      // Add to recent data
      setDeviceData(prev => [{
        timestamp: new Date(data.timestamp),
        data: data.data,
      }, ...prev.slice(0, 9)]);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!device) return <Typography>Device not found</Typography>;

  const getValueDisplay = (data) => {
    if (!data || typeof data !== 'object') return 'N/A';
    
    const firstKey = Object.keys(data)[0];
    const value = data[firstKey];
    const unit = data.unit || '';
    
    return `${value} ${unit}`;
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={4}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
              <Box>
                <Typography variant="h5" gutterBottom>
                  {device.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {device.deviceId}
                </Typography>
              </Box>
              <IconButton onClick={fetchDeviceDetails}>
                <RefreshIcon />
              </IconButton>
            </Box>

            <Box mb={3}>
              <Chip label={device.type} sx={{ mb: 1, textTransform: 'capitalize' }} />
              <Typography variant="body2" color="text.secondary" gutterBottom>
                📍 {device.location}
              </Typography>
              <StatusIndicator status={device.status} />
            </Box>

            {stats && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Today's Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4">
                        {stats.todayCount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Readings Today
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" color={stats.change >= 0 ? 'success.main' : 'error.main'}>
                        {stats.change >= 0 ? '+' : ''}{stats.change}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        vs Yesterday
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>

        {realTimeData && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Live Data
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'primary.dark', borderRadius: 2, color: 'white' }}>
                <Typography variant="h3" align="center">
                  {getValueDisplay(realTimeData.data)}
                </Typography>
                <Typography variant="caption" align="center" display="block">
                  Updated: {new Date(realTimeData.timestamp).toLocaleTimeString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
      </Grid>

      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">
                <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Recent Data
              </Typography>
              <IconButton size="small">
                <DownloadIcon />
              </IconButton>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deviceData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {new Date(row.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getValueDisplay(row.data)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: 'success.main',
                              mr: 1,
                            }}
                          />
                          <Typography variant="caption">
                            Received
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default DeviceDetail;