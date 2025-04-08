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
    { label: 'Our Doctor', path: '/doctors', icon: <DoctorIcon />, auth: true },
    { label: 'Profile', path: '/profile', icon: <PersonIcon />, auth: true },
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
          
          <Box 
            component="img" 
            src="/logo.png" 
            alt="Telehealth Logo"
            sx={{ 
              height: 40, 
              mr: 2,
              display: { xs: 'none', sm: 'block' }
            }}
          />
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              Telehealth
            </Link>
          </Typography>
          
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {filteredNavItems.map((item) => (
                item.path !== '/' && (
                  <Link href={item.path} key={item.path} passHref legacyBehavior>
                    <Button 
                      component="a"
                      startIcon={item.icon}
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
                )
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
      
      <Box
        component="nav"
        sx={{ width: { md: 280 }, flexShrink: { md: 0 } }}
      >
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
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: 280, boxSizing: 'border-box', borderRight: '1px solid rgba(0, 0, 0, 0.08)' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 280px)` },
          minHeight: '100vh',
          mt: '64px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {title && (
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
        )}
        
        <Container 
          maxWidth="xl" 
          sx={{ 
            flexGrow: 1, 
            py: 2,
            px: { xs: 1, sm: 3 }
          }}
        >
          {children}
        </Container>
        
        <Box 
          component="footer" 
          sx={{ 
            py: 3, 
            borderTop: `1px solid ${theme.palette.divider}`, 
            mt: 'auto',
            backgroundColor: 'white'
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} Telehealth Platform. All rights reserved.
            </Typography>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}