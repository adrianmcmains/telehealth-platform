import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Button, 
  Typography, 
  AppBar, 
  Toolbar, 
  IconButton,
  Grid,
  Paper, 
  Card,
  CardContent,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Mic, 
  MicOff, 
  Videocam, 
  VideocamOff, 
  CallEnd, 
  Chat, 
  Send, 
  ArrowBack
} from '@mui/icons-material';
import { format } from 'date-fns';
import Link from 'next/link';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';
import { appointmentService } from '../../../services/api';

export default function VideoCall() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  
  // Refs for video elements
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  
  useEffect(() => {
    if (id) {
      fetchAppointment();
    }
  }, [id]);
  
  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAppointment(id);
      setAppointment(response.appointment);
      
      // Update appointment status to in-progress if it's scheduled
      if (response.appointment.status === 'scheduled') {
        try {
          await appointmentService.updateAppointment(id, { status: 'in-progress' });
        } catch (error) {
          console.error('Failed to update appointment status:', error);
        }
      }
      
      // Set up video call (mock for demo)
      setupMockVideoCall();
    } catch (err) {
      console.error('Failed to fetch appointment:', err);
      setError('Failed to load appointment details. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Setup mock video call for demonstration
  const setupMockVideoCall = async () => {
    try {
      // Get user's video and audio
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      // Display local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Mock remote video with the same stream for demo purposes
      // In a real app, this would come from WebRTC peer connection
      setTimeout(() => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      }, 2000);
      
    } catch (err) {
      console.error('Failed to access camera and microphone:', err);
      setError('Failed to access your camera and microphone. Please check your permissions.');
    }
  };
  
  const toggleVideo = () => {
    const stream = localVideoRef.current?.srcObject;
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };
  
  const toggleAudio = () => {
    const stream = localVideoRef.current?.srcObject;
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };
  
  const endCall = () => {
    // Stop all tracks
    const localStream = localVideoRef.current?.srcObject;
    const remoteStream = remoteVideoRef.current?.srcObject;
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }
    
    // Navigate back to appointment details
    router.push(`/appointments/${id}`);
  };
  
  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now(),
        sender: user.firstName,
        text: message,
        timestamp: new Date()
      };
      
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };
  
  const otherPerson = user?.role === 'patient' ? appointment?.doctor : appointment?.patient;
  
  return (
    <ProtectedRoute>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* App Bar */}
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => router.push(`/appointments/${id}`)}
              sx={{ mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="div">
                {appointment ? `Appointment with ${otherPerson?.firstName} ${otherPerson?.lastName}` : 'Video Call'}
              </Typography>
              {appointment && (
                <Typography variant="body2" color="text.secondary">
                  {format(new Date(appointment.startTime), 'EEEE, MMMM d • h:mm a')}
                </Typography>
              )}
            </Box>
          </Toolbar>
        </AppBar>
        
        {/* Main Content */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button 
              component={Link} 
              href={`/appointments/${id}`} 
              variant="outlined"
            >
              Return to Appointment
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
            {/* Video Call Area */}
            <Box sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              position: 'relative',
              bgcolor: '#121212'
            }}>
              {/* Remote Video (Full Screen) */}
              <Box sx={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', maxHeight: '100%' }}
                />
              </Box>
              
              {/* Local Video (Picture-in-Picture) */}
              <Box sx={{ 
                position: 'absolute', 
                bottom: 16, 
                right: 16, 
                width: '25%',
                maxWidth: 200,
                aspectRatio: '16/9',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 3
              }}>
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
              
              {/* Call Controls */}
              <Paper sx={{ 
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                p: 2,
                bgcolor: 'rgba(0, 0, 0, 0.5)'
              }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <IconButton 
                    onClick={toggleAudio} 
                    sx={{ 
                      bgcolor: audioEnabled ? 'primary.main' : 'error.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: audioEnabled ? 'primary.dark' : 'error.dark'
                      }
                    }}
                  >
                    {audioEnabled ? <Mic /> : <MicOff />}
                  </IconButton>
                  
                  <IconButton 
                    onClick={toggleVideo} 
                    sx={{ 
                      bgcolor: videoEnabled ? 'primary.main' : 'error.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: videoEnabled ? 'primary.dark' : 'error.dark'
                      }
                    }}
                  >
                    {videoEnabled ? <Videocam /> : <VideocamOff />}
                  </IconButton>
                  
                  <IconButton 
                    onClick={endCall} 
                    sx={{ 
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'error.dark'
                      }
                    }}
                  >
                    <CallEnd />
                  </IconButton>
                  
                  <IconButton 
                    onClick={() => setShowChat(!showChat)} 
                    sx={{ 
                      bgcolor: showChat ? 'primary.main' : 'grey.700',
                      color: 'white',
                      '&:hover': {
                        bgcolor: showChat ? 'primary.dark' : 'grey.800'
                      }
                    }}
                  >
                    <Chat />
                  </IconButton>
                </Box>
              </Paper>
            </Box>
            
            {/* Chat Panel */}
            {showChat && (
              <Box sx={{ 
                width: { xs: '100%', md: 320 }, 
                height: '100%',
                display: { xs: showChat ? 'flex' : 'none', md: 'flex' },
                flexDirection: 'column',
                position: { xs: 'absolute', md: 'relative' },
                right: 0,
                top: 0,
                bottom: 0,
                bgcolor: 'background.paper',
                borderLeft: '1px solid',
                borderColor: 'divider',
                zIndex: 1
              }}>
                <Box sx={{ 
                  p: 2, 
                  borderBottom: '1px solid', 
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Typography variant="h6">Chat</Typography>
                  <IconButton 
                    onClick={() => setShowChat(false)}
                    sx={{ display: { md: 'none' } }}
                  >
                    <ArrowBack />
                  </IconButton>
                </Box>
                
                {/* Messages */}
                <Box sx={{ 
                  flexGrow: 1, 
                  overflowY: 'auto',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2
                }}>
                  {messages.length === 0 ? (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      height: '100%'
                    }}>
                      <Typography color="text.secondary">
                        No messages yet
                      </Typography>
                    </Box>
                  ) : (
                    messages.map(msg => (
                      <Box 
                        key={msg.id}
                        sx={{ 
                          alignSelf: msg.sender === user.firstName ? 'flex-end' : 'flex-start',
                          maxWidth: '80%'
                        }}
                      >
                        <Card 
                          variant="outlined"
                          sx={{ 
                            bgcolor: msg.sender === user.firstName ? 'primary.main' : 'grey.100',
                            color: msg.sender === user.firstName ? 'white' : 'text.primary'
                          }}
                        >
                          <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                            <Typography variant="body2">
                              {msg.text}
                            </Typography>
                            <Typography variant="caption" sx={{ mt: 0.5, display: 'block', opacity: 0.8 }}>
                              {format(new Date(msg.timestamp), 'h:mm a')}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Box>
                    ))
                  )}
                </Box>
                
                {/* Message Input */}
                <Box sx={{ 
                  p: 2, 
                  borderTop: '1px solid', 
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <IconButton 
                    color="primary"
                    onClick={sendMessage}
                    disabled={!message.trim()}
                  >
                    <Send />
                  </IconButton>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </ProtectedRoute>
  );
}