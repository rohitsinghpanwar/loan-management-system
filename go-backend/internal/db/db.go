package db

import (
	"log"
	"os"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func ConnectPostDB() *gorm.DB{
	_=godotenv.Load()
	dbURL:=os.Getenv("DB_URI")
	db,err:=gorm.Open(postgres.Open(dbURL),&gorm.Config{})
	if err!=nil{
		log.Fatal("Failed to connect to database",err)
	}
	log.Println("Database Connection established successfully")
	return db
}