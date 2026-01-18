import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  CssBaseline,
  Toolbar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      <Header onDrawerToggle={handleDrawerToggle} />
      <Sidebar
        mobileOpen={mobileOpen}
        onDrawerToggle={handleDrawerToggle}
        isMobile={isMobile}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 280px)` },
          ml: { md: '280px' },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;