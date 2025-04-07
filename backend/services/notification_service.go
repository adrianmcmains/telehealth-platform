package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/adrianmcmains/telehealth-platform/models"
	"gopkg.in/gomail.v2"
	"gorm.io/gorm"
)

// NotificationType defines the type of notification
type NotificationType string

const (
	// NotificationTypeAppointmentReminder represents an appointment reminder notification
	NotificationTypeAppointmentReminder NotificationType = "appointment_reminder"
	
	// NotificationTypeAppointmentConfirmation represents an appointment confirmation notification
	NotificationTypeAppointmentConfirmation NotificationType = "appointment_confirmation"
	
	// NotificationTypeAppointmentCancellation represents an appointment cancellation notification
	NotificationTypeAppointmentCancellation NotificationType = "appointment_cancellation"
	
	// NotificationTypeAppointmentUpdate represents an appointment update notification
	NotificationTypeAppointmentUpdate NotificationType = "appointment_update"
)

// NotificationService handles sending notifications to users
type NotificationService struct {
	EmailEnabled bool
	SMSEnabled   bool
	EmailConfig  EmailConfig
	SMSConfig    SMSConfig
	DB           *gorm.DB
}

// EmailConfig contains email configuration
type EmailConfig struct {
	SMTPHost     string
	SMTPPort     int
	SMTPUsername string
	SMTPPassword string
	FromEmail    string
	FromName     string
}

// SMSConfig contains SMS configuration
type SMSConfig struct {
	TwilioAccountSID string
	TwilioAuthToken  string
	TwilioFromNumber string
	TwilioURL        string
}

func NewNotificationService(db *gorm.DB) *NotificationService {
	emailEnabled := os.Getenv("EMAIL_ENABLED") == "true"
	smsEnabled := os.Getenv("SMS_ENABLED") == "true"
	
	emailConfig := EmailConfig{
		SMTPHost:     os.Getenv("SMTP_HOST"),
		SMTPPort:     587, // Default port
		SMTPUsername: os.Getenv("SMTP_USERNAME"),
		SMTPPassword: os.Getenv("SMTP_PASSWORD"),
		FromEmail:    os.Getenv("FROM_EMAIL"),
		FromName:     os.Getenv("FROM_NAME"),
	}
	
	smsConfig := SMSConfig{
		TwilioAccountSID: os.Getenv("TWILIO_ACCOUNT_SID"),
		TwilioAuthToken:  os.Getenv("TWILIO_AUTH_TOKEN"),
		TwilioFromNumber: os.Getenv("TWILIO_FROM_NUMBER"),
		TwilioURL:        "https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json",
	}
	return &NotificationService{
		EmailEnabled: emailEnabled,
		SMSEnabled:   smsEnabled,
		EmailConfig:  emailConfig,
		SMSConfig:    smsConfig,
		DB:           db,
	}
}

