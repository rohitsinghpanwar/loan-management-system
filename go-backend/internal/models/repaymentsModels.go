package models

import (
	"time"
	"github.com/google/uuid"
)

type Repayment struct {
	ID            uuid.UUID  `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	LoanID        uuid.UUID  `gorm:"type:uuid;not null" json:"loanId"` // foreign key
	MonthNumber   int        `gorm:"not null" json:"monthNumber"`      // EMI number
	Amount        float64    `gorm:"not null" json:"amount"`           // EMI amount
	DueDate       time.Time  `gorm:"not null" json:"dueDate"`          // Payment due date
	Status        string     `gorm:"size:20;not null;default:'unpaid'" json:"status"` // paid / unpaid
	InterestRate float64    `gorm:"not null" json:"interestRate"`
	BankName     string     `gorm:"size:100;not null;default:'IDFC First Bank'"`
	PaidDate      *time.Time `json:"paidDate,omitempty"`               // when user pays
	CreatedAt     time.Time  `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt     time.Time  `gorm:"autoUpdateTime" json:"updatedAt"`

}
