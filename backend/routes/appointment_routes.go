package routes

import (
	"github.com/gin-gonic/gin"
	
	"github.com/adrianmcmains/telehealth-platform/controllers"
	"github.com/adrianmcmains/telehealth-platform/middleware"
)

// SetupAppointmentRoutes configures the appointment routes
func SetupAppointmentRoutes(router *gin.RouterGroup) {
	appointmentController := controllers.NewAppointmentController()
	
	// All appointment routes require authentication
	appointmentRoutes := router.Group("/appointments")
	appointmentRoutes.Use(middleware.AuthMiddleware())
	{
		// Create a new appointment
		appointmentRoutes.POST("", appointmentController.CreateAppointment)
		
		// Get appointment by ID
		appointmentRoutes.GET("/:id", appointmentController.GetAppointment)
		
		// Update appointment
		appointmentRoutes.PUT("/:id", appointmentController.UpdateAppointment)
		
		// List user's appointments
		appointmentRoutes.GET("", appointmentController.ListUserAppointments)
	}
}