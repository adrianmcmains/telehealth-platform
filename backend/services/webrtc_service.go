package services

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer
	pongWait = 60 * time.Second

	// Send pings to peer with this period (must be less than pongWait)
	pingPeriod = (pongWait * 9) / 10
)

// WebRTCMessage represents a WebRTC signaling message
type WebRTCMessage struct {
	Type string          `json:"type"`
	From string          `json:"from"`
	To   string          `json:"to"`
	Data json.RawMessage `json:"data"`
}

// Client represents a connected client
type Client struct {
	Conn     *websocket.Conn
	UserID   uint
	RoomID   string
	Messages chan []byte
}

// Room represents a video session room
type Room struct {
	ID      string
	Clients map[uint]*Client
	Lock    sync.RWMutex
}

// WebRTCService manages WebRTC signaling
type WebRTCService struct {
	Rooms      map[string]*Room
	Lock       sync.RWMutex
	Upgrader   websocket.Upgrader
}

// NewWebRTCService creates a new WebRTC service
func NewWebRTCService() *WebRTCService {
	return &WebRTCService{
		Rooms: make(map[string]*Room),
		Upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin: func(r *http.Request) bool {
				// In production, implement proper origin checking
				return true
			},
		},
	}
}

// HandleWebSocket handles a new WebSocket connection
func (s *WebRTCService) HandleWebSocket(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	roomID := c.Param("roomId")
	if roomID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Room ID is required"})
		return
	}

	// Upgrade HTTP connection to WebSocket
	conn, err := s.Upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}

	// Create client
	client := &Client{
		Conn:     conn,
		UserID:   userID.(uint),
		RoomID:   roomID,
		Messages: make(chan []byte, 100),
	}

	// Add client to room
	s.joinRoom(client)

	// Start client routines
	go client.writePump()
	go client.readPump(s)
}

// joinRoom adds a client to a room
func (s *WebRTCService) joinRoom(client *Client) {
	s.Lock.Lock()
	defer s.Lock.Unlock()

	room, exists := s.Rooms[client.RoomID]
	if !exists {
		// Create new room if it doesn't exist
		room = &Room{
			ID:      client.RoomID,
			Clients: make(map[uint]*Client),
		}
		s.Rooms[client.RoomID] = room
	}

	room.Lock.Lock()
	defer room.Lock.Unlock()

	// Add client to room
	room.Clients[client.UserID] = client

	// Notify other clients about the new client
	s.broadcastJoin(client)
}

// leaveRoom removes a client from a room
func (s *WebRTCService) leaveRoom(client *Client) {
	s.Lock.Lock()
	defer s.Lock.Unlock()

	room, exists := s.Rooms[client.RoomID]
	if !exists {
		return
	}

	room.Lock.Lock()
	defer room.Lock.Unlock()

	// Remove client from room
	delete(room.Clients, client.UserID)

	// If room is empty, remove it
	if len(room.Clients) == 0 {
		delete(s.Rooms, client.RoomID)
	} else {
		// Notify other clients about the client leaving
		s.broadcastLeave(client)
	}
}

// broadcastJoin notifies other clients about a new client
func (s *WebRTCService) broadcastJoin(client *Client) {
	room := s.Rooms[client.RoomID]
	if room == nil {
		return
	}

	message := WebRTCMessage{
		Type: "user-joined",
		From: fmt.Sprint(client.UserID),
	}

	jsonMsg, err := json.Marshal(message)
	if err != nil {
		log.Printf("Failed to marshal join message: %v", err)
		return
	}

	for id, c := range room.Clients {
		if id != client.UserID {
			c.Messages <- jsonMsg
		}
	}
}

// broadcastLeave notifies other clients about a client leaving
func (s *WebRTCService) broadcastLeave(client *Client) {
	room := s.Rooms[client.RoomID]
	if room == nil {
		return
	}

	message := WebRTCMessage{
		Type: "user-left",
		From: fmt.Sprint(client.UserID),
	}

	jsonMsg, err := json.Marshal(message)
	if err != nil {
		log.Printf("Failed to marshal leave message: %v", err)
		return
	}

	for id, c := range room.Clients {
		if id != client.UserID {
			c.Messages <- jsonMsg
		}
	}
}

// broadcastMessage broadcasts a message to the specified recipient
func (s *WebRTCService) broadcastMessage(message *WebRTCMessage, fromClient *Client) {
	s.Lock.RLock()
	defer s.Lock.RUnlock()

	room := s.Rooms[fromClient.RoomID]
	if room == nil {
		return
	}

	room.Lock.RLock()
	defer room.Lock.RUnlock()

	// If the message has a specific recipient
	if message.To != "" {
		for id, client := range room.Clients {
			if fmt.Sprint(id) == message.To {
				jsonMsg, err := json.Marshal(message)
				if err != nil {
					log.Printf("Failed to marshal message: %v", err)
					return
				}
				client.Messages <- jsonMsg
				return
			}
		}
	} else {
		// Broadcast to all clients in the room except the sender
		jsonMsg, err := json.Marshal(message)
		if err != nil {
			log.Printf("Failed to marshal message: %v", err)
			return
		}

		for id, client := range room.Clients {
			if id != fromClient.UserID {
				client.Messages <- jsonMsg
			}
		}
	}
}

// readPump reads messages from the WebSocket
func (c *Client) readPump(s *WebRTCService) {
	defer func() {
		s.leaveRoom(c)
		c.Conn.Close()
		close(c.Messages)
	}()

	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket read error: %v", err)
			}
			break
		}

		var webRTCMessage WebRTCMessage
		if err := json.Unmarshal(message, &webRTCMessage); err != nil {
			log.Printf("Failed to unmarshal message: %v", err)
			continue
		}

		webRTCMessage.From = fmt.Sprint(c.UserID)
		s.broadcastMessage(&webRTCMessage, c)
	}
}

// writePump writes messages to the WebSocket
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Messages:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}