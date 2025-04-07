package routes

import (
	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all the routes for the application
func SetupRoutes(router *gin.Engine) {
	// API version group
	v1 := router.Group("/api/v1")
	
	// Setup individual route groups
	SetupAuthRoutes(v1)
	SetupUserRoutes(v1)
	SetupAppointmentRoutes(v1)
	SetupWebRTCRoutes(v1)
	SetupPaymentRoutes(v1)
	SetupTwoFARoutes(v1)
}