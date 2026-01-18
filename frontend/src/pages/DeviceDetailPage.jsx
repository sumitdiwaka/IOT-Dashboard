import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Devices as DevicesIcon,
} from '@mui/icons-material';
import DeviceDetail from '../components/devices/DeviceDetail';

const DeviceDetailPage = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();

  return (
    <Container maxWidth="xl">
      <Box mb={4}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Dashboard
          </Link>
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate('/devices')}
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <DevicesIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Devices
          </Link>
          <Typography color="text.primary">Device Details</Typography>
        </Breadcrumbs>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" gutterBottom>
              Device Details
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Real-time data and statistics for device: {deviceId}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/devices')}
          >
            Back to Devices
          </Button>
        </Box>
      </Box>

      <DeviceDetail deviceId={deviceId} />
    </Container>
  );
};

export default DeviceDetailPage;