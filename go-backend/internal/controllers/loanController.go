package controllers

import (
	"go-backend/internal/models"
	"net/http"
	"time"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type LoanController struct{
	DB *gorm.DB
}

func (lc *LoanController) CreateLoan(c *gin.Context){
	var input models.LoanDetails

	if err:=c.ShouldBindJSON(&input);err!=nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.ID==uuid.Nil{
		input.ID=uuid.New()
	}

	if input.AppliedDate.IsZero() {
		input.AppliedDate = time.Now()
	}

	if input.LoanStatus == "" {
		input.LoanStatus = "pending"
	}
	if input.BankName == "" {
		input.BankName = "IDFC First Bank"
	}
	if err:=lc.DB.Create(&input).Error;err!=nil{
		c.JSON(http.StatusInternalServerError,gin.H{"error":"Failed to create loan"})
		return
	}
	c.JSON(http.StatusCreated,gin.H{"message":"Loan created successfully","loan":input})

}

func (lc *LoanController) GetLoans(c *gin.Context) {
    borrowerID := c.Param("borrowerId")
    if borrowerID == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "borrowerId is required"})
        return
    }
    var loans []models.LoanDetails
    if err := lc.DB.Where("borrower_id = ?", borrowerID).Find(&loans).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch loans"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"loans": loans})
}

func (lc *LoanController) GetRepaymentsByLoan(c *gin.Context) {
	loanID := c.Param("loanId")
	var repayments []models.Repayment
	if err := lc.DB.Where("loan_id = ?", loanID).Order("month_number asc").Find(&repayments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch repayments",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"repayments":  repayments,
	})
}

func (lc *LoanController) UpdateRepaymentStatus(c *gin.Context) {
	repaymentID := c.Param("repaymentId")

	// Find repayment record
	var repayment models.Repayment
	if err := lc.DB.First(&repayment, "id = ?", repaymentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Repayment not found"})
		return
	}

	// Update repayment status and date
	repayment.Status = "paid"
	now := time.Now()
	repayment.PaidDate = &now

	if err := lc.DB.Save(&repayment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update repayment status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"repayment": repayment,
	})
}

