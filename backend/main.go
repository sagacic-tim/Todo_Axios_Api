package main

import (
	"fmt"
	"log"
	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"github.com/joho/godotenv"
	"os"
)

var db *gorm.DB
var err error

// Task model
type Task struct {
	ID          uint   `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	DueDate     string `json:"due_date"`
	Completed   bool   `json:"completed"`
}

// CalendarDay model
type CalendarDay struct {
	ID     uint   `json:"id"`
	Month  int    `json:"month"`
	Year   int    `json:"year"`
	Day    int    `json:"day"`
	TaskID uint   `json:"task_id"`
}

func setupDatabase() {
	// Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
_
	// Get database credentials from environment variables
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")

	// Connect to PostgreSQL database
	dsn := fmt.Sprintf("user=%s password=%s dbname=%s sslmode=disable", dbUser, dbPassword, dbName)
	db, err = gorm.Open("postgres", dsn)
	if err != nil {
		panic("Failed to connect to database!")
	}
	fmt.Println("Database connected")
	db.AutoMigrate(&Task{}, &CalendarDay{})
}

func getTasks(c *gin.Context) {
	var tasks []Task
	if err := db.Find(&tasks).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, tasks)
}

func createTask(c *gin.Context) {
	var task Task
	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if err := db.Create(&task).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(201, task)
}

func main() {
	// Initialize database
	setupDatabase()

	// Set up Gin router
	router := gin.Default()

	// Disable trusting all proxies for development (Only local requests should be trusted)
	router.SetTrustedProxies(nil)  // Disable proxy trust in development

	// Endpoints
	router.GET("/tasks", getTasks)
	router.POST("/tasks", createTask)

	// Start the server
	router.Run(":8080")
}
