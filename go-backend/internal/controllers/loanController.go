package controllers

import (
	"go-backend/internal/models"
	"net/http"
	"time"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"crypto/rand"
	"math/big"
	"fmt"
)

type LoanController struct{
	DB *gorm.DB
}
func generateLoanCode() string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	const length = 6

	code := make([]byte, length)
	for i := range code {
		num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		code[i] = charset[num.Int64()]
	}
	return "LN-" + string(code)
}
func (lc *LoanController) generateUniqueLoanCode() (string, error) {
	for attempts := 0; attempts < 5; attempts++ {
		code := generateLoanCode()

		var count int64
		if err := lc.DB.Model(&models.LoanDetails{}).Where("loan_code = ?", code).Count(&count).Error; err != nil {
			return "", err
		}

		if count == 0 {
			return code, nil // unique code found
		}
	}

	return "", fmt.Errorf("failed to generate unique loan code after multiple attempts")
}


func (lc *LoanController) CreateLoan(c *gin.Context) {
	var input models.LoanDetails

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.ID == uuid.Nil {
		input.ID = uuid.New()
	}

	// Ensure unique LoanCode
	if input.LoanCode == "" {
		code, err := lc.generateUniqueLoanCode()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate unique loan code"})
			return
		}
		input.LoanCode = code
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

	if err := lc.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create loan"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Loan created successfully",
		"loan":    input,
	})
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

		var totalUnpaid int64
	if err := lc.DB.Model(&models.Repayment{}).
		Where("loan_id = ? AND status != ?", repayment.LoanID, "paid").
		Count(&totalUnpaid).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify loan status"})
		return
	}

	// If no unpaid repayments remain → mark loan as fully paid
	if totalUnpaid == 0 {
		var loan models.LoanDetails
		if err := lc.DB.First(&loan, "id = ?", repayment.LoanID).Error; err == nil {
			loan.LoanActive = false
			loan.LoanPaid = true
			if err := lc.DB.Save(&loan).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update loan status"})
				return
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"repayment": repayment,
	})
}

func (lc *LoanController) UpcomingRepayments(c *gin.Context) {
    borrowerId := c.Param("borrowerId")
    if borrowerId == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "borrowerId is required"})
        return
    }

    var repayments []models.Repayment
    if err := lc.DB.
        Where("borrower_id = ? AND status != ?", borrowerId, "paid").
        Order("month_number ASC").
        Find(&repayments).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to fetch repayments",
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "success":    true,
        "repayments": repayments,
    })
}

