package routes

import (
	"github.com/gin-gonic/gin"
	
	"github.com/adrianmcmains/telehealth-platform/controllers"
	"github.com/adrianmcmains/telehealth-platform/middleware"
)

// SetupTwoFARoutes configures the two-factor authentication routes
func SetupTwoFARoutes(router *gin.RouterGroup) {
	twoFAController := controllers.NewTwoFAController()
	
	// 2FA routes
	twoFARoutes := router.Group("/2fa")
	{
		// Validate 2FA token during login (public route)
		twoFARoutes.POST("/validate", twoFAController.Validate2FA)
		
		// Protected routes
		protected := twoFARoutes.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			// Enable 2FA
			protected.POST("/enable", twoFAController.Enable2FA)
			
			// Verify 2FA setup
			protected.POST("/verify", twoFAController.Verify2FA)
			
			// Disable 2FA
			protected.POST("/disable", twoFAController.Disable2FA)
		}
	}
}