import { 
    Box, 
    Container, 
    Typography, 
    Accordion, 
    AccordionSummary, 
    AccordionDetails, 
    Divider,
    Button,
    TextField,
    InputAdornment,
    useTheme,
    Grid,
    Paper
  } from '@mui/material';
  import { 
    ExpandMore, 
    Search,
    LiveHelp,
    Payment,
    VideoCall,
    Security,
    MedicalServices,
    QuestionAnswer
  } from '@mui/icons-material';
  import { useState } from 'react';
  import NextLink from 'next/link';
  import Layout from '../components/Layout';
  
  export default function FAQ() {
    const theme = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [expanded, setExpanded] = useState(false);
  
    const handleChange = (panel) => (event, isExpanded) => {
      setExpanded(isExpanded ? panel : false);
    };
  
    // FAQ categories with questions and answers
    const faqCategories = [
      {
        category: "General Questions",
        icon: <LiveHelp color="primary" />,
        faqs: [
          {
            question: "What is telehealth?",
            answer: "Telehealth is the delivery of healthcare services remotely through digital communication technologies. It allows patients to consult with healthcare providers via secure video conferences, without needing to visit a physical office. Our telehealth platform enables convenient access to quality healthcare from the comfort of your home."
          },
          {
            question: "Is telehealth right for me?",
            answer: "Telehealth is ideal for many non-emergency medical conditions, including cold and flu symptoms, allergies, rashes, minor infections, mental health concerns, and chronic condition management. It's convenient for those with busy schedules, limited mobility, or who live far from healthcare facilities. However, some conditions may require in-person care. Our providers can help determine if telehealth is appropriate for your specific needs."
          },
          {
            question: "What are the benefits of using telehealth?",
            answer: "Telehealth offers numerous advantages including convenience (no travel or waiting rooms), time savings, reduced exposure to other illnesses, access to specialists regardless of location, easier follow-up appointments, and often lower costs compared to in-person visits. It's particularly valuable for routine care, prescription refills, and managing chronic conditions."
          },
          {
            question: "How do I get started with your telehealth platform?",
            answer: "Getting started is simple! First, create an account by clicking the 'Register' button and completing your profile with basic information and medical history. Then, browse available providers or services, select an appointment time that works for you, and complete any required pre-appointment questionnaires. When it's time for your appointment, log in to your account and join the video consultation."
          }
        ]
      },
      {
        category: "Appointments & Consultations",
        icon: <VideoCall color="primary" />,
        faqs: [
          {
            question: "How do I schedule an appointment?",
            answer: "To schedule an appointment, log in to your account and click on 'Find a Doctor' or 'Schedule Appointment' button. Browse the available healthcare providers, select your preferred doctor, choose an available date and time slot, provide a reason for your visit, and confirm your appointment. You'll receive a confirmation email with appointment details and instructions for joining the video call."
          },
          {
            question: "What do I need for a video consultation?",
            answer: "For a successful video consultation, you'll need: 1) A device with a camera and microphone (smartphone, tablet, or computer), 2) A stable internet connection, 3) A quiet, private space for your appointment, 4) Your health insurance information (if applicable), 5) A list of current medications and symptoms, and 6) Any relevant medical records or test results. Our platform works on most modern browsers without requiring any software downloads."
          },
          {
            question: "Can I cancel or reschedule my appointment?",
            answer: "Yes, you can cancel or reschedule your appointment through your account. Navigate to 'My Appointments,' find the appointment you want to change, and select 'Reschedule' or 'Cancel.' Please note that we request at least 24 hours' notice for cancellations or changes. Late cancellations may incur a fee, depending on the provider's policy. If you need to cancel with less notice due to an emergency, please contact our support team."
          },
          {
            question: "What happens during a telehealth appointment?",
            answer: "During your telehealth appointment, you'll connect with your provider through our secure video platform. The provider will greet you, discuss your medical history and current concerns, perform a visual assessment if needed, provide a diagnosis when possible, recommend treatment options, prescribe medications if appropriate, and answer any questions you have. The appointment typically lasts 15-30 minutes, similar to an in-person visit, and you'll receive a summary of the consultation afterward."
          }
        ]
      },
      {
        category: "Medical Services",
        icon: <MedicalServices color="primary" />,
        faqs: [
          {
            question: "What medical conditions can be treated through telehealth?",
            answer: "Our telehealth platform can address a wide range of conditions including cold and flu symptoms, allergies, skin conditions (rashes, acne), minor infections (UTIs, sinus infections), chronic disease management (diabetes, hypertension), mental health concerns (anxiety, depression), and follow-up care. Our providers can also offer general health advice, conduct wellness checks, and provide prescription refills. For a more comprehensive list, please visit our 'Conditions We Treat' page."
          },
          {
            question: "Can telehealth providers prescribe medications?",
            answer: "Yes, our providers can prescribe many medications, including antibiotics, antihistamines, and maintenance medications for chronic conditions. The prescriptions are sent electronically to your preferred pharmacy. However, there are restrictions on prescribing controlled substances via telehealth in some jurisdictions. Our providers follow all applicable laws and regulations regarding prescriptions and will advise you if an in-person visit is required for certain medications."
          },
          {
            question: "How do I get lab work or imaging done?",
            answer: "If your provider determines that you need laboratory tests or imaging studies, they will provide you with a requisition form that you can take to a local lab or imaging center. Your provider will review the results with you during a follow-up appointment or through our secure messaging system. In some cases, we can arrange for mobile phlebotomy services to collect samples at your home, depending on your location and insurance coverage."
          },
          {
            question: "Will I always see the same doctor?",
            answer: "You can choose to see the same provider for all your appointments by scheduling directly with them. We encourage building a relationship with a primary telehealth provider for consistent care. However, if you need an urgent appointment and your preferred provider isn't available, you can choose to see another qualified healthcare professional on our platform. Your medical records are securely stored in our system and can be accessed by any provider you consult with, ensuring continuity of care."
          }
        ]
      },
      {
        category: "Payment & Insurance",
        icon: <Payment color="primary" />,
        faqs: [
          {
            question: "How much does a telehealth visit cost?",
            answer: "The cost of telehealth visits varies depending on your insurance coverage and the type of consultation. For patients with insurance, we accept most major plans, and your cost will depend on your specific coverage and whether you've met your deductible. For self-pay patients, our standard consultation fee is $75-$150, depending on the complexity and duration of the visit. We also offer subscription plans for patients who require regular care. Detailed pricing information is available during the booking process."
          },
          {
            question: "Does insurance cover telehealth visits?",
            answer: "Many insurance plans now cover telehealth services, especially since the COVID-19 pandemic. We accept most major insurance providers, including Medicare and Medicaid in many states. Coverage varies by plan and provider, so we recommend checking with your insurance company about telehealth benefits before scheduling. Our platform can verify your insurance information during registration to provide estimated coverage information. If you're unsure, our support team can help you understand your coverage options."
          },
          {
            question: "How do I pay for my appointment?",
            answer: "Payment is processed securely through our platform. You can pay using credit/debit cards or HSA/FSA cards. For insured patients, we'll collect any applicable copay before your appointment and bill your insurance for the remainder. Self-pay patients will be charged the full fee at the time of booking. Our system uses advanced encryption to protect your payment information, and you'll receive a detailed receipt for your records or reimbursement purposes."
          },
          {
            question: "What if I can't afford the consultation fee?",
            answer: "We're committed to making healthcare accessible to everyone. If you're experiencing financial hardship, please contact our patient services team to discuss possible options, including payment plans, sliding scale fees based on income, or connection to financial assistance programs. We also offer periodic promotional discounts for new patients and have subscription plans that can make regular care more affordable for those managing chronic conditions."
          }
        ]
      },
      {
        category: "Privacy & Security",
        icon: <Security color="primary" />,
        faqs: [
          {
            question: "Is my health information secure?",
            answer: "Yes, protecting your health information is our top priority. Our platform is fully HIPAA-compliant and employs industry-leading security measures including end-to-end encryption for video consultations, multi-factor authentication, and secure data storage. We never share your information with third parties without your explicit consent, except as required by law. Our privacy practices are regularly audited and updated to maintain the highest standards of data protection."
          },
          {
            question: "Who can access my medical records?",
            answer: "Your medical records can only be accessed by: 1) Healthcare providers directly involved in your care, 2) Our technical staff for system maintenance (with limited access), 3) You, through your secure patient portal, and 4) Anyone you specifically authorize in writing. All access to your records is logged and monitored. We maintain strict access controls and regular security training for all staff to ensure your information remains private and confidential."
          },
          {
            question: "Are video consultations private?",
            answer: "Absolutely. All video consultations take place over secure, encrypted connections that comply with HIPAA regulations. The video calls are never recorded unless you provide explicit consent for specific clinical or educational purposes. We recommend that you conduct your appointment in a private location to maintain your confidentiality. Our providers also conduct consultations from private, professional settings to ensure conversations remain confidential."
          },
          {
            question: "What happens to my data if I close my account?",
            answer: "If you close your account, we retain your medical records for the period required by law (typically 7-10 years, depending on state regulations) to ensure continuity of care if you return and to comply with medical record retention requirements. However, we can deactivate your account so you no longer receive communications. You can request a copy of your complete medical record at any time. If you have specific concerns about data retention, please contact our privacy officer for more information."
          }
        ]
      },
      {
        category: "Technical Support",
        icon: <QuestionAnswer color="primary" />,
        faqs: [
          {
            question: "What if I have technical issues during my appointment?",
            answer: "If you experience technical difficulties during your appointment, first try refreshing your browser or restarting the application. If problems persist, you can contact our technical support team via the live chat feature or by calling our support hotline at (800) 123-4567. Our providers are also trained to troubleshoot common issues and can often help get your connection back on track. If technical issues cannot be resolved, we'll reschedule your appointment at no additional cost."
          },
          {
            question: "What devices and browsers are supported?",
            answer: "Our telehealth platform works on most modern devices, including smartphones (iOS and Android), tablets, laptops, and desktop computers with a camera and microphone. We support recent versions of major browsers including Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using Chrome or Firefox on a desktop or laptop computer with a stable internet connection of at least 3 Mbps. Our mobile apps are also available for download from the Apple App Store and Google Play Store."
          },
          {
            question: "Can I test my connection before an appointment?",
            answer: "Yes, we highly recommend testing your connection before your first appointment. After logging in, go to your account settings and select 'Test My Device' to verify your camera, microphone, speakers, and internet connection. This test will identify any potential issues and provide troubleshooting suggestions. You can also join your virtual waiting room up to 15 minutes before your scheduled appointment to ensure everything is working properly."
          },
          {
            question: "How can I contact customer support?",
            answer: "Our customer support team is available Monday through Friday from 8am to 8pm EST, and Saturday from 9am to 5pm EST. You can reach us through multiple channels: 1) Live chat support directly within the platform, 2) Email at support@telehealthplatform.com, 3) Phone at (800) 123-4567, or 4) Check our Help Center for self-service troubleshooting guides and frequently asked questions. For urgent medical issues outside of support hours, please contact your local emergency services."
          }
        ]
      }
    ];
  
    // Filter FAQs based on search term
    const filteredFaqs = searchTerm.trim() === '' 
      ? faqCategories 
      : faqCategories.map(category => {
          return {
            ...category,
            faqs: category.faqs.filter(faq => 
              faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
              faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
            )
          };
        }).filter(category => category.faqs.length > 0);
  
    return (
      <Layout title="Frequently Asked Questions">
        {/* Hero Section */}
        <Box 
          sx={{ 
            bgcolor: theme.palette.primary.main, 
            color: 'white',
            py: 6,
            borderRadius: { xs: 0, md: 2 },
            mb: 6
          }}
        >
          <Container maxWidth="md">
            <Typography 
              variant="h2" 
              component="h1" 
              align="center"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              How Can We Help You?
            </Typography>
            <Typography 
              variant="h6" 
              align="center"
              sx={{ mb: 4, opacity: 0.9 }}
            >
              Find answers to commonly asked questions about our telehealth services
            </Typography>
            
            {/* Search Bar */}
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              <TextField
                fullWidth
                placeholder="Search for answers..."
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ 
                  bgcolor: 'white',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 28,
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Container>
        </Box>
  
        {/* FAQ Content */}
        <Container maxWidth="lg" sx={{ mb: 8 }}>
          {searchTerm.trim() !== '' && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                {filteredFaqs.reduce((count, category) => count + category.faqs.length, 0)} results for "{searchTerm}"
              </Typography>
              <Button 
                variant="text" 
                onClick={() => setSearchTerm('')}
                sx={{ fontWeight: 500 }}
              >
                Clear search
              </Button>
            </Box>
          )}
          
          {filteredFaqs.length === 0 ? (
            <Paper 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Typography variant="h6" gutterBottom>
                No results found for "{searchTerm}"
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Try different keywords or browse our categories below.
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => setSearchTerm('')}
                sx={{ mt: 2 }}
              >
                View all FAQs
              </Button>
            </Paper>
          ) : (
            <>
              <Grid container spacing={4}>
                {filteredFaqs.map((category, categoryIndex) => (
                  <Grid item xs={12} key={categoryIndex}>
                    <Box sx={{ mb: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box 
                          sx={{ 
                            mr: 2, 
                            width: 48, 
                            height: 48, 
                            borderRadius: '50%',
                            bgcolor: 'rgba(0, 99, 176, 0.1)', 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {category.icon}
                        </Box>
                        <Typography variant="h5" component="h2" fontWeight={600}>
                          {category.category}
                        </Typography>
                      </Box>
                      
                      <Box>
                        {category.faqs.map((faq, faqIndex) => {
                          const panelId = `panel-${categoryIndex}-${faqIndex}`;
                          return (
                            <Accordion 
                              key={faqIndex}
                              expanded={expanded === panelId}
                              onChange={handleChange(panelId)}
                              sx={{ 
                                mb: 1.5,
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: 'none',
                                borderRadius: '8px !important',
                                '&:before': {
                                  display: 'none',
                                },
                                '&.Mui-expanded': {
                                  margin: '0 0 12px 0',
                                  borderColor: theme.palette.primary.main,
                                }
                              }}
                            >
                              <AccordionSummary
                                expandIcon={<ExpandMore />}
                                sx={{ 
                                  borderRadius: 2,
                                  '&.Mui-expanded': {
                                    minHeight: 48,
                                  }
                                }}
                              >
                                <Typography variant="subtitle1" fontWeight={expanded === panelId ? 600 : 400}>
                                  {faq.question}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Typography variant="body1">
                                  {faq.answer}
                                </Typography>
                              </AccordionDetails>
                            </Accordion>
                          );
                        })}
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              
              {/* Still Need Help Section */}
              <Paper 
                sx={{ 
                  p: 4, 
                  mt: 6, 
                  textAlign: 'center',
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
                  Still Have Questions?
                </Typography>
                <Typography variant="body1" paragraph>
                  If you couldn't find the answer you were looking for, our support team is here to help.
                </Typography>
                <Button
                  component={NextLink}
                  href="/contact"
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ 
                    py: 1.5, 
                    px: 4,
                    fontWeight: 600,
                    borderRadius: 28
                  }}
                >
                  Contact Support
                </Button>
              </Paper>
            </>
          )}
        </Container>
      </Layout>
    );
  }