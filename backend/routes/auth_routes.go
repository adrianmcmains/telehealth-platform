package routes

import (
	"github.com/gin-gonic/gin"
	
	"github.com/adrianmcmains/telehealth-platform/controllers"
	"github.com/adrianmcmains/telehealth-platform/middleware"
)

// SetupAuthRoutes configures the authentication routes
func SetupAuthRoutes(router *gin.RouterGroup) {
	authController := controllers.NewAuthController()
	
	// Public routes
	authRoutes := router.Group("/auth")
	{
		authRoutes.POST("/login", authController.Login)
		authRoutes.POST("/register", authController.Register)
		
		// Protected route
		authRoutes.GET("/me", middleware.AuthMiddleware(), authController.GetMe)
	}
}