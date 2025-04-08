/**
 * WebRTC service for handling video calls
 */

// STUN/TURN servers for NAT traversal
const iceServers = {
    iceServers: [
      {
        urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
      },
      // In production, add TURN servers for reliable connections
      /*
      {
        urls: ["turn:your-turn-server.com:3478"],
        username: "username",
        credential: "password"
      }
      */
    ],
    iceCandidatePoolSize: 10,
  };
  
  class WebRTCService {
    constructor() {
      this.peerConnections = new Map(); // Map of userId -> RTCPeerConnection
      this.localStream = null;
      this.remoteStreams = new Map(); // Map of userId -> MediaStream
      this.socket = null;
      this.roomId = null;
      this.userId = null;
      this.onRemoteStreamCallback = null;
      this.onUserJoinedCallback = null;
      this.onUserLeftCallback = null;
    }
  
    /**
     * Initialize the WebRTC service
     * @param {string} roomId - The room ID for the call
     * @param {string} userId - The user ID of the current user
     * @param {function} onRemoteStream - Callback when a remote stream is added
     * @param {function} onUserJoined - Callback when a user joins the call
     * @param {function} onUserLeft - Callback when a user leaves the call
     */
    async initialize(roomId, userId, onRemoteStream, onUserJoined, onUserLeft) {
      this.roomId = roomId;
      this.userId = userId;
      this.onRemoteStreamCallback = onRemoteStream;
      this.onUserJoinedCallback = onUserJoined;
      this.onUserLeftCallback = onUserLeft;
  
      // Connect to signaling server
      const token = localStorage.getItem('token');
      this.socket = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/v1/webrtc/${roomId}`);
      
      this.socket.onopen = () => {
        console.log('WebSocket connection established');
        this.sendMessage({
          type: 'join',
        });
      };
  
      this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleSignalingMessage(message);
      };
  
      this.socket.onclose = () => {
        console.log('WebSocket connection closed');
        this.cleanup();
      };
  
      // Get user media
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
        });
        
        return this.localStream;
      } catch (err) {
        console.error('Error getting user media:', err);
        throw err;
      }
    }
  
    /**
     * Handle signaling messages from the server
     * @param {object} message - The signaling message
     */
    async handleSignalingMessage(message) {
      const { type, from, data } = message;
  
      switch (type) {
        case 'user-joined':
          console.log(`User ${from} joined the call`);
          await this.createPeerConnection(from);
          if (this.onUserJoinedCallback) {
            this.onUserJoinedCallback(from);
          }
          break;
  
        case 'user-left':
          console.log(`User ${from} left the call`);
          this.closePeerConnection(from);
          if (this.onUserLeftCallback) {
            this.onUserLeftCallback(from);
          }
          break;
  
        case 'offer':
          console.log(`Received offer from ${from}`);
          await this.handleOffer(from, data);
          break;
  
        case 'answer':
          console.log(`Received answer from ${from}`);
          await this.handleAnswer(from, data);
          break;
  
        case 'ice-candidate':
          console.log(`Received ICE candidate from ${from}`);
          await this.handleIceCandidate(from, data);
          break;
  
        default:
          console.log(`Unhandled message type: ${type}`);
      }
    }
  
    /**
     * Create a peer connection for a user
     * @param {string} userId - The user ID to create a connection with
     */
    async createPeerConnection(userId) {
      try {
        const peerConnection = new RTCPeerConnection(iceServers);
        this.peerConnections.set(userId, peerConnection);
  
        // Add local tracks to the connection
        this.localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, this.localStream);
        });
  
        // Listen for remote tracks
        peerConnection.ontrack = (event) => {
          console.log(`Received remote track from ${userId}`);
          if (!this.remoteStreams.has(userId)) {
            this.remoteStreams.set(userId, new MediaStream());
          }
          
          const stream = this.remoteStreams.get(userId);
          event.streams[0].getTracks().forEach((track) => {
            stream.addTrack(track);
          });
  
          if (this.onRemoteStreamCallback) {
            this.onRemoteStreamCallback(userId, stream);
          }
        };
  
        // Listen for ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            this.sendMessage({
              type: 'ice-candidate',
              to: userId,
              data: event.candidate,
            });
          }
        };
  
        // Create and send offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
  
        this.sendMessage({
          type: 'offer',
          to: userId,
          data: offer,
        });
  
        return peerConnection;
      } catch (err) {
        console.error(`Error creating peer connection for ${userId}:`, err);
        throw err;
      }
    }
  
    /**
     * Handle an offer from a remote peer
     * @param {string} userId - The user ID who sent the offer
     * @param {RTCSessionDescription} offer - The offer
     */
    async handleOffer(userId, offer) {
      try {
        let peerConnection = this.peerConnections.get(userId);
        
        if (!peerConnection) {
          peerConnection = new RTCPeerConnection(iceServers);
          this.peerConnections.set(userId, peerConnection);
  
          // Add local tracks to the connection
          this.localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, this.localStream);
          });
  
          // Listen for remote tracks
          peerConnection.ontrack = (event) => {
            console.log(`Received remote track from ${userId}`);
            if (!this.remoteStreams.has(userId)) {
              this.remoteStreams.set(userId, new MediaStream());
            }
            
            const stream = this.remoteStreams.get(userId);
            event.streams[0].getTracks().forEach((track) => {
              stream.addTrack(track);
            });
  
            if (this.onRemoteStreamCallback) {
              this.onRemoteStreamCallback(userId, stream);
            }
          };
  
          // Listen for ICE candidates
          peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
              this.sendMessage({
                type: 'ice-candidate',
                to: userId,
                data: event.candidate,
              });
            }
          };
        }
  
        // Set remote description
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  
        // Create and send answer
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
  
        this.sendMessage({
          type: 'answer',
          to: userId,
          data: answer,
        });
      } catch (err) {
        console.error(`Error handling offer from ${userId}:`, err);
      }
    }
  
    /**
     * Handle an answer from a remote peer
     * @param {string} userId - The user ID who sent the answer
     * @param {RTCSessionDescription} answer - The answer
     */
    async handleAnswer(userId, answer) {
      try {
        const peerConnection = this.peerConnections.get(userId);
        if (peerConnection) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (err) {
        console.error(`Error handling answer from ${userId}:`, err);
      }
    }
  
    /**
     * Handle an ICE candidate from a remote peer
     * @param {string} userId - The user ID who sent the ICE candidate
     * @param {RTCIceCandidate} candidate - The ICE candidate
     */
    async handleIceCandidate(userId, candidate) {
      try {
        const peerConnection = this.peerConnections.get(userId);
        if (peerConnection) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error(`Error handling ICE candidate from ${userId}:`, err);
      }
    }
  
    /**
     * Close a peer connection
     * @param {string} userId - The user ID to close the connection with
     */
    closePeerConnection(userId) {
      const peerConnection = this.peerConnections.get(userId);
      if (peerConnection) {
        peerConnection.close();
        this.peerConnections.delete(userId);
      }
  
      this.remoteStreams.delete(userId);
    }
  
    /**
     * Send a signaling message to the server
     * @param {object} message - The message to send
     */
    sendMessage(message) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(message));
      }
    }
  
    /**
     * Toggle audio
     * @param {boolean} enabled - Whether audio should be enabled
     */
    toggleAudio(enabled) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  
    /**
     * Toggle video
     * @param {boolean} enabled - Whether video should be enabled
     */
    toggleVideo(enabled) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  
    /**
     * Clean up resources
     */
    cleanup() {
      // Stop all local tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          track.stop();
        });
        this.localStream = null;
      }
  
      // Close all peer connections
      this.peerConnections.forEach((connection) => {
        connection.close();
      });
      this.peerConnections.clear();
  
      // Clear remote streams
      this.remoteStreams.clear();
  
      // Close WebSocket
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }
    }
  }
  
  export default new WebRTCService();