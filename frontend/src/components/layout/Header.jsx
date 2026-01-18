import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import socketService from '../../services/socket';

const Header = ({ onDrawerToggle }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [socketStatus, setSocketStatus] = useState(false);

  React.useEffect(() => {
    socketService.subscribe('socket:connected', (data) => {
      setSocketStatus(data.connected);
    });
    
    socketService.subscribe('socket:disconnected', (data) => {
      setSocketStatus(data.connected);
    });

    return () => {
      socketService.unsubscribe('socket:connected');
      socketService.unsubscribe('socket:disconnected');
    };
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
          
          <Chip
            label={socketStatus ? 'Live' : 'Offline'}
            color={socketStatus ? 'success' : 'error'}
            size="small"
            sx={{ ml: 2 }}
          />
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