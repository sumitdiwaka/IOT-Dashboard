import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  useTheme,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Devices as DevicesIcon,
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
  Cloud as CloudIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Devices', icon: <DevicesIcon />, path: '/devices' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
  { text: 'Real-time', icon: <TimelineIcon />, path: '/realtime' },
  { text: 'IoT Cloud', icon: <CloudIcon />, path: '/cloud' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const Sidebar = ({ mobileOpen, onDrawerToggle, isMobile }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const drawerContent = (
    <Box sx={{ overflow: 'auto' }}>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
          IoT Platform
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          v1.0.0
        </Typography>
      </Box>
      
      <Divider />
      
      <List>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              button
              key={item.text}
              onClick={() => {
                navigate(item.path);
                if (isMobile) onDrawerToggle();
              }}
              sx={{
                mb: 1,
                mx: 1,
                borderRadius: 2,
                bgcolor: isActive ? 'primary.main' : 'transparent',
                color: isActive ? 'white' : 'text.primary',
                '&:hover': {
                  bgcolor: isActive ? 'primary.dark' : 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ color: isActive ? 'white' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          );
        })}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Connected Devices: 5
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
          Last Update: Just now
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 280,
              bgcolor: 'background.paper',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 280,
              bgcolor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;