// SendAppointmentNotification sends a notification about an appointment
func (ns *NotificationService) SendAppointmentNotification(appointment *models.Appointment, notificationType NotificationType) error {
	// Get user and doctor information
	var patient models.User = appointment.Patient
	var doctor models.User = appointment.Doctor
	
	// Prepare notification data
	data := map[string]interface{}{
		"PatientName":    fmt.Sprintf("%s %s", patient.FirstName, patient.LastName),
		"DoctorName":     fmt.Sprintf("Dr. %s %s", doctor.FirstName, doctor.LastName),
		"AppointmentID":  appointment.ID,
		"AppointmentDate": appointment.StartTime.Format("Monday, January 2, 2006"),
		"StartTime":      appointment.StartTime.Format("3:04 PM"),
		"EndTime":        appointment.EndTime.Format("3:04 PM"),
		"Status":         appointment.Status,
		"Reason":         appointment.Reason,
		"VideoLink":      fmt.Sprintf("https://yourtelehealth.com/appointments/%d/video", appointment.ID),
	}
	
	// Send notifications based on type
	var err error
	switch notificationType {
	case NotificationTypeAppointmentConfirmation:
		// Send to patient
		if ns.EmailEnabled {
			err = ns.sendEmail(patient.Email, "Your Appointment Confirmation", "appointment_confirmation", data)
			if err != nil {
				log.Printf("Failed to send confirmation email to patient: %v", err)
			}
		}
		
		if ns.SMSEnabled && patient.PhoneNumber != "" {
			err = ns.sendSMS(patient.PhoneNumber, fmt.Sprintf(
				"Your appointment with Dr. %s %s has been confirmed for %s at %s. Visit yourtelehealth.com for details.",
				doctor.FirstName, doctor.LastName, 
				appointment.StartTime.Format("Jan 2"),
				appointment.StartTime.Format("3:04 PM"),
			))
			if err != nil {
				log.Printf("Failed to send confirmation SMS to patient: %v", err)
			}
		}
		
		// Send to doctor
		if ns.EmailEnabled {
			err = ns.sendEmail(doctor.Email, "New Appointment Scheduled", "appointment_confirmation_doctor", data)
			if err != nil {
				log.Printf("Failed to send confirmation email to doctor: %v", err)
			}
		}
		
	case NotificationTypeAppointmentReminder:
		// Send to patient
		if ns.EmailEnabled {
			err = ns.sendEmail(patient.Email, "Upcoming Appointment Reminder", "appointment_reminder", data)
			if err != nil {
				log.Printf("Failed to send reminder email to patient: %v", err)
			}
		}
		
		if ns.SMSEnabled && patient.PhoneNumber != "" {
			err = ns.sendSMS(patient.PhoneNumber, fmt.Sprintf(
				"Reminder: Your appointment with Dr. %s %s is tomorrow at %s. Visit yourtelehealth.com to join the video call.",
				doctor.FirstName, doctor.LastName, 
				appointment.StartTime.Format("3:04 PM"),
			))
			if err != nil {
				log.Printf("Failed to send reminder SMS to patient: %v", err)
			}
		}
		
		// Send to doctor
		if ns.EmailEnabled {
			err = ns.sendEmail(doctor.Email, "Upcoming Appointment Reminder", "appointment_reminder_doctor", data)
			if err != nil {
				log.Printf("Failed to send reminder email to doctor: %v", err)
			}
		}
		
	case NotificationTypeAppointmentCancellation:
		// Send to patient
		if ns.EmailEnabled {
			err = ns.sendEmail(patient.Email, "Appointment Cancelled", "appointment_cancellation", data)
			if err != nil {
				log.Printf("Failed to send cancellation email to patient: %v", err)
			}
		}
		
		if ns.SMSEnabled && patient.PhoneNumber != "" {
			err = ns.sendSMS(patient.PhoneNumber, fmt.Sprintf(
				"Your appointment with Dr. %s %s on %s at %s has been cancelled.",
				doctor.FirstName, doctor.LastName, 
				appointment.StartTime.Format("Jan 2"),
				appointment.StartTime.Format("3:04 PM"),
			))
			if err != nil {
				log.Printf("Failed to send cancellation SMS to patient: %v", err)
			}
		}
		
		// Send to doctor
		if ns.EmailEnabled {
			err = ns.sendEmail(doctor.Email, "Appointment Cancelled", "appointment_cancellation_doctor", data)
			if err != nil {
				log.Printf("Failed to send cancellation email to doctor: %v", err)
			}
		}
		
	case NotificationTypeAppointmentUpdate:
		// Send to patient
		if ns.EmailEnabled {
			err = ns.sendEmail(patient.Email, "Appointment Updated", "appointment_update", data)
			if err != nil {
				log.Printf("Failed to send update email to patient: %v", err)
			}
		}
		
		if ns.SMSEnabled && patient.PhoneNumber != "" {
			err = ns.sendSMS(patient.PhoneNumber, fmt.Sprintf(
				"Your appointment with Dr. %s %s has been updated. Please check yourtelehealth.com for details.",
				doctor.FirstName, doctor.LastName,
			))
			if err != nil {
				log.Printf("Failed to send update SMS to patient: %v", err)
			}
		}
		
		// Send to doctor
		if ns.EmailEnabled {
			err = ns.sendEmail(doctor.Email, "Appointment Updated", "appointment_update_doctor", data)
			if err != nil {
				log.Printf("Failed to send update email to doctor: %v", err)
			}
		}
	}
	
	return nil
}

