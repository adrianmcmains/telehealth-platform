package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	//"log"
	"net/http"
	"os"
	"time"

	"github.com/adrianmcmains/telehealth-platform/models"
)

// PaymentService handles payment processing using Eversend
type PaymentService struct {
	Enabled     bool
	APIKey      string
	APIEndpoint string
}

// PaymentStatus represents the status of a payment
type PaymentStatus string

const (
	// PaymentStatusPending means the payment is pending
	PaymentStatusPending PaymentStatus = "pending"
	
	// PaymentStatusCompleted means the payment was completed successfully
	PaymentStatusCompleted PaymentStatus = "completed"
	
	// PaymentStatusFailed means the payment failed
	PaymentStatusFailed PaymentStatus = "failed"
	
	// PaymentStatusRefunded means the payment was refunded
	PaymentStatusRefunded PaymentStatus = "refunded"
)

// PaymentMethod represents the available payment methods
type PaymentMethod string

const (
	// PaymentMethodCard for card payments
	PaymentMethodCard PaymentMethod = "card"
	
	// PaymentMethodMobileMoney for mobile money payments
	PaymentMethodMobileMoney PaymentMethod = "mobile_money"
)

// PaymentRequest represents a request to create a payment
type PaymentRequest struct {
	Amount           float64       `json:"amount"`
	Currency         string        `json:"currency"`
	CustomerEmail    string        `json:"customer_email"`
	CustomerName     string        `json:"customer_name"`
	CustomerPhone    string        `json:"customer_phone,omitempty"`
	Description      string        `json:"description"`
	PaymentMethod    PaymentMethod `json:"payment_method"`
	MobileNetwork    string        `json:"mobile_network,omitempty"` // For mobile money
	RedirectURL      string        `json:"redirect_url"`
	ReferenceID      string        `json:"reference_id"`
	CallbackURL      string        `json:"callback_url"`
}

// PaymentResponse represents a response from the Eversend API
type PaymentResponse struct {
	ID          string        `json:"id"`
	Status      PaymentStatus `json:"status"`
	PaymentURL  string        `json:"payment_url"`
	Amount      float64       `json:"amount"`
	Currency    string        `json:"currency"`
	CreatedAt   time.Time     `json:"created_at"`
	Reference   string        `json:"reference_id"`
	Description string        `json:"description"`
}

// NewPaymentService creates a new payment service
func NewPaymentService() *PaymentService {
	return &PaymentService{
		Enabled:     os.Getenv("PAYMENT_ENABLED") == "true",
		APIKey:      os.Getenv("EVERSEND_API_KEY"),
		APIEndpoint: os.Getenv("EVERSEND_API_ENDPOINT"),
	}
}

// CreatePayment creates a new payment for an appointment
func (ps *PaymentService) CreatePayment(appointment *models.Appointment, paymentDetails *models.PaymentDetails) (*PaymentResponse, error) {
	if !ps.Enabled {
		return nil, fmt.Errorf("payment service is not enabled")
	}
	
	if ps.APIKey == "" {
		return nil, fmt.Errorf("Eversend API key is not set")
	}
	
	// Get patient and doctor information
	patient := appointment.Patient
	doctor := appointment.Doctor
	
	// Determine payment method
	paymentMethod := PaymentMethodCard
	if paymentDetails.PaymentMethod == "mobile_money" {
		paymentMethod = PaymentMethodMobileMoney
	}
	
	// Create payment request
	paymentRequest := PaymentRequest{
		Amount:        paymentDetails.Amount,
		Currency:      "USD", // Or use dynamic currency
		CustomerEmail: patient.Email,
		CustomerName:  fmt.Sprintf("%s %s", patient.FirstName, patient.LastName),
		CustomerPhone: patient.PhoneNumber, // Used for mobile money
		Description:   fmt.Sprintf("Telehealth consultation with Dr. %s %s on %s", 
			doctor.FirstName, doctor.LastName, 
			appointment.StartTime.Format("Jan 2, 2006 at 3:04 PM")),
		PaymentMethod: paymentMethod,
		MobileNetwork: paymentDetails.MobileNetwork, // For mobile money
		RedirectURL:   fmt.Sprintf("%s/appointments/%d/payment-success", 
			os.Getenv("FRONTEND_URL"), appointment.ID),
		ReferenceID:  fmt.Sprintf("appointment-%d", appointment.ID),
		CallbackURL:  fmt.Sprintf("%s/api/v1/payments/callback", 
			os.Getenv("BACKEND_URL")),
	}
	
	// Convert request to JSON
	jsonData, err := json.Marshal(paymentRequest)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal payment request: %w", err)
	}
	
	// Create HTTP request
	req, err := http.NewRequest("POST", ps.APIEndpoint+"/v1/payments", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create payment request: %w", err)
	}
	
	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+ps.APIKey)
	
	// Send request
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send payment request: %w", err)
	}
	defer resp.Body.Close()
	
	// Check response
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("payment API responded with status code %d", resp.StatusCode)
	}
	
	// Parse response
	var paymentResponse PaymentResponse
	if err := json.NewDecoder(resp.Body).Decode(&paymentResponse); err != nil {
		return nil, fmt.Errorf("failed to parse payment response: %w", err)
	}
	
	return &paymentResponse, nil
}

// VerifyPayment verifies a payment callback
func (ps *PaymentService) VerifyPayment(paymentID string) (*PaymentResponse, error) {
	if !ps.Enabled {
		return nil, fmt.Errorf("payment service is not enabled")
	}
	
	if ps.APIKey == "" {
		return nil, fmt.Errorf("Eversend API key is not set")
	}
	
	// Create HTTP request
	req, err := http.NewRequest("GET", ps.APIEndpoint+"/v1/payments/"+paymentID, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create payment verification request: %w", err)
	}
	
	// Set headers
	req.Header.Set("Authorization", "Bearer "+ps.APIKey)
	
	// Send request
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send payment verification request: %w", err)
	}
	defer resp.Body.Close()
	
	// Check response
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("payment API responded with status code %d", resp.StatusCode)
	}
	
	// Parse response
	var paymentResponse PaymentResponse
	if err := json.NewDecoder(resp.Body).Decode(&paymentResponse); err != nil {
		return nil, fmt.Errorf("failed to parse payment verification response: %w", err)
	}
	
	return &paymentResponse, nil
}

// RefundPayment refunds a payment
func (ps *PaymentService) RefundPayment(paymentID string, reason string) error {
	if !ps.Enabled {
		return fmt.Errorf("payment service is not enabled")
	}
	
	if ps.APIKey == "" {
		return fmt.Errorf("Eversend API key is not set")
	}
	
	// Create refund request
	refundRequest := map[string]string{
		"reason": reason,
	}
	
	// Convert request to JSON
	jsonData, err := json.Marshal(refundRequest)
	if err != nil {
		return fmt.Errorf("failed to marshal refund request: %w", err)
	}
	
	// Create HTTP request
	req, err := http.NewRequest("POST", ps.APIEndpoint+"/v1/payments/"+paymentID+"/refund", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create refund request: %w", err)
	}
	
	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+ps.APIKey)
	
	// Send request
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send refund request: %w", err)
	}
	defer resp.Body.Close()
	
	// Check response
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusAccepted {
		return fmt.Errorf("payment API responded with status code %d", resp.StatusCode)
	}
	
	return nil
}