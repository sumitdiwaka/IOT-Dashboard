import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { deviceAPI } from '../services/api';
import DeviceCard from '../components/devices/DeviceCard';
import AddDeviceModal from '../components/devices/AddDeviceModal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    type: 'success' 
  });

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ open: true, message, type });
  };

 
  const fetchDevices = async () => {
    try {
      setLoading(true);
      const data = await deviceAPI.getAllDevices();
      const validDevices = Array.isArray(data.data) ? data.data : [];
      setDevices(validDevices);
      setFilteredDevices(validDevices);
    } catch (error) {
      console.error('Error fetching devices:', error);
   
      setDevices(getMockDevices());
      setFilteredDevices(getMockDevices());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    

    const handleCrossTabEvent = (event) => {
      console.log('Cross-tab event received:', event);
      
      if (event.type === 'iot-device-added' && event.detail) {
        const { type, device } = event.detail;
        
        if (type === 'added') {
          
          const exists = devices.find(d => d.deviceId === device.deviceId);
          if (!exists) {
            // Add new device
            setDevices(prev => [...prev, device]);
            setFilteredDevices(prev => [...prev, device]);
            showNotification(`New device added: ${device.name}`, 'success');
          }
        }
      }
    };

 
    window.addEventListener('iot-device-added', handleCrossTabEvent);
    
  
    const handleStorageChange = (e) => {
      if (e.key === 'iot-last-device-added' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data.type === 'added' && data.device) {
            const exists = devices.find(d => d.deviceId === data.device.deviceId);
            if (!exists) {
              setDevices(prev => [...prev, data.device]);
              setFilteredDevices(prev => [...prev, data.device]);
              showNotification(`New device added: ${data.device.name}`, 'success');
            }
          }
        } catch (err) {
          console.error('Error parsing storage data:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('iot-device-added', handleCrossTabEvent);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [devices]); 

 
  useEffect(() => {
    const filtered = devices.filter(device => {
      if (!device) return false;
      
      const searchLower = searchTerm.toLowerCase();
      const name = device.name || '';
      const deviceId = device.deviceId || '';
      const location = device.location || '';
      const type = device.type || '';
      
      return (
        name.toLowerCase().includes(searchLower) ||
        deviceId.toLowerCase().includes(searchLower) ||
        location.toLowerCase().includes(searchLower) ||
        type.toLowerCase().includes(searchLower)
      );
    });
    setFilteredDevices(filtered);
  }, [searchTerm, devices]);


  const getMockDevices = () => [
    {
      deviceId: 'temp-sensor-001',
      name: 'Temperature Sensor 001',
      type: 'temperature',
      location: 'Living Room',
      status: 'active',
      isConnected: true,
      lastSeen: new Date().toISOString(),
    },
    {
      deviceId: 'humidity-sensor-001',
      name: 'Humidity Sensor 001',
      type: 'humidity',
      location: 'Kitchen',
      status: 'active',
      isConnected: true,
      lastSeen: new Date().toISOString(),
    },
    {
      deviceId: 'light-sensor-001',
      name: 'Light Sensor 001',
      type: 'light',
      location: 'Office',
      status: 'active',
      isConnected: true,
      lastSeen: new Date().toISOString(),
    },
  ];

  const handleAddDevice = () => {
    setEditingDevice(null);
    setOpenModal(true);
  };

  const handleEditDevice = (device) => {
    setEditingDevice(device);
    setOpenModal(true);
  };

  const handleDeleteDevice = async (deviceId) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        await deviceAPI.deleteDevice(deviceId);
        // Remove from local state
        setDevices(prev => prev.filter(d => d.deviceId !== deviceId));
        setFilteredDevices(prev => prev.filter(d => d.deviceId !== deviceId));
        showNotification('Device deleted successfully', 'warning');
      } catch (error) {
        console.error('Error deleting device:', error);
      }
    }
  };

  const handleModalClose = (refresh = false) => {
    setOpenModal(false);
    setEditingDevice(null);
    if (refresh) {
      fetchDevices();
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading && devices.length === 0) {
    return (
      <Container maxWidth="xl">
        <LoadingSpinner />
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="xl">
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Device Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                 REAL-TIME: Add a device and watch it appear in other tabs instantly!
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddDevice}
            >
              Add Device
            </Button>
          </Box>

          <Card>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    placeholder="Search devices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FilterIcon />}
                    onClick={fetchDevices}
                  >
                    Refresh List
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        <Box mb={2}>
          <Typography variant="body2" color="text.secondary">
            Total Devices: {devices.length} | Showing: {filteredDevices.length}
          </Typography>
        </Box>

        {filteredDevices.length === 0 ? (
          <Card>
            <CardContent>
              <Typography align="center" color="text.secondary" py={4}>
                {searchTerm ? 'No devices found matching your search' : 'No devices found. Add your first device!'}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {filteredDevices.map((device) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={device.deviceId}>
                <DeviceCard
                  device={device}
                  onEdit={handleEditDevice}
                  onDelete={handleDeleteDevice}
                />
              </Grid>
            ))}
          </Grid>
        )}

        <AddDeviceModal
          open={openModal}
          onClose={handleModalClose}
          device={editingDevice}
        />
      </Container>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.type}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Devices;