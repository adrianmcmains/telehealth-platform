package routes

import (
	"github.com/gin-gonic/gin"
	
	"github.com/adrianmcmains/telehealth-platform/controllers"
	"github.com/adrianmcmains/telehealth-platform/middleware"
	"github.com/adrianmcmains/telehealth-platform/models"
)

// SetupUserRoutes configures the user routes
func SetupUserRoutes(router *gin.RouterGroup) {
	userController := controllers.NewUserController()
	
	// All user routes require authentication
	userRoutes := router.Group("/users")
	userRoutes.Use(middleware.AuthMiddleware())
	{
		// Get user by ID
		userRoutes.GET("/:id", userController.GetUser)
		
		// Update user
		userRoutes.PUT("/:id", userController.UpdateUser)
		
		// List all doctors
		userRoutes.GET("/doctors", userController.ListDoctors)
		
		// Admin-only routes
		adminRoutes := userRoutes.Group("/")
		adminRoutes.Use(middleware.RoleMiddleware(models.RoleAdmin))
		{
			// Add admin-specific routes here
		}
	}
}