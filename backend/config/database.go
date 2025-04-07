package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	
	"github.com/adrianmcmains/telehealth-platform/models"
)

var DB *gorm.DB

// InitDB initializes the database connection
func InitDB() *gorm.DB {
	var err error
	
	// Load environment variables
	if os.Getenv("GO_ENV") != "production" {
		err = godotenv.Load()
		if err != nil {
			log.Println("Warning: .env file not found")
		}
	}
	
	// Database connection parameters
	host := os.Getenv("DB_HOST")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	port := os.Getenv("DB_PORT")
	
	// Construct connection string
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC", 
		host, user, password, dbname, port)
	
	// Set up logger configuration
	logConfig := logger.Config{
		SlowThreshold: 200, // milliseconds
		LogLevel:      logger.Info,
		Colorful:      true,
	}
	
	// Connect to the database
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.New(
			log.New(os.Stdout, "\r\n", log.LstdFlags),
			logConfig,
		),
	})
	
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	
	log.Println("Connected to database successfully")
	
	// Auto-migrate the models
	err = DB.AutoMigrate(
		&models.User{},
		&models.Appointment{},
		&models.Payment{},
		// Add other models as needed
	)
	
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
	
	return DB
}