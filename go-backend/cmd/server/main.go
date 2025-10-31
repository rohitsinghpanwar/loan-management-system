package main

import (
	"go-backend/internal/controllers"
	"go-backend/internal/db"
	"go-backend/internal/middlewares"
	"go-backend/internal/models"
	"go-backend/internal/routes"
	"log"
	"net/http"
	"os"
	"time"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// Configure CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-API-KEY"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	//Dependency Middleware injected in request

	_ = godotenv.Load()
	userKey := os.Getenv("USER_SECRET_KEY")
	adminKey:=os.Getenv("ADMIN_SECRET_KEY")
	//Dependency loaded from env

	database := db.ConnectPostDB()
	err := database.AutoMigrate(&models.LoanDetails{},&models.Repayment{})
	if err != nil {
		log.Fatal("Failed to migrate database", err)
	}
	log.Println("Loan Details table migrated successfully")
	//DB instance is a shared dependency among controllers

	router.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Server is up and running like Tom Cruise",
		})
	})

	loanController := &controllers.LoanController{DB: database} /*Here we are assigning the DB variable of struct using struct literal*/
	borrowerGroup := router.Group("/loans")
	borrowerGroup.Use(middlewares.AuthMiddleware(userKey))
	routes.LoanRoutes(borrowerGroup, loanController)

	adminController := &controllers.AdminController{DB: database}
	adminGroup := router.Group("/admin")
	adminGroup.Use(middlewares.AuthMiddleware(adminKey))
	routes.AdminRoutes(adminGroup,adminController)
	// Each controllers will have shared DB Dependency they will not create their own connections rather they will use one single connection
	router.Run(":4000")
}