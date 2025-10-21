package middlewares

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

func AuthMiddleware(expectedKey string) gin.HandlerFunc {

	return func(c *gin.Context) {
		// Handle preflight OPTIONS request
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusOK)
			return
		}

		apiKey := c.GetHeader("X-API-KEY")
		if apiKey == "" || apiKey != expectedKey {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: missing or invalid API key"})
			c.Abort()
			return
		}

		c.Next()
	}
}