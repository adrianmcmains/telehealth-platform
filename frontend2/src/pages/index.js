import { Box, Button, Card, CardContent, Container, Grid, Typography } from '@mui/material';
import { VideoCall, MedicalServices, Person } from '@mui/icons-material';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Layout title={null}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          borderRadius: 2,
          mb: 6,
          mt: -2
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h3" component="h1" gutterBottom>
                Healthcare From the Comfort of Your Home
              </Typography>
              <Typography variant="h6" paragraph>
                Connect with licensed healthcare providers through secure video consultations.
                Get the care you need, when you need it.
              </Typography>
              {isAuthenticated ? (
                <Link href="/appointments" passHref>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    sx={{ mt: 2 }}
                  >
                    My Appointments
                  </Button>
                </Link>
              ) : (
                <Link href="/register" passHref>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    sx={{ mt: 2 }}
                  >
                    Get Started
                  </Button>
                </Link>
              )}
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                component="img"
                src="/telemedicine.svg"
                alt="Telemedicine illustration"
                sx={{ width: '100%', height: 'auto' }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Why Choose Our Telehealth Platform
        </Typography>
        
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <VideoCall fontSize="large" color="primary" sx={{ mb: 2, fontSize: 60 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Virtual Consultations
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Meet with healthcare providers through secure video calls without leaving your home.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <MedicalServices fontSize="large" color="primary" sx={{ mb: 2, fontSize: 60 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Qualified Professionals
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Access to licensed and experienced healthcare providers across multiple specialties.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Person fontSize="large" color="primary" sx={{ mb: 2, fontSize: 60 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Patient-Centered Care
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Receive personalized healthcare with easy access to your medical history and prescriptions.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 6, mb: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" align="center" gutterBottom>
            How It Works
          </Typography>

          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" component="div" sx={{ color: 'primary.main', mb: 1 }}>
                  1
                </Typography>
                <Typography variant="h6" component="h3" gutterBottom>
                  Create an Account
                </Typography>
                <Typography>
                  Sign up and complete your profile with your medical history.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" component="div" sx={{ color: 'primary.main', mb: 1 }}>
                  2
                </Typography>
                <Typography variant="h6" component="h3" gutterBottom>
                  Book an Appointment
                </Typography>
                <Typography>
                  Schedule a virtual consultation with your preferred healthcare provider.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" component="div" sx={{ color: 'primary.main', mb: 1 }}>
                  3
                </Typography>
                <Typography variant="h6" component="h3" gutterBottom>
                  Attend Your Visit
                </Typography>
                <Typography>
                  Connect via secure video call and receive diagnosis, prescriptions, and follow-up care.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Ready to prioritize your health?
        </Typography>
        <Typography variant="body1" paragraph>
          No more waiting rooms. Get the care you need from the comfort of your home.
        </Typography>
        {!isAuthenticated && (
          <Button
            component={Link}
            href="/register"
            variant="contained"
            size="large"
            color="primary"
            sx={{ mt: 2 }}
          >
            Create Your Account Now
          </Button>
        )}
      </Container>
    </Layout>
  );
}