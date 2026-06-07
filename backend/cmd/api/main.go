package main

import (
	"log"
	"os"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"

	"online-competition-platform/config"
	"online-competition-platform/database"
	"online-competition-platform/internal/handlers"
	"online-competition-platform/internal/repositories"
	"online-competition-platform/internal/routes"
	"online-competition-platform/internal/services"
)

func main() {
	cfg := config.Load()

	db, err := database.Connect(cfg.MySQLDSN())
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	defer db.Close()

	if err := os.MkdirAll(filepath.Join(cfg.UploadDir, "payments"), 0755); err != nil {
		log.Fatalf("failed to create upload directory: %v", err)
	}
	if err := os.MkdirAll(filepath.Join(cfg.UploadDir, "proctoring"), 0755); err != nil {
		log.Fatalf("failed to create upload directory: %v", err)
	}

	userRepo := repositories.NewUserRepository(db)
	competitionRepo := repositories.NewCompetitionRepository(db)
	registrationRepo := repositories.NewRegistrationRepository(db)
	paymentRepo := repositories.NewPaymentRepository(db)
	questionRepo := repositories.NewQuestionRepository(db)
	submissionRepo := repositories.NewSubmissionRepository(db)
	proctoringRepo := repositories.NewProctoringRepository(db)
	adminDashboardRepo := repositories.NewAdminDashboardRepository(db)

	authService := services.NewAuthService(userRepo, cfg)
	competitionService := services.NewCompetitionService(competitionRepo)
	registrationService := services.NewRegistrationService(registrationRepo, competitionRepo)
	paymentService := services.NewPaymentService(registrationRepo, paymentRepo, cfg)
	examService := services.NewExamService(registrationRepo, questionRepo, submissionRepo)
	questionService := services.NewQuestionService(questionRepo)
	proctoringService := services.NewProctoringService(submissionRepo, proctoringRepo)
	adminDashboardService := services.NewAdminDashboardService(adminDashboardRepo)

	app := fiber.New(fiber.Config{
		AppName: "Online Competition Platform API",
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": "internal server error",
				"errors":  err.Error(),
			})
		},
	})
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{AllowOrigins: cfg.CORSAllowOrigins}))

	routes.Register(app, routes.Handlers{
		Auth:           handlers.NewAuthHandler(authService),
		Competition:    handlers.NewCompetitionHandler(competitionService),
		Registration:   handlers.NewRegistrationHandler(registrationService),
		Payment:        handlers.NewPaymentHandler(paymentService, cfg),
		Exam:           handlers.NewExamHandler(examService),
		Question:       handlers.NewQuestionHandler(questionService),
		Proctoring:     handlers.NewProctoringHandler(proctoringService, cfg),
		AdminDashboard: handlers.NewAdminDashboardHandler(adminDashboardService),
	}, cfg)

	log.Fatal(app.Listen(":" + cfg.AppPort))
}
