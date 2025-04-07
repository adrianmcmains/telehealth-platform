package models

import (
	"time"

	"gorm.io/gorm"
)

type AppointmentStatus string

const (
	StatusScheduled  AppointmentStatus = "scheduled"
	StatusInProgress AppointmentStatus = "in-progress"
	StatusCompleted  AppointmentStatus = "completed"
	StatusCancelled  AppointmentStatus = "cancelled"
	StatusNoShow     AppointmentStatus = "no-show"
)

type Appointment struct {
	ID           uint              `gorm:"primaryKey" json:"id"`
	PatientID    uint              `gorm:"not null" json:"patientId"`
	Patient      User              `gorm:"foreignKey:PatientID" json:"patient"`
	DoctorID     uint              `gorm:"not null" json:"doctorId"`
	Doctor       User              `gorm:"foreignKey:DoctorID" json:"doctor"`
	StartTime    time.Time         `gorm:"not null" json:"startTime"`
	EndTime      time.Time         `gorm:"not null" json:"endTime"`
	Status       AppointmentStatus `gorm:"not null;default:scheduled" json:"status"`
	Reason       string            `gorm:"size:500" json:"reason"`
	Notes        string            `gorm:"size:1000" json:"notes,omitempty"`
	VideoRoomID  string            `json:"videoRoomId,omitempty"`
	IsPaid       bool              `gorm:"default:false" json:"isPaid"`
	Price        float64           `gorm:"default:0" json:"price"`
	CreatedAt    time.Time         `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt    time.Time         `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt    gorm.DeletedAt    `gorm:"index" json:"-"`
}

// BeforeCreate hook for additional validation or operations
func (a *Appointment) BeforeCreate(tx *gorm.DB) (err error) {
	// Ensure start time is before end time
	if a.StartTime.After(a.EndTime) {
		return gorm.ErrInvalidData
	}
	return nil
}

// Duration returns the appointment duration in minutes
func (a *Appointment) Duration() int {
	return int(a.EndTime.Sub(a.StartTime).Minutes())
}