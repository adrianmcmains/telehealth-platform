package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	
	"github.com/adrianmcmains/telehealth-platform/config"
	"github.com/adrianmcmains/telehealth-platform/middleware"
	"github.com/adrianmcmains/telehealth-platform/models"
	"github.com/adrianmcmains/telehealth-platform/services"
)

// TwoFARequest represents the request to enable/verify 2FA
type TwoFARequest struct {
	Token string `json:"token" binding:"required"`
}

// TwoFAController handles two-factor authentication requests
type TwoFAController struct {
	DB              *gorm.DB
	TwoFactorService *services.TwoFactorService
}

// NewTwoFAController creates a new two-factor authentication controller
func NewTwoFAController() *TwoFAController {
	return &TwoFAController{
		DB:              config.DB,
		TwoFactorService: services.NewTwoFactorService(),
	}
}

// Enable2FA enables two-factor authentication for a user
func (tc *TwoFAController) Enable2FA(c *gin.Context) {
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	
	// Find user by ID
	var user models.User
	if err := tc.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	
	// Generate a new TOTP secret
	secret, err := tc.TwoFactorService.GenerateSecret(user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate 2FA secret"})
		return
	}
	
	// Store the secret temporarily in the session/context
	c.Set("2fa_temp_secret", secret)
	
	// Generate QR code URL
	qrCodeURL, err := tc.TwoFactorService.GenerateQRCode(secret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate QR code"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"secret": secret,
		"qrCodeUrl": qrCodeURL,
	})
}

// Verify2FA verifies a two-factor authentication token and enables 2FA for the user
func (tc *TwoFAController) Verify2FA(c *gin.Context) {
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	
	// Bind and validate request body
	var request TwoFARequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Get the temporary secret from the context
	secret, exists := c.Get("2fa_temp_secret")
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No 2FA secret found. Please generate a new one."})
		return
	}
	
	// Validate the token
	if !tc.TwoFactorService.ValidateToken(request.Token, secret.(string)) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid 2FA token"})
		return
	}
	
	// Find user by ID
	var user models.User
	if err := tc.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	
	// Encrypt the secret for storage
	encryptedSecret, err := tc.TwoFactorService.EncryptSecret(secret.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encrypt 2FA secret"})
		return
	}
	
	// Update user with encrypted secret and enable 2FA
	user.TwoFactorSecretEncrypted = encryptedSecret
	user.TwoFactorEnabled = true
	
	if err := tc.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to enable 2FA"})
		return
	}
	
	// Generate a new JWT token with 2FA enabled
	token, err := middleware.GenerateToken(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}
	
	// Return success
	c.JSON(http.StatusOK, gin.H{
		"message": "Two-factor authentication enabled successfully",
		"token": token,
	})
}

// Validate2FA validates a two-factor authentication token during login
func (tc *TwoFAController) Validate2FA(c *gin.Context) {
	// Bind and validate request body
	var request TwoFARequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Get the user ID from the context
	userID, exists := c.Get("2fa_user_id")
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No user found for 2FA validation"})
		return
	}
	
	// Find user by ID
	var user models.User
	if err := tc.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	
	// Decrypt the secret
	secret, err := tc.TwoFactorService.DecryptSecret(user.TwoFactorSecretEncrypted)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decrypt 2FA secret"})
		return
	}
	
	// Validate the token
	if !tc.TwoFactorService.ValidateToken(request.Token, secret) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid 2FA token"})
		return
	}
	
	// Generate a new JWT token
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

// Disable2FA disables two-factor authentication for a user
func (tc *TwoFAController) Disable2FA(c *gin.Context) {
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	
	// Bind and validate request body
	var request TwoFARequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Find user by ID
	var user models.User
	if err := tc.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	
	// Check if 2FA is enabled
	if !user.TwoFactorEnabled {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Two-factor authentication is not enabled"})
		return
	}
	
	// Decrypt the secret
	secret, err := tc.TwoFactorService.DecryptSecret(user.TwoFactorSecretEncrypted)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decrypt 2FA secret"})
		return
	}
	
	// Validate the token
	if !tc.TwoFactorService.ValidateToken(request.Token, secret) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid 2FA token"})
		return
	}
	
	// Disable 2FA
	user.TwoFactorEnabled = false
	user.TwoFactorSecretEncrypted = ""
	
	if err := tc.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to disable 2FA"})
		return
	}
	
	// Generate a new JWT token
	token, err := middleware.GenerateToken(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}
	
	// Return success
	c.JSON(http.StatusOK, gin.H{
		"message": "Two-factor authentication disabled successfully",
		"token": token,
	})
}