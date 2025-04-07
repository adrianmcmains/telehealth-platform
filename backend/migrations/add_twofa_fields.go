package migrations

import (
	"github.com/adrianmcmains/telehealth-platform/config"
	//"gorm.io/gorm"
)

// AddTwoFAFields adds two-factor authentication fields to the users table
func AddTwoFAFields() error {
	db := config.DB

	// Add 2FA fields to the users table
	if err := db.Exec(`
		ALTER TABLE users 
		ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
		ADD COLUMN IF NOT EXISTS two_factor_secret_encrypted TEXT DEFAULT '';
	`).Error; err != nil {
		return err
	}

	return nil
}