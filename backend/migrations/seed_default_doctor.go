package migrations

import (
	"github.com/adrianmcmains/telehealth-platform/config"
	"github.com/adrianmcmains/telehealth-platform/models"
)

// SeedDefaultDoctor creates a default doctor account if none exists
func SeedDefaultDoctor() error {
	db := config.DB
	
	var count int64
	if err := db.Model(&models.User{}).Where("role = ?", models.RoleDoctor).Count(&count).Error; err != nil {
		return err
	}
	
	// If no doctor exists, create one
	if count == 0 {
		doctor := models.User{
			Email:     "drndaara@gmail.com",
			FirstName: "Dr.",
			LastName:  "Ndaara",
			Role:      models.RoleDoctor,
			PhoneNumber: "+256-773-388-441",
		}
		
		// Set password to "password123" (in production, use a secure password)
		if err := doctor.SetPassword("password123"); err != nil {
			return err
		}
		
		if err := db.Create(&doctor).Error; err != nil {
			return err
		}
	}
	
	return nil
}