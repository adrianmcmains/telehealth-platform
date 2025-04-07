package migrations

// RunMigrations runs all database migrations in order
func RunMigrations() error {
	// Run other migrations first...
	
	// Add 2FA fields
	if err := AddTwoFAFields(); err != nil {
		return err
	}

	// Seed default doctor
	if err := SeedDefaultDoctor(); err != nil {
		return err
	}
	
	return nil
}