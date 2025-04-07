package controllers

import (
	"net/http"
	"strconv"
	"fmt"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	
	"github.com/adrianmcmains/telehealth-platform/config"
	"github.com/adrianmcmains/telehealth-platform/models"
	"github.com/adrianmcmains/telehealth-platform/services"
)

// PaymentController handles payment-related requests
type PaymentController struct {
	DB             *gorm.DB
	PaymentService *services.PaymentService
}

// CreatePaymentRequest represents the request to create a payment
type CreatePaymentRequest struct {
	AppointmentID uint                `json:"appointmentId" binding:"required"`
	PaymentDetails models.PaymentDetails `json:"paymentDetails" binding:"required"`
}

// PaymentCallbackRequest represents the payment callback request
type PaymentCallbackRequest struct {
	PaymentID   string `json:"payment_id"`
	Status      string `json:"status"`
	ReferenceID string `json:"reference_id"`
	Amount      string `json:"amount"`
	Currency    string `json:"currency"`
}

// NewPaymentController creates a new payment controller
func NewPaymentController() *PaymentController {
	return &PaymentController{
		DB:             config.DB,
		PaymentService: services.NewPaymentService(),
	}
}

// CreatePayment creates a new payment
func (pc *PaymentController) CreatePayment(c *gin.Context) {
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	
	// Bind and validate request body
	var request CreatePaymentRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Find appointment by ID
	var appointment models.Appointment
	if err := pc.DB.Preload("Patient").Preload("Doctor").First(&appointment, request.AppointmentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}
	
	// Check if user is authorized to pay for this appointment
	if appointment.PatientID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to pay for this appointment"})
		return
	}
	
	// Create payment with Eversend
	paymentResponse, err := pc.PaymentService.CreatePayment(&appointment, &request.PaymentDetails)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create payment: " + err.Error()})
		return
	}
	
	// Create payment record in database
	payment := models.Payment{
		AppointmentID: appointment.ID,
		Amount:        request.PaymentDetails.Amount,
		Status:        string(paymentResponse.Status),
		PaymentID:     paymentResponse.ID,
		PaymentURL:    paymentResponse.PaymentURL,
		PaymentMethod: request.PaymentDetails.PaymentMethod,
	}
	
	if err := pc.DB.Create(&payment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save payment record"})
		return
	}
	
	// Return payment information
	c.JSON(http.StatusCreated, gin.H{
		"payment": gin.H{
			"id":            payment.ID,
			"appointmentId": payment.AppointmentID,
			"amount":        payment.Amount,
			"status":        payment.Status,
			"paymentUrl":    payment.PaymentURL,
			"paymentMethod": payment.PaymentMethod,
			"createdAt":     payment.CreatedAt,
		},
	})
}

// HandlePaymentCallback handles payment callbacks from Eversend
func (pc *PaymentController) HandlePaymentCallback(c *gin.Context) {
	// Bind and validate request body
	var request PaymentCallbackRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Verify payment with Eversend
	paymentResponse, err := pc.PaymentService.VerifyPayment(request.PaymentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify payment: " + err.Error()})
		return
	}
	
	// Extract appointment ID from reference ID (format: "appointment-{id}")
	var appointmentID uint64
	referenceFormat := "appointment-%d"
	_, err = fmt.Sscanf(paymentResponse.Reference, referenceFormat, &appointmentID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid reference format: " + err.Error()})
		return
	}
	
	// Update payment status in database
	var payment models.Payment
	if err := pc.DB.Where("payment_id = ?", request.PaymentID).First(&payment).Error; err != nil {
		// If payment not found by payment_id, try to find by appointment_id
		if err := pc.DB.Where("appointment_id = ?", appointmentID).First(&payment).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
			return
		}
	}
	
	// Update payment status
	payment.Status = string(paymentResponse.Status)
	if err := pc.DB.Save(&payment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update payment status"})
		return
	}
	
	// If payment was completed, update appointment status
	if paymentResponse.Status == services.PaymentStatusCompleted {
		var appointment models.Appointment
		if err := pc.DB.First(&appointment, payment.AppointmentID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
			return
		}
		
		// Update appointment payment status
		appointment.IsPaid = true
		appointment.Price = paymentResponse.Amount
		if err := pc.DB.Save(&appointment).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update appointment payment status"})
			return
		}
	}
	
	// Return success
	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

