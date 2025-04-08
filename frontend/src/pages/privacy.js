import {
    Box,
    Container,
    Typography,
    Divider,
    Paper,
    Breadcrumbs,
    Link as MuiLink,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    useTheme
  } from '@mui/material';
  import {
    Security,
    Policy,
    CheckCircle,
    NavigateNext
  } from '@mui/icons-material';
  import Link from 'next/link';
  import Layout from '../components/Layout';
  
  export default function PrivacyPolicy() {
    const theme = useTheme();
    
    // Last updated date
    const lastUpdated = "April 15, 2025";
  
    return (
      <Layout title="Privacy Policy">
        {/* Hero Section */}
        <Box 
          sx={{ 
            bgcolor: theme.palette.primary.main, 
            color: 'white',
            py: 4,
            borderRadius: { xs: 0, md: 2 },
            mb: 4
          }}
        >
          <Container maxWidth="lg">
            <Typography 
              variant="h3" 
              component="h1"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              Privacy Policy
            </Typography>
            <Typography variant="subtitle1">
              Last Updated: {lastUpdated}
            </Typography>
          </Container>
        </Box>
  
        <Container maxWidth="lg" sx={{ mb: 8 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs 
            separator={<NavigateNext fontSize="small" />} 
            aria-label="breadcrumb"
            sx={{ mb: 4 }}
          >
            <Link href="/" passHref legacyBehavior>
              <MuiLink underline="hover" color="inherit">Home</MuiLink>
            </Link>
            <Typography color="text.primary">Privacy Policy</Typography>
          </Breadcrumbs>
  
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              mb: 4
            }}
          >
            <Typography variant="body1" paragraph>
              At Telehealth Platform, we are committed to protecting your privacy and maintaining the confidentiality 
              of your health information. This Privacy Policy explains how we collect, use, disclose, and safeguard 
              your information when you use our telehealth services, website, and mobile application.
            </Typography>
            
            <Typography variant="body1" paragraph>
              Please read this Privacy Policy carefully. By accessing or using our platform, you acknowledge that you 
              have read, understood, and agree to be bound by all the terms of this Privacy Policy. If you do not agree 
              with our policies and practices, please do not use our services.
            </Typography>
  
            <Divider sx={{ my: 4 }} />
  
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600} id="information-we-collect">
              1. Information We Collect
            </Typography>
            <Typography variant="body1" paragraph>
              We collect several types of information from and about users of our platform, including:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Personal Information" 
                  secondary="This includes your name, email address, phone number, date of birth, insurance information, 
                             and payment details."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Health Information" 
                  secondary="This includes medical history, current medications, symptoms, diagnoses, treatment plans, 
                             and any other health-related information you provide during consultations or when creating 
                             your health profile."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Technical Information" 
                  secondary="This includes IP address, browser type, operating system, device information, usage details, 
                             and cookies."
                />
              </ListItem>
            </List>
  
            <Divider sx={{ my: 4 }} />
  
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600} id="how-we-use-information">
              2. How We Use Your Information
            </Typography>
            <Typography variant="body1" paragraph>
              We use the information we collect for various purposes, including:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Providing Services" 
                  secondary="To provide telehealth services, facilitate appointments with healthcare providers, 
                             and enable video consultations."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Improving Our Platform" 
                  secondary="To analyze usage patterns, enhance user experience, and develop new features and services."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Communication" 
                  secondary="To send appointment reminders, service updates, administrative messages, and marketing 
                             communications (with your consent)."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Billing and Payment" 
                  secondary="To process payments and handle insurance claims."
                />
              </ListItem>
            </List>
  
            <Divider sx={{ my: 4 }} />
  
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600} id="hipaa-compliance">
              3. HIPAA Compliance
            </Typography>
            <Typography variant="body1" paragraph>
              As a healthcare provider, we are subject to the Health Insurance Portability and Accountability Act (HIPAA). 
              We maintain compliance with HIPAA regulations to ensure the privacy and security of your protected health 
              information (PHI).
            </Typography>
            <Typography variant="body1" paragraph>
              Our HIPAA compliance measures include:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Administrative Safeguards" 
                  secondary="Implementing policies and procedures to manage the selection, development, implementation, 
                             and maintenance of security measures to protect electronic PHI."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Physical Safeguards" 
                  secondary="Implementing physical measures, policies, and procedures to protect electronic information 
                             systems and related buildings and equipment from natural and environmental hazards, and 
                             unauthorized intrusion."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Technical Safeguards" 
                  secondary="Implementing technology and policies and procedures for its use that protect electronic PHI 
                             and control access to it."
                />
              </ListItem>
            </List>
  
            <Divider sx={{ my: 4 }} />
  
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600} id="information-sharing">
              4. How We Share Your Information
            </Typography>
            <Typography variant="body1" paragraph>
              We may share your information in the following circumstances:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Healthcare Providers" 
                  secondary="With healthcare providers who need access to your information to provide medical services."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Insurance Companies" 
                  secondary="With your insurance company for billing and claims purposes."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Service Providers" 
                  secondary="With third-party service providers who perform services on our behalf, such as payment 
                             processing, data analysis, and technical support."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Legal Requirements" 
                  secondary="When required by law, such as in response to a subpoena, court order, or other legal process."
                />
              </ListItem>
            </List>
            <Typography variant="body1" paragraph>
              We do not sell, rent, or lease your personal information to third parties.
            </Typography>
  
            <Divider sx={{ my: 4 }} />
  
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600} id="data-security">
              5. Data Security
            </Typography>
            <Typography variant="body1" paragraph>
              We implement appropriate technical and organizational measures to protect your information from 
              unauthorized access, disclosure, alteration, and destruction. Our security measures include:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Encryption" 
                  secondary="All data transmitted between your device and our servers is encrypted using 
                             industry-standard protocols."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Access Controls" 
                  secondary="Strict access controls limit who can access your information."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Regular Audits" 
                  secondary="We conduct regular security audits and vulnerability assessments."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Employee Training" 
                  secondary="Our staff receives regular training on privacy and security practices."
                />
              </ListItem>
            </List>
            <Typography variant="body1" paragraph>
              Despite our efforts, no method of transmission over the Internet or electronic storage is 100% secure. 
              We cannot guarantee absolute security.
            </Typography>
  
            <Divider sx={{ my: 4 }} />
  
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600} id="your-rights">
              6. Your Rights
            </Typography>
            <Typography variant="body1" paragraph>
              Depending on your location, you may have certain rights regarding your personal information:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Access" 
                  secondary="You can request access to your personal information."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Correction" 
                  secondary="You can request that we correct inaccurate or incomplete information."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Deletion" 
                  secondary="You can request that we delete your personal information in certain circumstances."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Restriction" 
                  secondary="You can request that we restrict the processing of your personal information."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Data Portability" 
                  secondary="You can request a copy of your personal information in a structured, commonly used, 
                             machine-readable format."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Objection" 
                  secondary="You can object to the processing of your personal information."
                />
              </ListItem>
            </List>
            <Typography variant="body1" paragraph>
              To exercise any of these rights, please contact us at privacy@telehealthplatform.com.
            </Typography>
  
            <Divider sx={{ my: 4 }} />
  
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600} id="children-privacy">
              7. Children's Privacy
            </Typography>
            <Typography variant="body1" paragraph>
              Our services are not directed to children under the age of 18. We do not knowingly collect personal 
              information from children under 18. If you are a parent or guardian and believe that your child has 
              provided us with personal information, please contact us immediately.
            </Typography>
  
            <Divider sx={{ my: 4 }} />
  
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600} id="changes">
              8. Changes to Our Privacy Policy
            </Typography>
            <Typography variant="body1" paragraph>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the 
              new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this 
              Privacy Policy periodically for any changes.
            </Typography>
  
            <Divider sx={{ my: 4 }} />
  
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600} id="contact-us">
              9. Contact Us
            </Typography>
            <Typography variant="body1" paragraph>
              If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact us at:
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>Email: privacy@telehealthplatform.com</Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>Phone: (800) 123-4567</Typography>
            <Typography variant="body1">
              Address: 123 Healthcare Ave, Suite 300, San Francisco, CA 94105
            </Typography>
          </Paper>
  
          {/* Privacy Commitment Box */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              borderRadius: 3,
              bgcolor: 'rgba(0, 99, 176, 0.05)',
              border: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Security color="primary" sx={{ fontSize: 40, mr: 3 }} />
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Our Commitment to Your Privacy
              </Typography>
              <Typography variant="body1">
                Your trust is important to us. We are committed to protecting your privacy and maintaining 
                the confidentiality of your health information. If you have any questions or concerns about 
                your privacy, please don't hesitate to contact us.
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Layout>
    );
  }