package models

import (
	"time"

	"gorm.io/gorm"
)

// Payment represents a payment for an appointment
type Payment struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	AppointmentID uint          `gorm:"not null" json:"appointmentId"`
	Appointment  Appointment    `gorm:"foreignKey:AppointmentID" json:"appointment"`
	Amount       float64        `gorm:"not null" json:"amount"`
	Status       string         `gorm:"not null" json:"status"`
	PaymentID    string         `gorm:"not null" json:"paymentId"`
	PaymentURL   string         `json:"paymentUrl,omitempty"`
	PaymentMethod string        `gorm:"not null;default:card" json:"paymentMethod"`
	CreatedAt    time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt    time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

// PaymentDetails contains information needed to process a payment
type PaymentDetails struct {
    Amount        float64 `json:"amount"`
    PaymentMethod string  `json:"payment_method"`
    MobileNetwork string  `json:"mobile_network,omitempty"`
}