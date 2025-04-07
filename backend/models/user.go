package models

import (
	"time"
	"fmt"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserRole string

const (
	RolePatient  UserRole = "patient"
	RoleDoctor   UserRole = "doctor"
	RoleAdmin    UserRole = "admin"
)

type User struct {
	ID                   uint           `gorm:"primaryKey" json:"id"`
	Email                string         `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash         string         `gorm:"not null" json:"-"`
	FirstName            string         `gorm:"not null" json:"firstName"`
	LastName             string         `gorm:"not null" json:"lastName"`
	Role                 UserRole       `gorm:"not null;default:patient" json:"role"`
	DateOfBirth          *time.Time     `json:"dateOfBirth,omitempty"`
	PhoneNumber          string         `json:"phoneNumber,omitempty"`
	Address              string         `json:"address,omitempty"`
	TwoFactorEnabled     bool           `gorm:"default:false" json:"twoFactorEnabled"`
	TwoFactorSecret      string         `gorm:"-" json:"-"`
	TwoFactorSecretEncrypted string     `json:"-"`
	CreatedAt            time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt            time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt            gorm.DeletedAt `gorm:"index" json:"-"`
}

// SetPassword hashes a password for storage
func (u *User) SetPassword(password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.PasswordHash = string(hashedPassword)
	return nil
}

// CheckPassword validates a password against the stored hash
func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password))
	return err == nil
}

// BeforeCreate hook for additional validation or operations
func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	// Validate email is not empty
	if u.Email == "" {
		return fmt.Errorf("email cannot be empty")
	}

	// Validate password hash is not empty
	if u.PasswordHash == "" {
		return fmt.Errorf("password cannot be empty")
	}

	// Validate first and last name
	if u.FirstName == "" || u.LastName == "" {
		return fmt.Errorf("first name and last name are required")
	}

	// Set default role if not specified
	if u.Role == "" {
		u.Role = RolePatient
	}

	// Validate role is one of the allowed values
	switch u.Role {
	case RolePatient, RoleDoctor, RoleAdmin:
		// Valid role
	default:
		return fmt.Errorf("invalid role specified")
	}

	return nil
}