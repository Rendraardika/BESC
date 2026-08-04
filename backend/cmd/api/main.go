package main

import (
	"errors"
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
	"online-competition-platform/internal/middleware"
	"online-competition-platform/internal/repositories"
	"online-competition-platform/internal/routes"
	"online-competition-platform/internal/services"
	"online-competition-platform/pkg/response"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("configuration error: %v", err)
	}

	db, err := database.Connect(cfg.MySQLDSN())
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	defer db.Close()
	if err := database.EnsureLatestSchema(db, cfg.DBName); err != nil {
		log.Fatalf("database schema check failed: %v", err)
	}

	for _, dir := range []string{
		filepath.Join(cfg.UploadDir, "public"),
		filepath.Join(cfg.UploadDir, "private", "payments"),
		filepath.Join(cfg.UploadDir, "private", "proctoring"),
		filepath.Join(cfg.UploadDir, "private", "registrations"),
	} {
		if err := os.MkdirAll(dir, 0750); err != nil {
			log.Fatalf("failed to create upload directory: %v", err)
		}
	}

	userRepo := repositories.NewUserRepository(db)
	competitionRepo := repositories.NewCompetitionRepository(db)
	registrationRepo := repositories.NewRegistrationRepository(db)
	paymentRepo := repositories.NewPaymentRepository(db)
	questionRepo := repositories.NewQuestionRepository(db)
	submissionRepo := repositories.NewSubmissionRepository(db)
	proctoringRepo := repositories.NewProctoringRepository(db)
	adminDashboardRepo := repositories.NewAdminDashboardRepository(db)
	teamRepo := repositories.NewTeamRepository(db)

	authService := services.NewAuthService(userRepo, cfg)
	competitionService := services.NewCompetitionService(competitionRepo)
	registrationService := services.NewRegistrationService(registrationRepo, competitionRepo, userRepo)
	paymentService := services.NewPaymentService(registrationRepo, paymentRepo, cfg)
	examService := services.NewExamService(registrationRepo, competitionRepo, questionRepo, submissionRepo)
	questionService := services.NewQuestionService(questionRepo)
	proctoringService := services.NewProctoringService(submissionRepo, proctoringRepo)
	adminDashboardService := services.NewAdminDashboardService(adminDashboardRepo)
	teamService := services.NewTeamService(teamRepo)
	userTeamHandler := handlers.NewUserTeamHandler(db)

	app := fiber.New(fiber.Config{
		AppName: "Online Competition Platform API",
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			var fiberErr *fiber.Error
			if errors.As(err, &fiberErr) && fiberErr.Code < fiber.StatusInternalServerError {
				return response.Error(c, fiberErr.Code, fiberErr.Message, nil)
			}
			log.Printf("unhandled fiber error: method=%s path=%s error=%v", c.Method(), c.Path(), err)
			return response.Error(c, fiber.StatusInternalServerError, "internal server error", nil)
		},
	})
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.CORSAllowOrigins,
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowCredentials: true,
	}))
	app.Use(middleware.OriginGuard(cfg.CORSAllowOrigins))

	routes.Register(app, routes.Handlers{
		Auth:           handlers.NewAuthHandler(authService, cfg),
		Competition:    handlers.NewCompetitionHandler(competitionService),
		Registration:   handlers.NewRegistrationHandler(registrationService),
		Payment:        handlers.NewPaymentHandler(paymentService, cfg),
		Exam:           handlers.NewExamHandler(examService),
		Question:       handlers.NewQuestionHandler(questionService),
		Proctoring:     handlers.NewProctoringHandler(proctoringService, cfg),
		AdminDashboard: handlers.NewAdminDashboardHandler(adminDashboardService),
		Document:       handlers.NewDocumentHandler(db, cfg),
		Team:           handlers.NewTeamHandler(teamService),
		UserTeam:       userTeamHandler,
	}, cfg)

	log.Fatal(app.Listen(":" + cfg.AppPort))
}
