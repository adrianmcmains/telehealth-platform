// frontend/src/pages/appointments/[id]/video.js

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
  Avatar,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme
} from '@mui/material';
import { 
  Mic, 
  MicOff, 
  Videocam, 
  VideocamOff, 
  CallEnd, 
  Chat as ChatIcon, 
  Send, 
  ArrowBack,
  MoreVert,
  FullscreenExit,
  Fullscreen,
  ScreenShare,
  StopScreenShare,
  //VisibilityOff,
  Settings,
  //VolumeUp,
  //VolumeOff,
  //Image,
  PanTool
} from '@mui/icons-material';
import { format } from 'date-fns';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';
import { appointmentService } from '../../../services/api';

export default function VideoCall() {
  const theme = useTheme();
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [confirmEndCall, setConfirmEndCall] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [raisingHand, setRaisingHand] = useState(false);
  
  // Refs for video elements
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const videoContainerRef = useRef(null);
  
  useEffect(() => {
    if (id) {
      fetchAppointment();
    }
    
    // Auto-hide controls after 5 seconds of inactivity
    const timer = setTimeout(() => {
      if (!anchorEl) {
        setShowControls(false);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [id, anchorEl, fetchAppointment]);
  
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
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error('Failed to enter fullscreen:', err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(err => console.error('Failed to exit fullscreen:', err));
    }
  };
  
  const handleScreenShare = () => {
    // In a real app, this would use the Screen Capture API
    // For demo purposes, we're just toggling a state
    setIsScreenSharing(!isScreenSharing);
    setAnchorEl(null);
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
    
    // Update appointment status to completed
    if (appointment && appointment.status === 'in-progress') {
      appointmentService.updateAppointment(id, { status: 'completed' })
        .catch(error => console.error('Failed to update appointment status:', error));
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
  
  const handleMouseMove = () => {
    setShowControls(true);
    
    // Auto-hide controls after 5 seconds of inactivity
    const timer = setTimeout(() => {
      if (!anchorEl) {
        setShowControls(false);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  };
  
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleRaiseHand = () => {
    setRaisingHand(!raisingHand);
    
    // In a real app, we would notify the other user
    if (!raisingHand) {
      const newMessage = {
        id: Date.now(),
        sender: 'System',
        text: `${user.firstName} raised their hand`,
        timestamp: new Date(),
        isSystemMessage: true
      };
      
      setMessages([...messages, newMessage]);
    }
    
    setAnchorEl(null);
  };
  
  const otherPerson = user?.role === 'patient' ? appointment?.doctor : appointment?.patient;
  
  return (
    <ProtectedRoute>
      <Box 
        sx={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          bgcolor: '#000',
          position: 'relative'
        }}
        ref={videoContainerRef}
        onMouseMove={handleMouseMove}
      >
        {/* App Bar */}
        <AppBar 
          position="fixed" 
          color="transparent" 
          sx={{ 
            bgcolor: 'rgba(0, 0, 0, 0.6)',
            boxShadow: 'none',
            transition: 'opacity 0.3s ease',
            opacity: showControls ? 1 : 0,
            pointerEvents: showControls ? 'auto' : 'none'
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setConfirmEndCall(true)}
              sx={{ mr: 2, color: 'white' }}
            >
              <ArrowBack />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="div" color="white">
                {appointment ? `Appointment with ${otherPerson?.firstName} ${otherPerson?.lastName}` : 'Video Call'}
              </Typography>
              {appointment && (
                <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                  {format(new Date(appointment.startTime), 'EEEE, MMMM d • h:mm a')}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Settings">
                <IconButton
                  color="inherit"
                  onClick={handleMenuClick}
                  sx={{ color: 'white' }}
                >
                  <MoreVert />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: { 
                    borderRadius: 2,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <MenuItem onClick={handleScreenShare}>
                  <ListItemIcon>
                    {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
                  </ListItemIcon>
                  <ListItemText primary={isScreenSharing ? "Stop sharing" : "Share screen"} />
                </MenuItem>
                <MenuItem onClick={handleRaiseHand}>
                  <ListItemIcon>
                    <PanTool color={raisingHand ? "primary" : "inherit"} />
                  </ListItemIcon>
                  <ListItemText primary={raisingHand ? "Lower hand" : "Raise hand"} />
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => setShowHelpDialog(true)}>
                  <ListItemIcon>
                    <Settings />
                  </ListItemIcon>
                  <ListItemText primary="Help & Settings" />
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
        
        {/* Main Content */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
            <CircularProgress sx={{ color: 'white' }} />
          </Box>
        ) : error ? (
          <Box sx={{ 
            p: 3, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            bgcolor: '#21252b'
          }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button 
              variant="contained"
              color="primary"
              onClick={() => router.push(`/appointments/${id}`)}
              sx={{ mt: 2 }}
            >
              Return to Appointment
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
            {/* Video Call Area */}
            <Box sx={{ 
              flexGrow: 1, 
              height: '100%',
              display: 'flex', 
              flexDirection: 'column',
              position: 'relative',
              backgroundColor: '#21252b'
            }}>
              {/* Remote Video (Full Screen) */}
              <Box sx={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain',
                    backgroundColor: '#000'
                  }}
                />
                
                {/* Remote user name/status badge */}
                <Box sx={{ 
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: 'rgba(0, 0, 0, 0.6)',
                  color: 'white',
                  py: 0.5,
                  px: 1.5,
                  borderRadius: 2
                }}>
                  <Typography variant="body2">
                    {otherPerson ? `${otherPerson.firstName} ${otherPerson.lastName}` : 'Remote User'}
                  </Typography>
                </Box>
                
                {/* Raised hand indicator */}
                {raisingHand && (
                  <Box sx={{ 
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    py: 0.5,
                    px: 1.5,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <PanTool sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="body2">Hand Raised</Typography>
                  </Box>
                )}
              </Box>
              
              {/* Local Video (Picture-in-Picture) */}
              <Box sx={{ 
                position: 'absolute', 
                top: 16, 
                right: 16, 
                width: { xs: '25%', sm: '20%', md: '15%' },
                maxWidth: 200,
                aspectRatio: '16/9',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                zIndex: 10
              }}>
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    backgroundColor: '#000'
                  }}
                />
                
                {/* Video disabled overlay */}
                {!videoEnabled && (
                  <Box sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, mb: 1 }}>
                      {user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : 'ME'}
                    </Avatar>
                    <Typography variant="caption" color="white">Camera Off</Typography>
                  </Box>
                )}
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
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                boxShadow: 'none',
                transition: 'opacity 0.3s ease',
                opacity: showControls ? 1 : 0,
                pointerEvents: showControls ? 'auto' : 'none'
              }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Tooltip title={audioEnabled ? "Mute" : "Unmute"}>
                    <IconButton 
                      onClick={toggleAudio} 
                      sx={{ 
                        bgcolor: audioEnabled ? 'rgba(255, 255, 255, 0.2)' : theme.palette.error.main,
                        color: 'white',
                        '&:hover': {
                          bgcolor: audioEnabled ? 'rgba(255, 255, 255, 0.3)' : theme.palette.error.dark
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {audioEnabled ? <Mic /> : <MicOff />}
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={videoEnabled ? "Turn off camera" : "Turn on camera"}>
                    <IconButton 
                      onClick={toggleVideo} 
                      sx={{ 
                        bgcolor: videoEnabled ? 'rgba(255, 255, 255, 0.2)' : theme.palette.error.main,
                        color: 'white',
                        '&:hover': {
                          bgcolor: videoEnabled ? 'rgba(255, 255, 255, 0.3)' : theme.palette.error.dark
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {videoEnabled ? <Videocam /> : <VideocamOff />}
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="End call">
                    <IconButton 
                      onClick={() => setConfirmEndCall(true)} 
                      sx={{ 
                        bgcolor: theme.palette.error.main,
                        color: 'white',
                        '&:hover': {
                          bgcolor: theme.palette.error.dark
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <CallEnd />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={showChat ? "Hide chat" : "Open chat"}>
                    <IconButton 
                      onClick={() => setShowChat(!showChat)} 
                      sx={{ 
                        bgcolor: showChat ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        '&:hover': {
                          bgcolor: showChat ? theme.palette.primary.dark : 'rgba(255, 255, 255, 0.3)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <ChatIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
                    <IconButton 
                      onClick={toggleFullscreen} 
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.3)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                    </IconButton>
                  </Tooltip>
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
                bgcolor: 'rgba(33, 37, 43, 0.95)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                zIndex: 20
              }}>
                <Box sx={{ 
                  p: 2, 
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Typography variant="h6" color="white">Chat</Typography>
                  <Tooltip title="Close chat">
                    <IconButton 
                      onClick={() => setShowChat(false)}
                      sx={{ color: 'white' }}
                    >
                      <ArrowBack />
                    </IconButton>
                  </Tooltip>
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
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center',
                      height: '100%',
                      color: 'rgba(255, 255, 255, 0.5)'
                    }}>
                      <ChatIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                      <Typography color="inherit">
                        No messages yet
                      </Typography>
                      <Typography variant="body2" color="inherit" sx={{ mt: 1, textAlign: 'center' }}>
                        Send a message to start the conversation
                      </Typography>
                    </Box>
                  ) : (
                    messages.map(msg => (
                      <Box 
                        key={msg.id}
                        sx={{ 
                          alignSelf: msg.isSystemMessage ? 'center' : 
                                     msg.sender === user.firstName ? 'flex-end' : 'flex-start',
                          maxWidth: msg.isSystemMessage ? '90%' : '80%'
                        }}
                      >
                        {msg.isSystemMessage ? (
                          <Box sx={{ 
                            py: 0.5, 
                            px: 2, 
                            borderRadius: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            color: 'rgba(255, 255, 255, 0.7)'
                          }}>
                            <Typography variant="body2">
                              {msg.text}
                            </Typography>
                          </Box>
                        ) : (
                          <Card 
                            variant="outlined"
                            sx={{ 
                              bgcolor: msg.sender === user.firstName ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.1)',
                              color: msg.sender === user.firstName ? 'white' : 'white',
                              borderRadius: 2,
                              border: 'none'
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
                        )}
                      </Box>
                    ))
                  )}
                </Box>
                
                {/* Message Input */}
                <Box sx={{ 
                  p: 2, 
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
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
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        borderRadius: 2,
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: 'rgba(255, 255, 255, 0.5)',
                        opacity: 1,
                      },
                    }}
                  />
                  <IconButton 
                    color="primary"
                    onClick={sendMessage}
                    disabled={!message.trim()}
                    sx={{ color: theme.palette.primary.main }}
                  >
                    <Send />
                  </IconButton>
                </Box>
              </Box>
            )}
          </Box>
        )}
        
        {/* End Call Confirmation Dialog */}
        <Dialog 
          open={confirmEndCall} 
          onClose={() => setConfirmEndCall(false)}
          PaperProps={{
            sx: { 
              borderRadius: 3,
              maxWidth: 400
            }
          }}
        >
          <DialogTitle>End Call</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to end this call? You will be returned to the appointment details page.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setConfirmEndCall(false)} 
              color="primary"
            >
              Cancel
            </Button>
            <Button 
              onClick={endCall} 
              variant="contained"
              color="error"
              autoFocus
            >
              End Call
            </Button>
          </DialogActions>
        </Dialog>

        {/* Help & Settings Dialog */}
        <Dialog 
          open={showHelpDialog} 
          onClose={() => setShowHelpDialog(false)}
          PaperProps={{
            sx: { 
              borderRadius: 3,
              maxWidth: 500
            }
          }}
        >
          <DialogTitle>Help & Settings</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" gutterBottom>
              Keyboard Shortcuts
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2">Mute/Unmute</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight={600}>M</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Turn Camera On/Off</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight={600}>V</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Toggle Chat</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight={600}>C</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Toggle Fullscreen</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight={600}>F</Typography>
                </Grid>
              </Grid>
            </Box>
            
            <Typography variant="subtitle1" gutterBottom>
              Troubleshooting
            </Typography>
            <Typography variant="body2" paragraph>
              If you&apos;re having issues with audio or video:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Box component="li">
                <Typography variant="body2">
                  Check that your camera and microphone are properly connected
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2">
                  Make sure you&apos;ve given browser permission to access your camera and microphone
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2">
                  Try refreshing the page
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowHelpDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ProtectedRoute>
  );
}