package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	
	"github.com/adrianmcmains/telehealth-platform/config"
	"github.com/adrianmcmains/telehealth-platform/migrations"
	"github.com/adrianmcmains/telehealth-platform/routes"
	"github.com/adrianmcmains/telehealth-platform/services"
)

func main() {
	// Set Gin mode based on environment
	if os.Getenv("GO_ENV") == "production" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}
	
	// Initialize database
	config.InitDB()

	// Run migrations
	if err := migrations.RunMigrations(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

		
	// Initialize and start cron service for scheduled tasks
	cronService := services.NewCronService()
	cronService.Start()
	defer cronService.Stop()
	
	// Create Gin router
	r := gin.Default()
	
	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})
	
	// Health check route
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "healthy",
			"service": "telehealth-platform-backend",
		})
	})
	
	// Setup all routes
	routes.SetupRoutes(r)
	
	// Get server port from environment variable or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	// Start the server
	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}