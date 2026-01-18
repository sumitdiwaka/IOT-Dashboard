import React from 'react';
import { Box, Typography } from '@mui/material';

const StatusIndicator = ({ status, size = 'medium' }) => {
  const getStatusConfig = (status) => {
    const configs = {
      active: { color: 'success', label: 'Active' },
      inactive: { color: 'warning', label: 'Inactive' },
      offline: { color: 'error', label: 'Offline' },
      error: { color: 'error', label: 'Error' },
      connected: { color: 'success', label: 'Connected' },
      disconnected: { color: 'error', label: 'Disconnected' },
    };
    return configs[status] || { color: 'default', label: status };
  };

  const config = getStatusConfig(status);

  return (
    <Box display="flex" alignItems="center">
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          bgcolor: `${config.color}.main`,
          mr: 1,
          animation: status === 'active' ? 'pulse 2s infinite' : 'none',
        }}
      />
      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
        {config.label}
      </Typography>
    </Box>
  );
};

export default StatusIndicator;