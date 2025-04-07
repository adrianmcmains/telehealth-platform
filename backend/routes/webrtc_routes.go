package routes

import (
	"github.com/gin-gonic/gin"
	
	"github.com/adrianmcmains/telehealth-platform/middleware"
	"github.com/adrianmcmains/telehealth-platform/services"
)

// SetupWebRTCRoutes configures the WebRTC routes
func SetupWebRTCRoutes(router *gin.RouterGroup) {
	webRTCService := services.NewWebRTCService()
	
	// WebRTC routes require authentication
	webRTCRoutes := router.Group("/webrtc")
	webRTCRoutes.Use(middleware.AuthMiddleware())
	{
		// WebSocket endpoint for WebRTC signaling
		webRTCRoutes.GET("/:roomId", webRTCService.HandleWebSocket)
	}
}