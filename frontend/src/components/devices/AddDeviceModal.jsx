import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { deviceAPI } from '../../services/api';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  maxWidth: '90vw',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const deviceTypes = [
  'temperature',
  'humidity',
  'pressure',
  'motion',
  'light',
  'energy',
  'custom'
];

const AddDeviceModal = ({ open, onClose, device }) => {
  const [formData, setFormData] = useState({
    deviceId: '',
    name: '',
    type: 'temperature',
    location: '',
    metadata: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (device) {
      setFormData({
        deviceId: device.deviceId,
        name: device.name,
        type: device.type,
        location: device.location,
        metadata: device.metadata || {},
      });
    } else {
      resetForm();
    }
  }, [device]);

  const resetForm = () => {
    setFormData({
      deviceId: '',
      name: '',
      type: 'temperature',
      location: '',
      metadata: {},
    });
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    if (device) {
      // Update existing device
      await deviceAPI.updateDevice(device.deviceId, formData);
    } else {
      // Create new device
      const result = await deviceAPI.createDevice(formData);
      const newDevice = result.data;
   
      const event = new CustomEvent('iot-device-added', {
        detail: { type: 'added', device: newDevice }
      });
      window.dispatchEvent(event);
      
      // Also use localStorage for backup
      localStorage.setItem('iot-last-device-added', JSON.stringify({
        type: 'added',
        device: newDevice,
        timestamp: Date.now()
      }));
      
      y
      setTimeout(() => {
        localStorage.removeItem('iot-last-device-added');
      }, 100);
    }
    
    onClose(true);
    resetForm();
  } catch (err) {
    setError(err.message || 'Something went wrong');
  } finally {
    setLoading(false);
  }
};

  const handleClose = () => {
    resetForm();
    onClose(false);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
    >
      <Box sx={style}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography id="modal-title" variant="h6" component="h2">
            {device ? 'Edit Device' : 'Add New Device'}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {error && (
          <Box sx={{ bgcolor: 'error.dark', color: 'white', p: 2, borderRadius: 1, mb: 2 }}>
            {error}
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Device ID"
                name="deviceId"
                value={formData.deviceId}
                onChange={handleChange}
                disabled={!!device}
                helperText="Unique identifier for the device"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Device Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Device Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  label="Device Type"
                  onChange={handleChange}
                >
                  {deviceTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      <Chip 
                        label={type} 
                        size="small" 
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                helperText="Physical location of the device"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Metadata (JSON)"
                name="metadata"
                value={JSON.stringify(formData.metadata, null, 2)}
                onChange={(e) => {
                  try {
                    const value = JSON.parse(e.target.value);
                    setFormData(prev => ({ ...prev, metadata: value }));
                  } catch (err) {
                    
                    handleChange(e);
                  }
                }}
                multiline
                rows={3}
                helperText="Additional device configuration in JSON format"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Saving...' : (device ? 'Update' : 'Add Device')}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default AddDeviceModal;