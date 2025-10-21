package controllers

import (
	"go-backend/internal/models"
	"log"
	"net/http"
	"time"
    "math"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AdminController struct{
	DB *gorm.DB
}

func (lc *AdminController) GetLoanRequests(c *gin.Context) {
	var loans []models.LoanDetails

	if err := lc.DB.Find(&loans).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch loans",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"loans":    loans,
	})
}

// UpdateLoanStatus handles approve/reject of a loan
func (ac *AdminController) UpdateLoanStatus(c *gin.Context) {
    // Get loan ID from URL
    loanID := c.Param("loanId")

    // Parse JSON body
    var req struct {
        LoanStatus      string `json:"loanStatus"` // "approved" or "rejected"
        RejectionReason string `json:"rejectionReason,omitempty"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Find loan in DB
    var loan models.LoanDetails
    if err := ac.DB.First(&loan, "id = ?", loanID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Loan not found"})
        return
    }

    // Update basic fields
    now := time.Now()
    loan.ActionDate = &now
    loan.LoanStatus = req.LoanStatus

    // Handle rejection
    if req.LoanStatus == "rejected" {
        loan.RejectionReason = req.RejectionReason
        loan.LoanActive = false
    }

    // Handle approval
    if req.LoanStatus == "approved" {
        loan.LoanActive = true

        // ✅ Calculate EMI amount
        monthlyRepaymentAmount := calculateMonthlyRepayment(loan.Amount, loan.InterestRate, loan.RepayTenure)

        // ✅ Create repayment entries
        for i := 1; i <= loan.RepayTenure; i++ {
            dueDate := now.AddDate(0, i, 0) // every month
            repayment := models.Repayment{
                LoanID:      loan.ID,
                MonthNumber: i,
                Amount:      monthlyRepaymentAmount,
                DueDate:     dueDate,
                Status:      "unpaid",
                InterestRate: loan.InterestRate,
            }
            if err := ac.DB.Create(&repayment).Error; err != nil {
                log.Printf("Error creating repayment %d: %v", i, err)
            }
        }
    }

    // Save updated loan
    if err := ac.DB.Save(&loan).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update loan"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "message": "Loan status updated successfully",
        "loan":    loan,
    })
}

func calculateMonthlyRepayment(principal, annualInterestRate float64, tenureMonths int) float64 {
    monthlyRate := annualInterestRate / (12 * 100)
    emi := (principal * monthlyRate * math.Pow(1+monthlyRate, float64(tenureMonths))) /
        (math.Pow(1+monthlyRate, float64(tenureMonths)) - 1)
    return math.Round(emi*100) / 100 // round to 2 decimals
}