// GetPayment gets payment information
func (pc *PaymentController) GetPayment(c *gin.Context) {
	// Get payment ID from URL parameter
	id := c.Param("id")
	paymentID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment ID"})
		return
	}
	
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userRole, _ := c.Get("userRole")
	
	// Find payment by ID
	var payment models.Payment
	if err := pc.DB.Preload("Appointment").First(&payment, paymentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}
	
	// Check if user is authorized to view this payment
	if userRole != string(models.RoleAdmin) && 
	   payment.Appointment.PatientID != userID.(uint) && 
	   payment.Appointment.DoctorID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to view this payment"})
		return
	}
	
	// Return payment information
	c.JSON(http.StatusOK, gin.H{
		"payment": gin.H{
			"id":            payment.ID,
			"appointmentId": payment.AppointmentID,
			"amount":        payment.Amount,
			"status":        payment.Status,
			"paymentUrl":    payment.PaymentURL,
			"paymentMethod": payment.PaymentMethod,
			"createdAt":     payment.CreatedAt,
			"updatedAt":     payment.UpdatedAt,
		},
	})
}

// GetPaymentByAppointment gets payment information for an appointment
func (pc *PaymentController) GetPaymentByAppointment(c *gin.Context) {
	// Get appointment ID from URL parameter
	id := c.Param("id")
	appointmentID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid appointment ID"})
		return
	}
	
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userRole, _ := c.Get("userRole")
	
	// Find appointment to check authorization
	var appointment models.Appointment
	if err := pc.DB.First(&appointment, appointmentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}
	
	// Check if user is authorized to view this appointment's payment
	if userRole != string(models.RoleAdmin) && 
	   appointment.PatientID != userID.(uint) && 
	   appointment.DoctorID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to view this payment"})
		return
	}
	
	// Find payment for this appointment
	var payment models.Payment
	if err := pc.DB.Where("appointment_id = ?", appointmentID).First(&payment).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No payment found for this appointment"})
		return
	}
	
	// Return payment information
	c.JSON(http.StatusOK, gin.H{
		"payment": gin.H{
			"id":            payment.ID,
			"appointmentId": payment.AppointmentID,
			"amount":        payment.Amount,
			"status":        payment.Status,
			"paymentUrl":    payment.PaymentURL,
			"paymentMethod": payment.PaymentMethod,
			"createdAt":     payment.CreatedAt,
			"updatedAt":     payment.UpdatedAt,
		},
	})
}

// RefundPayment refunds a payment
func (pc *PaymentController) RefundPayment(c *gin.Context) {
	// Get payment ID from URL parameter
	id := c.Param("id")
	paymentID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment ID"})
		return
	}
	
	// Get authenticated user ID from context
	userRole, exists := c.Get("userRole")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	
	// Only admin and doctors can refund payments
	if userRole != string(models.RoleAdmin) && userRole != string(models.RoleDoctor) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to refund payments"})
		return
	}
	
	// Find payment by ID
	var payment models.Payment
	if err := pc.DB.First(&payment, paymentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}
	
	// Check if payment can be refunded
	if payment.Status != string(services.PaymentStatusCompleted) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only completed payments can be refunded"})
		return
	}
	
	// Refund payment
	err = pc.PaymentService.RefundPayment(payment.PaymentID, "Refunded by provider")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to refund payment: " + err.Error()})
		return
	}
	
	// Update payment status
	payment.Status = string(services.PaymentStatusRefunded)
	if err := pc.DB.Save(&payment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update payment status"})
		return
	}
	
	// Find appointment and update payment status
	var appointment models.Appointment
	if err := pc.DB.First(&appointment, payment.AppointmentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}
	
	// Update appointment payment status
	appointment.IsPaid = false
	if err := pc.DB.Save(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update appointment payment status"})
		return
	}
	
	// Return success
	c.JSON(http.StatusOK, gin.H{
		"payment": gin.H{
			"id":          payment.ID,
			"status":      payment.Status,
			"refundedAt":  payment.UpdatedAt,
		},
	})
}