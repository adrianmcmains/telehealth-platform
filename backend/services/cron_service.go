package services

import (
	"log"
	//"time"

	"github.com/robfig/cron/v3"
	"gorm.io/gorm"
)

// CronService handles scheduled tasks
type CronService struct {
	cron *cron.Cron
	notificationService *NotificationService
}

// NewCronService creates a new cron service
func NewCronService() *CronService {
	c := cron.New(cron.WithSeconds())
	notificationService := NewNotificationService(&gorm.DB{})
	
	return &CronService{
		cron: c,
		notificationService: notificationService,
	}
}

// Start starts the cron service
func (cs *CronService) Start() {
	// Schedule appointment reminders to run daily at 9:00 AM
	_, err := cs.cron.AddFunc("0 0 9 * * *", func() {
		log.Println("Running scheduled appointment reminders")
		err := cs.notificationService.SendAppointmentReminders()
		if err != nil {
			log.Printf("Error sending appointment reminders: %v", err)
		}
	})
	
	if err != nil {
		log.Printf("Error scheduling appointment reminders: %v", err)
	}
	
	// Add more scheduled tasks here as needed
	
	cs.cron.Start()
	log.Println("Cron service started")
}

// Stop stops the cron service
func (cs *CronService) Stop() {
	ctx := cs.cron.Stop()
	<-ctx.Done()
	log.Println("Cron service stopped")
}