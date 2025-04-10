// frontend/src/components/Layout.js

import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Box, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  MedicalServices,
  MedicalServices as DoctorIcon,
  ArrowDropDown as ArrowIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function Layout({ children, title = 'Telehealth Platform' }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  const navItems = [
    { label: 'Home', path: '/', icon: <HomeIcon />, auth: false },
    { label: 'Appointments', path: '/appointments', icon: <CalendarIcon />, auth: true },
    { label: 'Our Doctors', path: '/doctors', icon: <DoctorIcon />, auth: true },
    { label: 'Services', path: '/services', icon: <MedicalServices />, auth: false },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.auth || (item.auth && isAuthenticated)
  );

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ width: 280 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        py: 3,
        backgroundColor: theme.palette.primary.main,
        color: 'white'
      }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Telehealth
        </Typography>
        {isAuthenticated && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Avatar 
              sx={{ 
                width: 60, 
                height: 60, 
                bgcolor: theme.palette.secondary.main,
                mx: 'auto',
                mb: 1
              }}
            >
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </Avatar>
            <Typography variant="body1">
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {user?.role === 'patient' ? 'Patient' : user?.role === 'doctor' ? 'Doctor' : 'Admin'}
            </Typography>
          </Box>
        )}
      </Box>
      <Divider />
      <List>
        {filteredNavItems.map((item) => (
          <Link href={item.path} key={item.path} passHref legacyBehavior>
            <ListItem 
              button 
              component="a"
              selected={router.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(0, 99, 176, 0.08)',
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main
                  }
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 99, 176, 0.04)',
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          </Link>
        ))}
      </List>
      {isAuthenticated && (
        <>
          <Divider />
          <List>
            <ListItem button onClick={logout}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: 'white',
          color: theme.palette.text.primary
        }}
        elevation={0}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Box 
              component="img" 
              src="/logo.png" 
              alt="Dr.Ndaara Logo"
              sx={{ 
                height: 40, 
                mr: 2,
                display: 'block'
              }}
            />
            <Typography variant="h6" component="div" sx={{ flexGrow: 0, fontWeight: 800, color: theme.palette.primary.main }}>
              Dr.Ndaara
            </Typography>
          </Link>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {filteredNavItems.map((item) => (
                <Link href={item.path} key={item.path} passHref legacyBehavior>
                  <Button 
                    component="a"
                    sx={{ 
                      mx: 1,
                      color: router.pathname === item.path ? theme.palette.primary.main : 'inherit',
                      fontWeight: router.pathname === item.path ? 600 : 400,
                      '&:hover': {
                        backgroundColor: 'rgba(0, 99, 176, 0.04)',
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </Box>
          )}
          
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button 
                onClick={handleProfileMenuOpen}
                sx={{ 
                  textTransform: 'none',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: theme.palette.primary.main,
                    fontSize: '0.875rem'
                  }}
                >
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </Avatar>
                {!isMobile && (
                  <>
                    <Box sx={{ ml: 1, textAlign: 'left' }}>
                      <Typography variant="body2" component="span">
                        {user?.firstName}
                      </Typography>
                    </Box>
                    <ArrowIcon />
                  </>
                )}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{
                  elevation: 2,
                  sx: { minWidth: 200, mt: 1 }
                }}
              >
                <Link href="/profile" passHref legacyBehavior>
                  <MenuItem component="a" onClick={handleProfileMenuClose}>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="My Profile" />
                  </MenuItem>
                </Link>
                <Link href="/appointments" passHref legacyBehavior>
                  <MenuItem component="a" onClick={handleProfileMenuClose}>
                    <ListItemIcon>
                      <CalendarIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="My Appointments" />
                  </MenuItem>
                </Link>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box>
              <Link href="/login" passHref legacyBehavior>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  sx={{ mr: 2 }}
                >
                  Log In
                </Button>
              </Link>
              <Link href="/register" passHref legacyBehavior>
                <Button 
                  variant="contained" 
                  color="primary"
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                >
                  Sign Up
                </Button>
              </Link>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 280, boxSizing: 'border-box' },
        }}
      >
        {drawer}
      </Drawer>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          minHeight: '100vh',
          mt: '64px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {title && router.pathname !== '/' && (
          <Container maxWidth="xl" sx={{ pt: 4 }}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 600, 
                mb: 4, 
                color: theme.palette.text.primary,
                borderBottom: `1px solid ${theme.palette.divider}`,
                pb: 2
              }}
            >
              {title}
            </Typography>
          </Container>
        )}
        
        <Box sx={{ flexGrow: 1 }}>
          {children}
        </Box>
        
        <Box 
          component="footer" 
          sx={{ 
            py: 4, 
            mt: 'auto',
            backgroundColor: theme.palette.grey[100],
            borderTop: `1px solid ${theme.palette.divider}`
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <Box sx={{ mb: { xs: 3, md: 0 } }}>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Telehealth Platform
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  © {new Date().getFullYear()} Dr. Ndaara Telehealth Platform. All rights reserved.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Company
                  </Typography>
                  <Link href="/about" passHref legacyBehavior>
                    <Typography component="a" variant="body2" color="text.secondary" sx={{ display: 'block', mb: 1, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                      About Us
                    </Typography>
                  </Link>
                  <Link href="/contact" passHref legacyBehavior>
                    <Typography component="a" variant="body2" color="text.secondary" sx={{ display: 'block', mb: 1, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                      Contact
                    </Typography>
                  </Link>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Resources
                  </Typography>
                  <Link href="/faq" passHref legacyBehavior>
                    <Typography component="a" variant="body2" color="text.secondary" sx={{ display: 'block', mb: 1, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                      FAQ
                    </Typography>
                  </Link>
                  <Link href="/services" passHref legacyBehavior>
                    <Typography component="a" variant="body2" color="text.secondary" sx={{ display: 'block', mb: 1, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                      Services
                    </Typography>
                  </Link>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Legal
                  </Typography>
                  <Link href="/privacy" passHref legacyBehavior>
                    <Typography component="a" variant="body2" color="text.secondary" sx={{ display: 'block', mb: 1, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                      Privacy Policy
                    </Typography>
                  </Link>
                  <Link href="/terms" passHref legacyBehavior>
                    <Typography component="a" variant="body2" color="text.secondary" sx={{ display: 'block', mb: 1, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                      Terms of Service
                    </Typography>
                  </Link>
                </Box>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}