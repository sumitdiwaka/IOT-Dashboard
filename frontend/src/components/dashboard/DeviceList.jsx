import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
} from '@mui/material';
import { deviceAPI } from '../../services/api';
import DeviceCard from '../devices/DeviceCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const DeviceList = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDevices = async () => {
    try {
      const data = await deviceAPI.getAllDevices();
      // Get only active devices for dashboard
      const activeDevices = data.data.slice(0, 4); // Show first 4 devices
      setDevices(activeDevices);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAll = () => {
    navigate('/devices');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Recently Active Devices
          </Typography>
          <Button
            variant="text"
            size="small"
            onClick={handleViewAll}
          >
            View All Devices
          </Button>
        </Box>

        {devices.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">
              No active devices found. Devices will appear here when connected.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {devices.map((device) => (
              <Grid item xs={12} sm={6} md={3} key={device.deviceId}>
                <DeviceCard
                  device={device}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default DeviceList;