package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	
	"github.com/adrianmcmains/telehealth-platform/config"
	"github.com/adrianmcmains/telehealth-platform/models"
	"github.com/adrianmcmains/telehealth-platform/services"
)

// CreateAppointmentRequest represents the create appointment request body
type CreateAppointmentRequest struct {
	DoctorID  uint      `json:"doctorId" binding:"required"`
	StartTime string    `json:"startTime" binding:"required"`
	EndTime   string    `json:"endTime" binding:"required"`
	Reason    string    `json:"reason" binding:"required"`
}

// UpdateAppointmentRequest represents the update appointment request body
type UpdateAppointmentRequest struct {
	Status   string `json:"status"`
	Notes    string `json:"notes"`
	RoomID   string `json:"videoRoomId"`
}

// AppointmentController handles appointment-related requests
type AppointmentController struct {
	DB                *gorm.DB
	NotificationService *services.NotificationService
}

// NewAppointmentController creates a new instance of AppointmentController
func NewAppointmentController() *AppointmentController {
	return &AppointmentController{
		DB: config.DB,
		NotificationService: services.NewNotificationService(&gorm.DB{}),
	}
}

// CreateAppointment creates a new appointment
func (ac *AppointmentController) CreateAppointment(c *gin.Context) {
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	
	// Bind and validate request body
	var request CreateAppointmentRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Parse start and end times
	startTime, err := time.Parse(time.RFC3339, request.StartTime)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start time format"})
		return
	}
	
	endTime, err := time.Parse(time.RFC3339, request.EndTime)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end time format"})
		return
	}
	
	// Validate time range
	if startTime.After(endTime) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Start time must be before end time"})
		return
	}
	
	/**  // Check if the doctor exists
	var doctor models.User
	if err := ac.DB.Where("id = ? AND role = ?", request.DoctorID, models.RoleDoctor).First(&doctor).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Doctor not found"})
		return
	}**/

	// Get the default doctor
	var doctor models.User
	if err := ac.DB.Where("role = ?", models.RoleDoctor).First(&doctor).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Default doctor not found"})
		return
	}
	
	// Check for conflicting appointments
	var conflictCount int64
	ac.DB.Model(&models.Appointment{}).
		Where("doctor_id = ? AND status != ? AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?) OR (start_time >= ? AND end_time <= ?))",
			request.DoctorID, models.StatusCancelled, endTime, startTime, endTime, startTime, startTime, endTime).
		Count(&conflictCount)
	
	if conflictCount > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "The selected time slot is not available"})
		return
	}
	
	// Create appointment
	appointment := models.Appointment{
		PatientID: userID.(uint),
		DoctorID:  request.DoctorID,
		StartTime: startTime,
		EndTime:   endTime,
		Status:    models.StatusScheduled,
		Reason:    request.Reason,
	}
	
	// Save appointment to database
	if err := ac.DB.Create(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create appointment"})
		return
	}
	
	// Load related entities for notification
	ac.DB.Preload("Patient").Preload("Doctor").First(&appointment, appointment.ID)
	
	// Send appointment confirmation notification
	go ac.NotificationService.SendAppointmentNotification(&appointment, services.NotificationTypeAppointmentConfirmation)
	
	// Return created appointment
	c.JSON(http.StatusCreated, gin.H{
		"appointment": gin.H{
			"id":        appointment.ID,
			"patientId": appointment.PatientID,
			"doctorId":  appointment.DoctorID,
			"startTime": appointment.StartTime,
			"endTime":   appointment.EndTime,
			"status":    appointment.Status,
			"reason":    appointment.Reason,
			"createdAt": appointment.CreatedAt,
		},
	})
}

// GetAppointment retrieves an appointment by ID
func (ac *AppointmentController) GetAppointment(c *gin.Context) {
	// Get appointment ID from URL parameter
	id := c.Param("id")
	appointmentID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid appointment ID"})
		return
	}
	
	// Get authenticated user ID and role from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userRole, _ := c.Get("userRole")
	
	// Find appointment by ID
	var appointment models.Appointment
	if err := ac.DB.Preload("Patient").Preload("Doctor").First(&appointment, appointmentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}
	
	// Check if user is authorized to view this appointment
	if userRole != string(models.RoleAdmin) && 
	   appointment.PatientID != userID.(uint) && 
	   appointment.DoctorID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to view this appointment"})
		return
	}
	
	// Return appointment details
	c.JSON(http.StatusOK, gin.H{
		"appointment": gin.H{
			"id":        appointment.ID,
			"startTime": appointment.StartTime,
			"endTime":   appointment.EndTime,
			"status":    appointment.Status,
			"reason":    appointment.Reason,
			"notes":     appointment.Notes,
			"videoRoomId": appointment.VideoRoomID,
			"createdAt": appointment.CreatedAt,
			"updatedAt": appointment.UpdatedAt,
			"patient": gin.H{
				"id":        appointment.Patient.ID,
				"firstName": appointment.Patient.FirstName,
				"lastName":  appointment.Patient.LastName,
				"email":     appointment.Patient.Email,
			},
			"doctor": gin.H{
				"id":        appointment.Doctor.ID,
				"firstName": appointment.Doctor.FirstName,
				"lastName":  appointment.Doctor.LastName,
				"email":     appointment.Doctor.Email,
			},
		},
	})
}

