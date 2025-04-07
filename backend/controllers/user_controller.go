package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	
	"github.com/adrianmcmains/telehealth-platform/config"
	"github.com/adrianmcmains/telehealth-platform/models"
)

// UpdateUserRequest represents the update user request body
type UpdateUserRequest struct {
	FirstName   string     `json:"firstName"`
	LastName    string     `json:"lastName"`
	PhoneNumber string     `json:"phoneNumber"`
	Address     string     `json:"address"`
	DateOfBirth *string    `json:"dateOfBirth"`
}

// UserController handles user-related requests
type UserController struct {
	DB *gorm.DB
}

// NewUserController creates a new instance of UserController
func NewUserController() *UserController {
	return &UserController{
		DB: config.DB,
	}
}

// GetUser retrieves a user by ID
func (uc *UserController) GetUser(c *gin.Context) {
	// Get user ID from URL parameter
	id := c.Param("id")
	userID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}
	
	// Find user by ID
	var user models.User
	if err := uc.DB.First(&user, userID).Error; err != nil {
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
		},
	})
}

// UpdateUser updates a user's profile
func (uc *UserController) UpdateUser(c *gin.Context) {
	// Get user ID from URL parameter
	id := c.Param("id")
	userID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}
	
	// Get authenticated user ID from context
	authUserID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	
	// Get authenticated user role from context
	userRole, _ := c.Get("userRole")
	
	// Check if user is updating their own profile or is an admin
	if uint(authUserID.(uint)) != uint(userID) && userRole != string(models.RoleAdmin) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only update your own profile"})
		return
	}
	
	// Bind and validate request body
	var request UpdateUserRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Find user by ID
	var user models.User
	if err := uc.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	
	// Update user fields if provided
	if request.FirstName != "" {
		user.FirstName = request.FirstName
	}
	if request.LastName != "" {
		user.LastName = request.LastName
	}
	if request.PhoneNumber != "" {
		user.PhoneNumber = request.PhoneNumber
	}
	if request.Address != "" {
		user.Address = request.Address
	}
	
	// Save updated user to database
	if err := uc.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}
	
	// Return updated user info
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
			"updatedAt": user.UpdatedAt,
		},
	})
}

/**  // ListDoctors retrieves all doctors
func (uc *UserController) ListDoctors(c *gin.Context) {
	var doctors []models.User
	
	// Find all users with role 'doctor'
	if err := uc.DB.Where("role = ?", models.RoleDoctor).Find(&doctors).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve doctors"})
		return
	}
	
	// Transform to response format
	response := make([]gin.H, len(doctors))
	for i, doctor := range doctors {
		response[i] = gin.H{
			"id":        doctor.ID,
			"firstName": doctor.FirstName,
			"lastName":  doctor.LastName,
			"email":     doctor.Email,
			"phoneNumber": doctor.PhoneNumber,
		}
	}
	
	// Return doctors list
	c.JSON(http.StatusOK, gin.H{
		"doctors": response,
	})
}**/

// ListDoctors retrieves the default doctor
func (uc *UserController) ListDoctors(c *gin.Context) {
	var doctor models.User
	
	// Find the default doctor
	if err := uc.DB.Where("role = ?", models.RoleDoctor).First(&doctor).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve doctor"})
		return
	}
	
	// Return doctor info
	c.JSON(http.StatusOK, gin.H{
		"doctors": []gin.H{
			{
				"id":        doctor.ID,
				"firstName": doctor.FirstName,
				"lastName":  doctor.LastName,
				"email":     doctor.Email,
				"phoneNumber": doctor.PhoneNumber,
			},
		},
	})
}