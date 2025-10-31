package routes

import (
	"go-backend/internal/controllers"
	"github.com/gin-gonic/gin"
)

func AdminRoutes(router *gin.RouterGroup,ac *controllers.AdminController){
	router.GET("/loans",ac.GetLoanRequests)
	router.PATCH("/loans/:loanId",ac.UpdateLoanStatus)
	router.GET("/loans/:loanId",ac.GetLoanDetails)
	router.GET("/analytics",ac.GetLoansAnalytics)
}