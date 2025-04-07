package controllers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	
	"github.com/adrianmcmains/telehealth-platform/config"
	"github.com/adrianmcmains/telehealth-platform/middleware"
	"github.com/adrianmcmains/telehealth-platform/models"
)

// LoginRequest represents the login request body
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// RegisterRequest represents the registration request body
type RegisterRequest struct {
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=8"`
	FirstName string `json:"firstName" binding:"required"`
	LastName  string `json:"lastName" binding:"required"`
	Role      string `json:"role"`
}

// AuthController handles authentication related requests
type AuthController struct {
	DB *gorm.DB
}

// NewAuthController creates a new instance of AuthController
func NewAuthController() *AuthController {
	return &AuthController{
		DB: config.DB,
	}
}

// Login handles user login
func (ac *AuthController) Login(c *gin.Context) {
	var request LoginRequest
	
	// Bind and validate request body
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Find user by email
	var user models.User
	if err := ac.DB.Where("email = ?", request.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}
	
	// Check password
	if !user.CheckPassword(request.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}
	
	// Check if 2FA is enabled
	if user.TwoFactorEnabled {
		// Return a challenge response for 2FA
		c.JSON(http.StatusOK, gin.H{
			"requiresTwoFactor": true,
			"userId": user.ID,
		})
		
		// Store the user ID in the context for the 2FA validation
		c.Set("2fa_user_id", user.ID)
		return
	}
	
	// Generate JWT token
	token, err := middleware.GenerateToken(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}
	
	// Return user info and token
	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":        user.ID,
			"email":     user.Email,
			"firstName": user.FirstName,
			"lastName":  user.LastName,
			"role":      user.Role,
			"twoFactorEnabled": user.TwoFactorEnabled,
		},
		"token": token,
	})
}

// Register handles user registration
func (ac *AuthController) Register(c *gin.Context) {
	var request RegisterRequest
	
	// Bind and validate request body
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Check if email already exists
	var existingUser models.User
	if err := ac.DB.Where("email = ?", request.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already in use"})
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	
	// Create new user
	user := models.User{
		Email:     request.Email,
		FirstName: request.FirstName,
		LastName:  request.LastName,
	}
	
	// Set role (default to patient if not specified or invalid)
	if request.Role == string(models.RoleDoctor) {
		user.Role = models.RoleDoctor
	} else if request.Role == string(models.RoleAdmin) {
		user.Role = models.RoleAdmin
	} else {
		user.Role = models.RolePatient
	}
	
	// Hash password
	if err := user.SetPassword(request.Password); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	
	// Save user to database
	if err := ac.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}
	
	// Generate JWT token
	token, err := middleware.GenerateToken(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}
	
	// Return user info and token
	c.JSON(http.StatusCreated, gin.H{
		"user": gin.H{
			"id":        user.ID,
			"email":     user.Email,
			"firstName": user.FirstName,
			"lastName":  user.LastName,
			"role":      user.Role,
			"twoFactorEnabled": user.TwoFactorEnabled,
		},
		"token": token,
	})
}

// GetMe returns the current authenticated user
func (ac *AuthController) GetMe(c *gin.Context) {
	// Get user ID from context (set by AuthMiddleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	
	// Find user by ID
	var user models.User
	if err := ac.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	
	// Return user info
	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":        user.ID,
			"email":     user.Email,
			"firstName": user.FirstName,
			"lastName":  user.LastName,
			"role":      user.Role,
			"phoneNumber": user.PhoneNumber,
			"address":   user.Address,
			"dateOfBirth": user.DateOfBirth,
			"createdAt": user.CreatedAt,
			"twoFactorEnabled": user.TwoFactorEnabled,
		},
	})
}