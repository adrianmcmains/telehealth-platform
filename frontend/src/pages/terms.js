// frontend/src/pages/terms.js
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
    Gavel,
    NavigateNext,
    CheckCircle
  } from '@mui/icons-material';
  import Link from 'next/link';
  import Layout from '../components/Layout';
  
  export default function TermsOfService() {
    const theme = useTheme();
    
    // Last updated date
    const lastUpdated = "April 15, 2025";
  
    return (
      <Layout title="Terms of Service">
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
              Terms of Service
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
            <Typography color="text.primary">Terms of Service</Typography>
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
              Welcome to the Telehealth Platform. These Terms of Service ("Terms") govern your use of our website, 
              mobile application, and services (collectively, the "Platform"). By accessing or using our Platform, 
              you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Platform.
            </Typography>
            
            <Typography variant="body1" paragraph>
              Please read these Terms carefully. They include important information about your legal rights and 
              limitations on those rights, as well as provisions that govern how disputes between us are resolved.
            </Typography>
  
            <Divider sx={{ my: 4 }} />
  
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600} id="definitions">
              1. Definitions
            </Typography>
            <Typography variant="body1" paragraph>
              "We," "us," and "our" refer to Telehealth Platform, Inc.
            </Typography>
            <Typography variant="body1" paragraph>
              "You" and "your" refer to the user of our Platform.
            </Typography>
            <Typography variant="body1" paragraph>
              "Healthcare Provider" refers to physicians, nurse practitioners, and other healthcare professionals who provide services through our Platform.
            </Typography>
            <Typography variant="body1" paragraph>
              "Services" refers to all services provided through our Platform, including telehealth consultations, appointment scheduling, and other healthcare-related services.
            </Typography>
  
            <Divider sx={{ my: 4 }} />
  
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600} id="eligibility">
              2. Eligibility
            </Typography>
            <Typography variant="body1" paragraph>
              You must be at least 18 years old to create an account on our Platform. If you are under 18, you may only use our Platform with the involvement of a parent or guardian. By using our Platform, you represent and warrant that you meet all eligibility requirements.
            </Typography>
            <Typography variant="body1" paragraph>
              Our Platform is intended for use by residents of the United States. Healthcare Providers on our Platform are licensed to practice in specific states, and you may only receive services from providers licensed in your state of residence.
            </Typography>
  
            <Divider sx={{ my: 4 }} />
  
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600} id="account-responsibilities">
              3. Account Creation and Responsibilities
            </Typography>
            <Typography variant="body1" paragraph>
              To use certain features of our Platform, you must create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
            </Typography>
            <Typography variant="body1" paragraph>
              You are responsible for safeguarding your account credentials. You agree not to disclose your password to any third party and to take sole responsibility for any activities or actions under your account, whether or not you have authorized such activities or actions.
            </Typography>
            <Typography variant="body1" paragraph>
              You agree to notify us immediately of any unauthorized use of your account. We will not be liable for any loss or damage arising from your failure to comply with this section.
            </Typography>
  
            <Divider sx={{ my: 4 }} />
  
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600} id="telehealth-services">
              4. Telehealth Services
            </Typography>
            <Typography variant="body1" paragraph>
              Our Platform connects patients with Healthcare Providers for telehealth consultations. While we strive to facilitate high-quality healthcare services, we do not provide medical services directly. All medical services are provided by independent Healthcare Providers.
            </Typography>
            <Typography variant="body1" paragraph>
              You acknowledge and agree to the following with respect to telehealth services:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="The Healthcare Provider may determine that telehealth is not appropriate for some conditions and may require in-person consultation."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Telehealth consultations are not intended for emergency situations. In case of emergency, you should call 911 or go to the nearest emergency room."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="The quality of telehealth services depends on various factors, including internet connectivity, device functionality, and accurate information provided by you."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="You consent to share your health information with Healthcare Providers through our Platform for the purpose of receiving medical care."
                />
              </ListItem>
            </List>
  
            <Divider sx={{ my: 4 }} />
  
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600} id="payment-terms">
              5. Payment Terms
            </Typography>
            <Typography variant="body1" paragraph>
              You agree to pay all fees or charges to your account in accordance with the fees, charges, and billing terms in effect at the time a fee or charge is due and payable. The fees for services are listed on our Platform and may be subject to change.
            </Typography>
            <Typography variant="body1" paragraph>
              If you provide credit card or other payment method information to us, you authorize us to charge such payment method for all services you purchase. You agree to promptly update your account information with any changes in your payment method information.
            </Typography>
            <Typography variant="body1" paragraph>
              We work with third-party payment processors to handle payment transactions. By using our Platform, you agree to the terms and privacy policies of these payment processors.
            </Typography>
            <Typography variant="body1" paragraph>
              We do not store your full credit card information on our servers. This information is securely processed and stored by our payment processors.
            </Typography>
  
            <Divider sx={{ my: 4 }} />
  
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600} id="cancellations-refunds">
              6. Cancellations and Refunds
            </Typography>
            <Typography variant="body1" paragraph>
              You may cancel a scheduled appointment according to the cancellation policy provided at the time of booking. Typically, appointments must be cancelled at least 24 hours in advance to be eligible for a refund.
            </Typography>
            <Typography variant="body1" paragraph>
              If a Healthcare Provider cancels an appointment, you will receive a full refund or the option to reschedule.
            </Typography>
            <Typography variant="body1" paragraph>
              If you experience technical difficulties during a telehealth consultation that significantly impact the quality of service, you may be eligible for a refund or the opportunity to reschedule at no additional cost. Please contact our customer support team within 24 hours of the appointment to report such issues.
            </Typography>
            <Typography variant="body1" paragraph>
              We reserve the right to issue refunds at our discretion if we determine that the services did not meet reasonable quality standards.
            </Typography>
  
            <Divider sx={{ my: 4 }} />
  
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600} id="privacy">
              7. Privacy
            </Typography>
            <Typography variant="body1" paragraph>
              Your privacy is important to us. Our Privacy Policy, which is incorporated into these Terms by reference, explains how we collect, use, and protect your information. By using our Platform, you consent to the collection and use of your information as detailed in our Privacy Policy.
            </Typography>
            <Typography variant="body1" paragraph>
              We comply with all applicable laws and regulations regarding the privacy and security of healthcare information, including the Health Insurance Portability and Accountability Act (HIPAA).
            </Typography>
  
            <Divider sx={{ my: 4 }} />
  
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600} id="prohibited-conduct">
              8. Prohibited Conduct
            </Typography>
            <Typography variant="body1" paragraph>
              You agree not to engage in any of the following prohibited activities:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Violating any applicable law, rule, or regulation"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Providing false or misleading information"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Attempting to access or using another user's account without authorization"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Using our Platform for any illegal or unauthorized purpose"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Interfering with or disrupting the integrity or performance of our Platform"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Recording or sharing telehealth consultations without proper authorization"
                />
              </ListItem>
            </List>
  
            <Divider sx={{ my: 4 }} />
  
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600} id="intellectual-property">
              9. Intellectual Property
            </Typography>
            <Typography variant="body1" paragraph>
              Our Platform and its original content, features, and functionality are owned by Telehealth Platform, Inc. and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
            </Typography>
            <Typography variant="body1" paragraph>
              You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Platform without our prior written consent.
            </Typography>
  
            <Divider sx={{ my: 4 }} />
  
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600} id="disclaimers">
              10. Disclaimers
            </Typography>
            <Typography variant="body1" paragraph>
              OUR PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
            </Typography>
            <Typography variant="body1" paragraph>
              WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, OR THAT THE PLATFORM OR THE SERVERS THAT MAKE IT AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
            </Typography>
            <Typography variant="body1" paragraph>
              WE DO NOT GUARANTEE THE QUALITY, ACCURACY, TIMELINESS, OR RELIABILITY OF ANY INFORMATION OR SERVICES PROVIDED THROUGH OUR PLATFORM.
            </Typography>
            <Typography variant="body1" paragraph>
              TELEHEALTH CONSULTATIONS HAVE LIMITATIONS COMPARED TO IN-PERSON HEALTHCARE SERVICES. YOU ASSUME ALL RISKS ASSOCIATED WITH USING TELEHEALTH SERVICES.
            </Typography>
  
            <Divider sx={{ my: 4 }} />
  
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600} id="limitation-of-liability">
              11. Limitation of Liability
            </Typography>
            <Typography variant="body1" paragraph>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL TELEHEALTH PLATFORM, INC., ITS AFFILIATES, OR THEIR RESPECTIVE OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (i) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE PLATFORM; (ii) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE PLATFORM; (iii) ANY CONTENT OBTAINED FROM THE PLATFORM; AND (iv) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY OTHER LEGAL THEORY, WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE.
            </Typography>
  
            <Divider sx={{ my: 4 }} />
  
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600} id="indemnification">
              12. Indemnification
            </Typography>
            <Typography variant="body1" paragraph>
              You agree to defend, indemnify, and hold harmless Telehealth Platform, Inc., its affiliates, and their respective officers, directors, employees, and agents from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Platform.
            </Typography>
  
            <Divider sx={{ my: 4 }} />
  
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600} id="term-termination">
              13. Term and Termination
            </Typography>
            <Typography variant="body1" paragraph>
              These Terms shall remain in full force and effect while you use the Platform. We reserve the right to, in our sole discretion and without notice or liability, deny access to and use of the Platform to any person for any reason or for no reason, including without limitation for breach of any representation, warranty, or covenant contained in these Terms.
            </Typography>
            <Typography variant="body1" paragraph>
              We may terminate your account and access to the Platform immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.
            </Typography>
            <Typography variant="body1" paragraph>
              All provisions of these Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
            </Typography>
  
            <Divider sx={{ my: 4 }} />
  
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600} id="changes-to-terms">
              14. Changes to Terms
            </Typography>
            <Typography variant="body1" paragraph>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page and updating the "Last Updated" date. Your continued use of the Platform after any such changes constitutes your acceptance of the new Terms.
            </Typography>
            <Typography variant="body1" paragraph>
              It is your responsibility to review these Terms periodically for changes. If you do not agree to any of the changes to these Terms, you must stop using the Platform.
            </Typography>
  
            <Divider sx={{ my: 4 }} />
  
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600} id="governing-law">
              15. Governing Law
            </Typography>
            <Typography variant="body1" paragraph>
              These Terms shall be governed and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Any legal action or proceeding relating to your access to or use of the Platform shall be instituted in the federal or state courts located in San Francisco County, California, and you agree to submit to the personal jurisdiction of such courts.
            </Typography>
  
            <Divider sx={{ my: 4 }} />
  
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600} id="contact-us">
              16. Contact Us
            </Typography>
            <Typography variant="body1" paragraph>
              If you have any questions about these Terms, please contact us at:
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>Email: legal@telehealthplatform.com</Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>Phone: (800) 123-4567</Typography>
            <Typography variant="body1">
              Address: 123 Healthcare Ave, Suite 300, San Francisco, CA 94105
            </Typography>
          </Paper>
  
          {/* Legal Notice Box */}
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
            <Gavel color="primary" sx={{ fontSize: 40, mr: 3 }} />
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Legal Agreement
              </Typography>
              <Typography variant="body1">
                By using our Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these Terms, please do not use our Platform.
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Layout>
    );
  }