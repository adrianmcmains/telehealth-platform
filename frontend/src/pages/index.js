import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Container, 
  Grid, 
  Typography, 
  useTheme,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  InputAdornment,
  useMediaQuery
} from '@mui/material';
import { 
  VideoCall, 
  MedicalServices, 
  Person, 
  ArrowForward,
  CheckCircle,
  DevicesOther,
  Lock,
  AccessTime,
  CalendarToday,
  Search,
  Badge
} from '@mui/icons-material';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Mock upcoming appointment for authenticated users
  const upcomingAppointment = isAuthenticated ? {
    id: 1,
    doctorName: "Dr. Sarah Johnson",
    date: "2025-04-10T14:30:00",
    specialty: "Family Medicine"
  } : null;

  const commonConditions = [
    'Hypertension', 
    'Weight Loss', 
    'Kidney Revitalation',
    'Allergies',
    'Rash',
    'Mental Health',
    'Sinus Infection',
    'Pink Eye'
  ];

  // Common specialties
  const specialties = [
    { name: 'Primary Care', icon: <MedicalServices /> },
    { name: 'Mental Health', icon: <Person /> },
    { name: 'Pediatrics', icon: <Person /> },
    { name: 'Women\'s Health', icon: <MedicalServices /> },
    { name: 'Chronic Care', icon: <Badge /> },
    { name: 'Dermatology', icon: <MedicalServices /> }
  ];

  // Handler for direct navigation
  const handleStartVisit = () => {
    if (isAuthenticated) {
      router.push('/doctors');
    } else {
      router.push('/register');
    }
  };

  // Personalized greeting for authenticated users
  const renderUserGreeting = () => {
    if (!isAuthenticated || !user) return null;
    
    return (
      <Box sx={{ 
        bgcolor: 'rgba(255, 255, 255, 0.1)', 
        p: 2, 
        borderRadius: 2,
        mb: 3,
        display: { xs: 'none', md: 'block' }
      }}>
        <Typography variant="h6">
          Welcome back, {user.firstName}!
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          How are you feeling today?
        </Typography>
      </Box>
    );
  };

  return (
    <Layout title={null}>
      {/* Hero Section */}
      <Box sx={{ 
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        pt: { xs: 10, md: 12 },
        pb: { xs: 12, md: 12 }
      }}>
        {/* Background pattern */}
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            opacity: 0.1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} lg={6}>
              {renderUserGreeting()}
              
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2,
                  mb: 3
                }}
              >
                Healthcare from the comfort of {isMobile ? 'home' : 'your home'}
              </Typography>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  maxWidth: 600,
                  mb: 4,
                  opacity: 0.9
                }}
              >
                Connect with licensed healthcare providers through secure video consultations.
                Get care for urgent issues, ongoing conditions, and mental health.
              </Typography>

              {/* Quick Book Action Box */}
              <Box 
                sx={{ 
                  bgcolor: 'white', 
                  p: 3, 
                  borderRadius: 3,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  color: 'text.primary',
                  maxWidth: 600
                }}
              >
                <Typography variant="h6" component="h2" gutterBottom fontWeight={600}>
                  Find care in minutes
                </Typography>
                
                <Box component="form" sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    placeholder="Search symptoms or conditions"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 28 }
                    }}
                    sx={{ mb: 2 }}
                  />
                </Box>
                
                <Typography variant="subtitle2" gutterBottom>
                  Common conditions:
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {commonConditions.map((condition, idx) => (
                    <Button 
                      key={idx} 
                      variant="outlined"
                      size="small"
                      sx={{ 
                        borderRadius: 4,
                        borderColor: theme.palette.grey[300],
                        color: theme.palette.text.primary,
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          bgcolor: 'rgba(0, 99, 176, 0.05)'
                        }
                      }}
                      onClick={() => router.push(`/conditions?search=${encodeURIComponent(condition)}`)}
                    >
                      {condition}
                    </Button>
                  ))}
                </Box>
                
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  endIcon={<ArrowForward />}
                  fullWidth
                  onClick={handleStartVisit}
                  sx={{ 
                    py: 1.5, 
                    borderRadius: 28,
                    fontWeight: 600
                  }}
                >
                  {isAuthenticated ? "Start Visit Now" : "Get Started"}
                </Button>
              </Box>
            </Grid>
            
            {!isTablet && (
              <Grid item lg={6} sx={{ textAlign: 'center' }}>
                <Box
                  component="img"
                  src="/telemedicine-hero.svg"
                  alt="Telemedicine illustration"
                  sx={{ 
                    maxWidth: '100%',
                    height: 'auto',
                    maxHeight: 500
                  }}
                />
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      {/* Upcoming Appointment Section (for authenticated users) */}
      {isAuthenticated && upcomingAppointment && (
        <Container maxWidth="lg" sx={{ mt: -6, position: 'relative', zIndex: 10 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
          >
            <Box sx={{ 
              p: 2, 
              bgcolor: theme.palette.primary.lighter || '#e3f2fd',
              borderBottom: `1px solid ${theme.palette.divider}`
            }}>
              <Typography variant="subtitle1" fontWeight={600} color="primary.dark">
                Upcoming Appointment
              </Typography>
            </Box>
            
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={7} md={9}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        width: 56,
                        height: 56,
                        mr: 2
                      }}
                    >
                      {upcomingAppointment.doctorName.split(' ')[0].charAt(0)}
                      {upcomingAppointment.doctorName.split(' ')[1].charAt(0)}
                    </Avatar>
                    
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {upcomingAppointment.doctorName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {upcomingAppointment.specialty} • {new Date(upcomingAppointment.date).toLocaleDateString()} at {new Date(upcomingAppointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={5} md={3} sx={{ display: 'flex', justifyContent: { sm: 'flex-end' } }}>
                  <Button
                    onClick={() => router.push(`/appointments/${upcomingAppointment.id}`)}
                    variant="contained"
                    color="primary"
                    endIcon={<ArrowForward />}
                  >
                    View Details
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Container>
      )}

      {/* Specialties Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h3" 
          component="h2" 
          align="center" 
          gutterBottom
          sx={{ fontWeight: 700, mb: 1 }}
        >
          Our Care Options
        </Typography>
        
        <Typography 
          variant="h6" 
          align="center" 
          color="text.secondary"
          sx={{ maxWidth: 700, mx: 'auto', mb: 6 }}
        >
          Get expert care for urgent issues, ongoing conditions, and everything in between.
        </Typography>
        
        <Grid container spacing={4}>
          {specialties.map((specialty, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                  },
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'rgba(0, 99, 176, 0.1)', 
                        color: theme.palette.primary.main,
                        mr: 2
                      }}
                    >
                      {specialty.icon}
                    </Avatar>
                    <Typography variant="h6" component="h3" fontWeight={600}>
                      {specialty.name}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <List disablePadding>
                    <ListItem disableGutters sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircle fontSize="small" sx={{ color: theme.palette.primary.main }} />
                      </ListItemIcon>
                      <ListItemText primary="24/7 availability" />
                    </ListItem>
                    <ListItem disableGutters sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircle fontSize="small" sx={{ color: theme.palette.primary.main }} />
                      </ListItemIcon>
                      <ListItemText primary="Board-certified doctors" />
                    </ListItem>
                    <ListItem disableGutters sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircle fontSize="small" sx={{ color: theme.palette.primary.main }} />
                      </ListItemIcon>
                      <ListItemText primary="Insurance accepted" />
                    </ListItem>
                  </List>
                  
                  <Button
                    component={NextLink}
                    href={isAuthenticated ? "/doctors" : "/register"}
                    variant="outlined"
                    color="primary"
                    fullWidth
                    sx={{ mt: 3, borderRadius: 28 }}
                  >
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            component="h2" 
            align="center" 
            gutterBottom
            sx={{ fontWeight: 700, mb: 1 }}
          >
            How It Works
          </Typography>
          
          <Typography 
            variant="h6" 
            align="center" 
            color="text.secondary"
            sx={{ maxWidth: 700, mx: 'auto', mb: 6 }}
          >
            Getting healthcare has never been easier. Three simple steps to connect with a doctor.
          </Typography>

          <Grid container spacing={5} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                textAlign: 'center',
                position: 'relative'
              }}>
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: -40,
                    left: { xs: '50%', md: 40 },
                    transform: { xs: 'translateX(-50%)', md: 'none' },
                    fontWeight: 800,
                    fontSize: '8rem',
                    opacity: 0.1,
                    color: theme.palette.primary.main,
                    zIndex: 0
                  }}
                >
                  1
                </Box>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: theme.palette.primary.main,
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <Person fontSize="large" />
                  </Avatar>
                  <Typography variant="h5" component="h3" fontWeight={600} gutterBottom>
                    Create an Account
                  </Typography>
                  <Typography color="text.secondary">
                    Sign up and complete your profile with your medical history and insurance information.
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ 
                textAlign: 'center',
                position: 'relative'
              }}>
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: -40,
                    left: { xs: '50%', md: 40 },
                    transform: { xs: 'translateX(-50%)', md: 'none' },
                    fontWeight: 800,
                    fontSize: '8rem',
                    opacity: 0.1,
                    color: theme.palette.primary.main,
                    zIndex: 0
                  }}
                >
                  2
                </Box>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: theme.palette.primary.main,
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <CalendarToday fontSize="large" />
                  </Avatar>
                  <Typography variant="h5" component="h3" fontWeight={600} gutterBottom>
                    Book an Appointment
                  </Typography>
                  <Typography color="text.secondary">
                    Schedule a virtual consultation with your preferred healthcare provider.
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ 
                textAlign: 'center',
                position: 'relative'
              }}>
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: -40,
                    left: { xs: '50%', md: 40 },
                    transform: { xs: 'translateX(-50%)', md: 'none' },
                    fontWeight: 800,
                    fontSize: '8rem',
                    opacity: 0.1,
                    color: theme.palette.primary.main,
                    zIndex: 0
                  }}
                >
                  3
                </Box>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: theme.palette.primary.main,
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <VideoCall fontSize="large" />
                  </Avatar>
                  <Typography variant="h5" component="h3" fontWeight={600} gutterBottom>
                    Attend Your Visit
                  </Typography>
                  <Typography color="text.secondary">
                    Connect via secure video call and receive diagnosis, prescriptions, and follow-up care.
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              component={NextLink}
              href={isAuthenticated ? "/doctors" : "/register"}
              variant="contained"
              color="primary"
              size="large"
              sx={{ 
                py: 1.5, 
                px: 4,
                borderRadius: 28,
                fontWeight: 600
              }}
            >
              {isAuthenticated ? "Schedule Now" : "Get Started"}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h3" component="h2" gutterBottom fontWeight={700}>
              Why Choose Our Telehealth Platform
            </Typography>
            
            <Typography variant="body1" paragraph>
              We offer a modern approach to healthcare that prioritizes your convenience, 
              privacy, and well-being. Our platform provides fast access to quality care 
              when and where you need it.
            </Typography>
            
            <List>
              <ListItem disableGutters>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Convenient Care" 
                  secondary="No travel, no waiting rooms, just quality healthcare from the comfort of your home."
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon>
                  <AccessTime color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Quick Appointments" 
                  secondary="Most patients get an appointment within 24 hours, often on the same day."
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon>
                  <MedicalServices color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Qualified Providers" 
                  secondary="All healthcare providers are board-certified and experienced in telehealth."
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon>
                  <Lock color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Privacy & Security" 
                  secondary="HIPAA-compliant platform with end-to-end encryption for all consultations."
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon>
                  <DevicesOther color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="User-Friendly Technology" 
                  secondary="Access care from any device - computer, tablet, or smartphone."
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src="/benefits-illustration.svg"
              alt="Telehealth benefits"
              sx={{ 
                width: '100%', 
                height: 'auto',
                borderRadius: 3,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            component="h2" 
            align="center" 
            gutterBottom
            sx={{ fontWeight: 700, mb: 1 }}
          >
            What Our Patients Say
          </Typography>
          
          <Typography 
            variant="h6" 
            align="center" 
            color="text.secondary"
            sx={{ maxWidth: 700, mx: 'auto', mb: 6 }}
          >
            Read about the experiences of patients who have used our telehealth services.
          </Typography>
          
          <Grid container spacing={4}>
            {[
              {
                name: "Sarah Johnson",
                quote: "The video call was crystal clear, and the doctor was incredibly thorough. I received my prescription the same day!",
                role: "Patient"
              },
              {
                name: "Michael Brown",
                quote: "As a busy parent, being able to see a doctor without arranging childcare has been a game-changer for my family.",
                role: "Patient"
              },
              {
                name: "Emily Wilson",
                quote: "I was skeptical about virtual care, but my experience was fantastic. The platform is intuitive and the care was excellent.",
                role: "Patient"
              }
            ].map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: 'none',
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Box 
                          key={star} 
                          component="span" 
                          sx={{ 
                            color: '#FFD700', 
                            fontSize: '1.5rem',
                            lineHeight: 1
                          }}
                        >
                          ★
                        </Box>
                      ))}
                    </Box>
                    <Typography 
                      variant="body1" 
                      paragraph 
                      sx={{ 
                        fontStyle: 'italic',
                        mb: 3,
                        minHeight: 100
                      }}
                    >
                      &ldquo;{testimonial.quote}&rdquo;
                    </Typography>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        {testimonial.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box 
        sx={{ 
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: 8
        }}
      >
        {/* Background pattern */}
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            opacity: 0.1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              component="h2" 
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              Ready to prioritize your health?
            </Typography>
            
            <Typography 
              variant="h6" 
              paragraph
              sx={{ 
                maxWidth: 700, 
                mx: 'auto', 
                mb: 4,
                opacity: 0.9
              }}
            >
              No more waiting rooms. Get the care you need from the comfort of your home.
            </Typography>
            
            <Button
              component={NextLink}
              href={isAuthenticated ? "/doctors" : "/register"}
              variant="contained"
              color="secondary"
              size="large"
              sx={{ 
                py: 1.5, 
                px: 4,
                borderRadius: 28,
                fontWeight: 600,
                fontSize: '1rem'
              }}
            >
              {isAuthenticated ? "Schedule an Appointment" : "Start Your Health Journey"}
            </Button>
          </Box>
        </Container>
      </Box>
      
      {/* Mobile sticky CTA */}
      {isMobile && (
        <Box sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          p: 2, 
          bgcolor: 'white', 
          borderTop: `1px solid ${theme.palette.divider}`,
          zIndex: 10,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
        }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={handleStartVisit}
            sx={{ borderRadius: 28, py: 1.5 }}
          >
            {isAuthenticated ? "Start Visit" : "Sign Up"}
          </Button>
        </Box>
      )}
    </Layout>
  );
}