package routes

import (
	"go-backend/internal/controllers"
	"github.com/gin-gonic/gin"
)

func LoanRoutes(router *gin.RouterGroup,lc *controllers.LoanController){
	router.POST("/apply",lc.CreateLoan) /*to create a new loan*/
	router.GET("/get/:borrowerId",lc.GetLoans) /*this api gives all loans for a specific user*/
	router.GET("/repayments/:loanId",lc.GetRepaymentsByLoan) /*this api gives repayments of a specific loan*/
	router.PATCH("/repayments/repay/:repaymentId",lc.UpdateRepaymentStatus) /*this api changes repayment status to paid*/
	router.GET("/all-repayments/:borrowerId",lc.UpcomingRepayments)
}