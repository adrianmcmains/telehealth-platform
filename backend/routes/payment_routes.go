package routes

import (
	"github.com/gin-gonic/gin"
	
	"github.com/adrianmcmains/telehealth-platform/controllers"
	"github.com/adrianmcmains/telehealth-platform/middleware"
	"github.com/adrianmcmains/telehealth-platform/models"
)

// SetupPaymentRoutes configures the payment routes
func SetupPaymentRoutes(router *gin.RouterGroup) {
	paymentController := controllers.NewPaymentController()
	
	// Payment routes
	paymentRoutes := router.Group("/payments")
	{
		// Public route for payment callbacks
		paymentRoutes.POST("/callback", paymentController.HandlePaymentCallback)
		
		// Protected routes
		protected := paymentRoutes.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			// Create payment
			protected.POST("", paymentController.CreatePayment)
			
			// Get payment details
			protected.GET("/:id", paymentController.GetPayment)
			
			// Get payment by appointment
			protected.GET("/appointment/:id", paymentController.GetPaymentByAppointment)
			
			// Refund payment (admin and doctor only)
			refundRoutes := protected.Group("/")
			refundRoutes.Use(middleware.RoleMiddleware(models.RoleAdmin, models.RoleDoctor))
			{
				refundRoutes.POST("/:id/refund", paymentController.RefundPayment)
			}
		}
	}
}