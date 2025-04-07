package middleware

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	
	//"github.com/adrianmcmains/telehealth-platform/config"
	"github.com/adrianmcmains/telehealth-platform/models"
)

// JWTClaims represents the claims in the JWT
type JWTClaims struct {
	UserID           uint      `json:"userId"`
	Role             string    `json:"role"`
	TwoFactorEnabled bool      `json:"twoFactorEnabled"`
	jwt.RegisteredClaims
}

// GenerateToken creates a new JWT token for a user
func GenerateToken(user *models.User) (string, error) {
	// Token expiration time - 24 hours
	expirationTime := time.Now().Add(24 * time.Hour)
	
	// Create claims with user information
	claims := &JWTClaims{
		UserID: user.ID,
		Role:   string(user.Role),
		TwoFactorEnabled: user.TwoFactorEnabled,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Subject:   fmt.Sprintf("%d", user.ID),
		},
	}
	
	// Create token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	
	// Get JWT secret key from environment
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return "", errors.New("JWT_SECRET is not set")
	}
	
	// Sign and get the complete encoded token
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return "", err
	}
	
	return tokenString, nil
}

// AuthMiddleware verifies the JWT token in the request
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			return
		}
		
		// Check if the header has the Bearer prefix
		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header must be in the format 'Bearer {token}'"})
			return
		}
		
		// Extract the token
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		
		// Parse and validate the token
		token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
			// Validate the signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			
			// Get JWT secret key
			jwtSecret := os.Getenv("JWT_SECRET")
			if jwtSecret == "" {
				return nil, errors.New("JWT_SECRET is not set")
			}
			
			return []byte(jwtSecret), nil
		})
		
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		
		// Check if the token is valid
		if !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}
		
		// Extract claims
		claims, ok := token.Claims.(*JWTClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Failed to parse token claims"})
			return
		}
		
		// Add the user ID and role to the context
		c.Set("userID", claims.UserID)
		c.Set("userRole", claims.Role)
		
		c.Next()
	}
}

// RoleMiddleware checks if the user has the required role
func RoleMiddleware(roles ...models.UserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the user role from context (set by AuthMiddleware)
		userRole, exists := c.Get("userRole")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}
		
		// Check if the user has one of the required roles
		hasRole := false
		for _, role := range roles {
			if userRole == string(role) {
				hasRole = true
				break
			}
		}
		
		if !hasRole {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			return
		}
		
		c.Next()
	}
}