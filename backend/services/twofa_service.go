package services

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/pquerna/otp"
	"github.com/pquerna/otp/totp"
)

// TwoFactorService handles two-factor authentication
type TwoFactorService struct {
	EncryptionKey []byte
}

// NewTwoFactorService creates a new two-factor authentication service
func NewTwoFactorService() *TwoFactorService {
	// Load encryption key from environment
	key := os.Getenv("ENCRYPTION_KEY")
	if key == "" {
		// For development only, log a warning
		log.Println("WARNING: No encryption key provided. Using insecure default key. DO NOT USE IN PRODUCTION.")
		
		// This should be a 32-byte key for AES-256
		key = "0123456789abcdef0123456789abcdef"
	}
	
	if len(key) != 32 {
		log.Printf("WARNING: Encryption key must be exactly 32 bytes (currently %d bytes)", len(key))
	}
	
	return &TwoFactorService{
		EncryptionKey: []byte(key),
	}
}

// GenerateSecret generates a new TOTP secret
func (tfs *TwoFactorService) GenerateSecret(username string) (string, error) {
	// Generate a new TOTP key
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "Telehealth Platform",
		AccountName: username,
	})
	
	if err != nil {
		return "", fmt.Errorf("failed to generate TOTP key: %w", err)
	}
	
	return key.Secret(), nil
}

// GenerateQRCode generates a QR code URL from a TOTP secret
func (tfs *TwoFactorService) GenerateQRCode(secret string) (string, error) {
    return fmt.Sprintf("otpauth://totp/TelehealthApp:%s?secret=%s&issuer=TelehealthApp", 
        url.QueryEscape("user"), url.QueryEscape(secret)), nil
}

// ValidateToken validates a TOTP token
func (tfs *TwoFactorService) ValidateToken(token, secret string) bool {
	// Validate the token with default 30-second window
	return totp.Validate(token, secret)
}

// ValidateTokenWithOptions validates a TOTP token with custom options
func (tfs *TwoFactorService) ValidateTokenWithOptions(token, secret string, window int) bool {
	// Validate the token with custom options
	valid, err := totp.ValidateCustom(
		token,
		secret,
		time.Now(),
		totp.ValidateOpts{
			Period:    30, // Default period is 30 seconds
			Skew:      uint(window),
			Digits:    6,  // Default digits is 6
			Algorithm: otp.AlgorithmSHA1, // Default algorithm
		},
	)
	
	// Log error if validation failed
	if err != nil {
		log.Printf("Error validating TOTP token: %v", err)
		return false
	}
	
	return valid
}

// EncryptSecret encrypts a TOTP secret for storage
func (tfs *TwoFactorService) EncryptSecret(secret string) (string, error) {
	// Create a new AES cipher block
	block, err := aes.NewCipher(tfs.EncryptionKey)
	if err != nil {
		return "", fmt.Errorf("failed to create cipher block: %w", err)
	}
	
	// Remove spaces and line breaks from the secret
	secret = strings.TrimSpace(secret)
	plaintext := []byte(secret)
	
	// Create GCM cipher
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to create GCM: %w", err)
	}
	
	// Create a nonce
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", fmt.Errorf("failed to create nonce: %w", err)
	}
	
	// Encrypt the data - GCM doesn't need padding
	ciphertext := gcm.Seal(nonce, nonce, plaintext, nil)
	
	// Encode as base64
	encoded := base64.StdEncoding.EncodeToString(ciphertext)
	
	return encoded, nil
}

// DecryptSecret decrypts a TOTP secret from storage
func (tfs *TwoFactorService) DecryptSecret(encrypted string) (string, error) {
	// Decode base64
	ciphertext, err := base64.StdEncoding.DecodeString(encrypted)
	if err != nil {
		return "", fmt.Errorf("failed to decode base64: %w", err)
	}
	
	// Create a new AES cipher block
	block, err := aes.NewCipher(tfs.EncryptionKey)
	if err != nil {
		return "", fmt.Errorf("failed to create cipher block: %w", err)
	}
	
	// Create GCM cipher
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to create GCM: %w", err)
	}
	
	// Extract nonce from ciphertext
	nonceSize := gcm.NonceSize()
	if len(ciphertext) < nonceSize {
		return "", fmt.Errorf("ciphertext too short")
	}
	
	nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]
	
	// Decrypt the data
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", fmt.Errorf("failed to decrypt: %w", err)
	}
	
	return string(plaintext), nil
}