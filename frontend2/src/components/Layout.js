import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box, IconButton, Drawer, List, ListItem, ListItemText, Divider } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function Layout({ children, title = 'Telehealth Platform' }) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: 'Home', path: '/', auth: false },
    { label: 'Appointments', path: '/appointments', auth: true },
    { label: 'Find Doctor', path: '/doctors', auth: true },
    { label: 'Profile', path: '/profile', auth: true },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.auth || (item.auth && isAuthenticated)
  );

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Telehealth
      </Typography>
      <Divider />
      <List>
        {filteredNavItems.map((item) => (
          <Link href={item.path} key={item.path} passHref>
            <ListItem component="a" button>
              <ListItemText primary={item.label} />
            </ListItem>
          </Link>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link href="/" passHref>
              <Box component="a" sx={{ color: 'inherit', textDecoration: 'none' }}>
                Telehealth Platform
              </Box>
            </Link>
          </Typography>
          
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {filteredNavItems.map((item) => (
              <Link href={item.path} key={item.path} passHref>
                <Button 
                  sx={{ color: '#fff' }}
                  variant={router.pathname === item.path ? 'outlined' : 'text'}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </Box>
          
          {isAuthenticated ? (
            <Button color="inherit" onClick={logout}>Logout</Button>
          ) : (
            <Link href="/login" passHref>
              <Button color="inherit">Login</Button>
            </Link>
          )}
        </Toolbar>
      </AppBar>
      
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Container component="main" sx={{ py: 4 }}>
        {title && (
          <Typography variant="h4" component="h1" gutterBottom>
            {title}
          </Typography>
        )}
        {children}
      </Container>
      
      <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper', mt: 'auto' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Telehealth Platform. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </>
  );
}