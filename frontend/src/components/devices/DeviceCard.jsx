import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  IconButton,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import StatusIndicator from '../common/StatusIndicator';

const DeviceCard = ({ device, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const getDeviceIcon = (type) => {
    const icons = {
      temperature: '🌡️',
      humidity: '💧',
      pressure: '📊',
      motion: '🚶',
      light: '💡',
      energy: '⚡',
      custom: '📱',
    };
    return icons[type] || '📟';
  };

  const handleCardClick = () => {
    navigate(`/devices/${device.deviceId}`);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
        },
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" component="div" gutterBottom>
              {device.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {device.deviceId}
            </Typography>
          </Box>
          <Typography variant="h3">
            {getDeviceIcon(device.type)}
          </Typography>
        </Box>

        <Box mb={2}>
          <Chip
            label={device.type}
            size="small"
            sx={{ textTransform: 'capitalize', mb: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            📍 {device.location}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <StatusIndicator status={device.status} />
          <Typography variant="caption" color="text.secondary">
            Last seen: {new Date(device.lastSeen).toLocaleTimeString()}
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={device.isConnected ? 100 : 0}
          sx={{
            height: 4,
            borderRadius: 2,
            bgcolor: device.isConnected ? 'success.20' : 'error.20',
            '& .MuiLinearProgress-bar': {
              bgcolor: device.isConnected ? 'success.main' : 'error.main',
            },
          }}
        />
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(device);
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(device.deviceId);
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
        <IconButton size="small">
          <SettingsIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default DeviceCard;