// UpdateAppointment updates an appointment
func (ac *AppointmentController) UpdateAppointment(c *gin.Context) {
	// Get appointment ID from URL parameter
	id := c.Param("id")
	appointmentID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid appointment ID"})
		return
	}
	
	// Get authenticated user ID and role from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userRole, _ := c.Get("userRole")
	
	// Bind and validate request body
	var request UpdateAppointmentRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Find appointment by ID
	var appointment models.Appointment
	if err := ac.DB.First(&appointment, appointmentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}
	
	// Check if user is authorized to update this appointment
	if userRole != string(models.RoleAdmin) && 
	   appointment.PatientID != userID.(uint) && 
	   appointment.DoctorID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to update this appointment"})
		return
	}
	
	// Update appointment fields if provided
	if request.Status != "" {
		// Validate status
		validStatus := false
		switch models.AppointmentStatus(request.Status) {
		case models.StatusScheduled, models.StatusInProgress, models.StatusCompleted, models.StatusCancelled, models.StatusNoShow:
			validStatus = true
		}
		
		if !validStatus {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
			return
		}
		
		appointment.Status = models.AppointmentStatus(request.Status)
	}
	
	if request.Notes != "" {
		appointment.Notes = request.Notes
	}
	
	if request.RoomID != "" {
		appointment.VideoRoomID = request.RoomID
	}
	
	// Save updated appointment to database
	if err := ac.DB.Save(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update appointment"})
		return
	}
	
	// Load related entities for notification
	ac.DB.Preload("Patient").Preload("Doctor").First(&appointment, appointment.ID)
	
	// Send appropriate notification based on status change
	if request.Status == string(models.StatusCancelled) {
		go ac.NotificationService.SendAppointmentNotification(&appointment, services.NotificationTypeAppointmentCancellation)
	} else if request.Status != "" {
		go ac.NotificationService.SendAppointmentNotification(&appointment, services.NotificationTypeAppointmentUpdate)
	}
	
	// Return updated appointment
	c.JSON(http.StatusOK, gin.H{
		"appointment": gin.H{
			"id":        appointment.ID,
			"patientId": appointment.PatientID,
			"doctorId":  appointment.DoctorID,
			"startTime": appointment.StartTime,
			"endTime":   appointment.EndTime,
			"status":    appointment.Status,
			"reason":    appointment.Reason,
			"notes":     appointment.Notes,
			"videoRoomId": appointment.VideoRoomID,
			"updatedAt": appointment.UpdatedAt,
		},
	})
}

// ListUserAppointments retrieves all appointments for a user
func (ac *AppointmentController) ListUserAppointments(c *gin.Context) {
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userRole, _ := c.Get("userRole")
	
	// Initialize query
	query := ac.DB.Model(&models.Appointment{}).Preload("Patient").Preload("Doctor")
	
	// Filter by user role
	if userRole == string(models.RolePatient) {
		query = query.Where("patient_id = ?", userID)
	} else if userRole == string(models.RoleDoctor) {
		query = query.Where("doctor_id = ?", userID)
	}
	
	// Get query parameters
	status := c.Query("status")
	if status != "" {
		query = query.Where("status = ?", status)
	}
	
	// Order by start time (upcoming first)
	query = query.Order("start_time ASC")
	
	// Execute query
	var appointments []models.Appointment
	if err := query.Find(&appointments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve appointments"})
		return
	}
	
	// Transform to response format
	response := make([]gin.H, len(appointments))
	for i, appt := range appointments {
		response[i] = gin.H{
			"id":        appt.ID,
			"startTime": appt.StartTime,
			"endTime":   appt.EndTime,
			"status":    appt.Status,
			"reason":    appt.Reason,
			"patient": gin.H{
				"id":        appt.Patient.ID,
				"firstName": appt.Patient.FirstName,
				"lastName":  appt.Patient.LastName,
			},
			"doctor": gin.H{
				"id":        appt.Doctor.ID,
				"firstName": appt.Doctor.FirstName,
				"lastName":  appt.Doctor.LastName,
			},
		}
	}
	
	// Return appointments list
	c.JSON(http.StatusOK, gin.H{
		"appointments": response,
	})
}