// SendAppointmentReminders sends reminders for appointments that are coming up
func (ns *NotificationService) SendAppointmentReminders() error {
	// Get appointments that are happening tomorrow
	tomorrow := time.Now().Add(24 * time.Hour)
	tomorrowStart := time.Date(tomorrow.Year(), tomorrow.Month(), tomorrow.Day(), 0, 0, 0, 0, tomorrow.Location())
	tomorrowEnd := time.Date(tomorrow.Year(), tomorrow.Month(), tomorrow.Day(), 23, 59, 59, 0, tomorrow.Location())
	
	var appointments []models.Appointment
	// Query appointments scheduled for tomorrow that haven't been cancelled
	err := ns.DB.Where("start_time BETWEEN ? AND ? AND status = ?", 
		tomorrowStart, tomorrowEnd, models.StatusScheduled).
		Preload("Patient").Preload("Doctor").
		Find(&appointments).Error
	
	if err != nil {
		return fmt.Errorf("failed to fetch appointments for reminders: %w", err)
	}
	
	// Send reminders for each appointment
	for _, appointment := range appointments {
		err := ns.SendAppointmentNotification(&appointment, NotificationTypeAppointmentReminder)
		if err != nil {
			log.Printf("Failed to send reminder for appointment %d: %v", appointment.ID, err)
		}
	}
	
	return nil
}

// sendEmail sends an email using a template
func (ns *NotificationService) sendEmail(to, subject, templateName string, data map[string]interface{}) error {
	if !ns.EmailEnabled {
		return nil
	}
	
	// Get email template
	templatePath := fmt.Sprintf("templates/emails/%s.html", templateName)
	tmpl, err := template.ParseFiles(templatePath)
	if err != nil {
		return fmt.Errorf("failed to parse email template: %w", err)
	}
	
	// Render template
	var body bytes.Buffer
	if err := tmpl.Execute(&body, data); err != nil {
		return fmt.Errorf("failed to execute email template: %w", err)
	}
	
	// Create email message
	m := gomail.NewMessage()
	m.SetHeader("From", fmt.Sprintf("%s <%s>", ns.EmailConfig.FromName, ns.EmailConfig.FromEmail))
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", body.String())
	
	// Create SMTP dialer
	d := gomail.NewDialer(
		ns.EmailConfig.SMTPHost,
		ns.EmailConfig.SMTPPort,
		ns.EmailConfig.SMTPUsername,
		ns.EmailConfig.SMTPPassword,
	)
	
	// Send email
	if err := d.DialAndSend(m); err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}
	
	return nil
}

// sendSMS sends an SMS using Twilio
func (ns *NotificationService) sendSMS(to, message string) error {
	if !ns.SMSEnabled {
		return nil
	}
	
	// Format URL
	url := fmt.Sprintf(ns.SMSConfig.TwilioURL, ns.SMSConfig.TwilioAccountSID)
	
	// Prepare form data
	formData := map[string]string{
		"From": ns.SMSConfig.TwilioFromNumber,
		"To":   to,
		"Body": message,
	}
	
	// Create request body
	jsonData, err := json.Marshal(formData)
	if err != nil {
		return fmt.Errorf("failed to marshal form data: %w", err)
	}
	
	// Create HTTP request
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	
	// Set headers
	req.SetBasicAuth(ns.SMSConfig.TwilioAccountSID, ns.SMSConfig.TwilioAuthToken)
	req.Header.Set("Content-Type", "application/json")
	
	// Send request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send SMS: %w", err)
	}
	defer resp.Body.Close()
	
	// Check response
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("twilio API responded with status code %d", resp.StatusCode)
	}
	
	return nil
}