import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
} from '@mui/icons-material';
import socketService from '../../services/socket';

const Header = ({ onDrawerToggle, socketStatus = 'connected' }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(socketStatus);

  useEffect(() => {
    const handleSocketConnected = () => {
      setConnectionStatus('connected');
    };

    const handleSocketDisconnected = () => {
      setConnectionStatus('disconnected');
    };

    socketService.subscribe('socket:connected', handleSocketConnected);
    socketService.subscribe('socket:disconnected', handleSocketDisconnected);

    return () => {
      socketService.unsubscribe('socket:connected', handleSocketConnected);
      socketService.unsubscribe('socket:disconnected', handleSocketDisconnected);
    };
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getConnectionColor = () => {
    switch(connectionStatus) {
      case 'connected': return 'success';
      case 'connecting': return 'warning';
      case 'disconnected': return 'error';
      default: return 'default';
    }
  };

  const getConnectionLabel = () => {
    switch(connectionStatus) {
      case 'connected': return 'Live';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Offline';
      default: return 'Unknown';
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Avatar
            sx={{
              mr: 2,
              bgcolor: 'primary.main',
              width: 40,
              height: 40,
            }}
          >
            IoT
          </Avatar>
          <Typography variant="h6" noWrap component="div" sx={{ color: 'text.primary' }}>
            Unified IoT Dashboard
          </Typography>
          
          <Tooltip title={`Socket: ${connectionStatus}`}>
            <Chip
              label={getConnectionLabel()}
              color={getConnectionColor()}
              size="small"
              icon={connectionStatus === 'connected' ? <WifiIcon /> : <WifiOffIcon />}
              sx={{ ml: 2 }}
            />
          </Tooltip>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <IconButton color="inherit">
            <SettingsIcon />
          </IconButton>
          
          <IconButton onClick={handleMenuOpen}>
            <Avatar sx={{ width: 32, height: 32 }}>U</Avatar>
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
          <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
          <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;