package models

import (
	"time"
	"github.com/google/uuid"
)

type LoanDetails struct {
	ID           uuid.UUID  `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	LoanCode      string    `gorm:"uniqueIndex;not null" json:"loanCode"`
	FullName     string		`gorm:"size:255" json:"fullName"`
	Amount       float64    `gorm:"not null" json:"amount"`
	RepayTenure  int        `gorm:"not null" json:"repayTenure"`
	LoanType     string     `gorm:"size:50;not null" json:"loanType"`
	InterestRate float64    `gorm:"not null" json:"interestRate"`
	BorrowerID 	 string 	`gorm:"type:varchar(24);not null" json:"borrowerId"`
	AppliedDate  time.Time  `gorm:"not null;default:current_timestamp"`
	TotalPayable   float64 	`json:"totalPayable"`
	TotalInterest  float64 	`json:"totalInterest"`
	ActionDate *time.Time
	LoanStatus   string     `gorm:"size:20;not null;default:'pending'"`
	BankName     string     `gorm:"size:100;not null;default:'IDFC First Bank'"`
	RejectionReason string 	`gorm:"size:255" json:"rejectionReason"`
	LoanActive  bool   		`gorm:"default:false" json:"loanActive"`
	LoanPaid 	bool   		`gorm:"default:false" json:"loanPaid"`
	Repayments  []Repayment `gorm:"foreignKey:LoanID" json:"repayments"`
}
