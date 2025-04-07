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
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider
  } from '@mui/material';
  import { 
    VideoCall, 
    MedicalServices, 
    AccessTime,
    Medication,
    LocalHospital,
    Psychology,
    MonitorHeart,
    CheckCircle,
    ArrowForward
  } from '@mui/icons-material';
  import NextLink from 'next/link';
  import Layout from '../components/Layout';
  
  export default function Services() {
    const theme = useTheme();
  
    // Define services data
    const services = [
      {
        title: "Primary Care",
        description: "Comprehensive primary care services for adults and children. Get diagnosis, treatment plans, and referrals when needed.",
        icon: <MedicalServices />,
        features: [
          "General health check-ups",
          "Minor illness treatment",
          "Chronic condition management",
          "Health screenings and preventive care"
        ]
      },
      {
        title: "Mental Health",
        description: "Talk to licensed therapists and psychiatrists from the comfort of your home. Get support for anxiety, depression, stress, and more.",
        icon: <Psychology />,
        features: [
          "Therapy sessions",
          "Psychiatric evaluations",
          "Medication management",
          "Stress and anxiety support"
        ]
      },
      {
        title: "Urgent Care",
        description: "Get quick medical attention for non-emergency conditions without the wait of an emergency room.",
        icon: <LocalHospital />,
        features: [
          "Same-day appointments",
          "Minor injuries treatment",
          "Infection diagnosis and treatment",
          "Immediate prescription when needed"
        ]
      },
      {
        title: "Medication Management",
        description: "Review your medications with healthcare professionals to ensure they're working effectively with minimal side effects.",
        icon: <Medication />,
        features: [
          "Prescription refills",
          "Medication review",
          "Side effect management",
          "Adherence support"
        ]
      },
      {
        title: "Chronic Disease Management",
        description: "Ongoing care and monitoring for chronic conditions like diabetes, hypertension, and asthma.",
        icon: <MonitorHeart />,
        features: [
          "Regular check-ins",
          "Condition monitoring",
          "Treatment adjustments",
          "Lifestyle recommendations"
        ]
      },
      {
        title: "Video Consultations",
        description: "Connect with healthcare providers through secure, high-quality video calls for convenient care anytime, anywhere.",
        icon: <VideoCall />,
        features: [
          "HD video quality",
          "Secure, encrypted platform",
          "Mobile or desktop access",
          "Screen sharing for results review"
        ]
      }
    ];
  
    return (
      <Layout title="Our Services">
        {/* Hero Section */}
        <Box sx={{ 
          bgcolor: '#0118D8', 
          color: 'white',
          py: 8,
          borderRadius: { xs: 0, md: 2 },
          mb: 8,
          boxShadow: '0 10px 30px rgba(1, 24, 216, 0.2)'
        }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={7}>
                <Typography 
                  variant="h2" 
                  component="h1" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 700,
                    fontSize: { xs: '2.5rem', md: '3.5rem' }
                  }}
                >
                  Comprehensive Healthcare Services
                </Typography>
                <Typography 
                  variant="h6"
                  paragraph
                  sx={{ opacity: 0.9, mb: 4 }}
                >
                  Our telehealth platform provides a wide range of medical services delivered by experienced healthcare professionals. Get the care you need, when you need it.
                </Typography>
                <Button
                  component={NextLink}
                  href="/doctors"
                  variant="contained"
                  color="secondary"
                  endIcon={<ArrowForward />}
                  size="large"
                  sx={{ 
                    py: 1.5, 
                    px: 4,
                    fontWeight: 600,
                    borderRadius: 28, // More oval shape
                    bgcolor: 'white',
                    color: '#0118D8',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    }
                  }}
                >
                  Find a Provider
                </Button>
              </Grid>
              <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
                <Box
                  component="img"
                  src="/services-illustration.svg"
                  alt="Healthcare services"
                  sx={{ 
                    width: '100%', 
                    maxWidth: 450,
                    height: 'auto',
                    display: 'block',
                    mx: 'auto'
                  }}
                />
              </Grid>
            </Grid>
          </Container>
        </Box>
  
        {/* Services Section */}
        <Container maxWidth="lg" sx={{ mb: 8 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            align="center" 
            gutterBottom
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Our Healthcare Services
          </Typography>
          
          <Typography 
            variant="h6" 
            align="center" 
            color="text.secondary"
            sx={{ maxWidth: 700, mx: 'auto', mb: 6 }}
          >
            We offer a wide range of virtual healthcare services to meet your medical needs from the comfort of your home.
          </Typography>
          
          <Grid container spacing={4}>
            {services.map((service, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderRadius: 3,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
                    },
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: '#0118D8',
                          color: 'white',
                          width: 56,
                          height: 56,
                          mr: 2
                        }}
                      >
                        {service.icon}
                      </Avatar>
                      <Typography variant="h5" component="h3" fontWeight={600}>
                        {service.title}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body1" paragraph color="text.secondary" sx={{ mb: 3 }}>
                      {service.description}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <List dense disablePadding>
                      {service.features.map((feature, idx) => (
                        <ListItem key={idx} disablePadding sx={{ mb: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircle fontSize="small" sx={{ color: '#1B56FD' }} />
                          </ListItemIcon>
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
  
        {/* CTA Section */}
        <Box 
          sx={{ 
            bgcolor: '#1B56FD', 
            color: 'white',
            py: 8,
            borderRadius: { xs: 0, md: 2 },
            mb: 8
          }}
        >
          <Container maxWidth="md">
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h3" 
                component="h2" 
                gutterBottom
                sx={{ fontWeight: 700 }}
              >
                Get Started Today
              </Typography>
              <Typography 
                variant="h6" 
                paragraph
                sx={{ maxWidth: 700, mx: 'auto', mb: 4, opacity: 0.9 }}
              >
                Experience the convenience of telehealth services from the comfort of your home. Our healthcare professionals are ready to help you.
              </Typography>
              <Button
                component={NextLink}
                href="/register"
                variant="contained"
                color="secondary"
                size="large"
                sx={{ 
                  py: 1.5, 
                  px: 4,
                  fontWeight: 600,
                  borderRadius: 28, // More oval shape
                  bgcolor: 'white',
                  color: '#1B56FD',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  }
                }}
              >
                Create Your Account
              </Button>
            </Box>
          </Container>
        </Box>
  
        {/* Service Process Section */}
        <Container maxWidth="lg" sx={{ mb: 8 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            align="center" 
            gutterBottom
            sx={{ fontWeight: 700, mb: 2 }}
          >
            How Our Services Work
          </Typography>
          
          <Typography 
            variant="h6" 
            align="center" 
            color="text.secondary"
            sx={{ maxWidth: 700, mx: 'auto', mb: 6 }}
          >
            Getting healthcare has never been easier. Follow these simple steps to access our telehealth services.
          </Typography>
  
          <Grid container spacing={4}>
            {[
              {
                step: 1,
                title: "Create Your Account",
                description: "Sign up and complete your profile with your medical history and insurance information."
              },
              {
                step: 2,
                title: "Choose a Service",
                description: "Browse our range of services and select the one that meets your healthcare needs."
              },
              {
                step: 3,
                title: "Schedule an Appointment",
                description: "Choose a convenient date and time to meet with your healthcare provider."
              },
              {
                step: 4,
                title: "Attend Your Virtual Visit",
                description: "Connect with your provider through our secure video platform to receive care."
              }
            ].map((step, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box 
                  sx={{ 
                    textAlign: 'center',
                    position: 'relative',
                    pt: 4
                  }}
                >
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      top: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontWeight: 800,
                      fontSize: '5rem',
                      opacity: 0.1,
                      color: '#0118D8',
                      zIndex: 0
                    }}
                  >
                    {step.step}
                  </Box>
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography 
                      variant="h4" 
                      component="div" 
                      sx={{ 
                        color: '#0118D8', 
                        fontWeight: 700,
                        mb: 1
                      }}
                    >
                      {step.step}
                    </Typography>
                    <Typography variant="h6" component="h3" fontWeight={600} gutterBottom>
                      {step.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {step.description}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Layout>
    );
  }