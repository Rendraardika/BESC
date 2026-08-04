package routes

import (
	"path/filepath"

	"github.com/gofiber/fiber/v2"

	"online-competition-platform/config"
	"online-competition-platform/internal/handlers"
	"online-competition-platform/internal/middleware"
)

type Handlers struct {
	Auth           *handlers.AuthHandler
	Competition    *handlers.CompetitionHandler
	Registration   *handlers.RegistrationHandler
	Payment        *handlers.PaymentHandler
	Exam           *handlers.ExamHandler
	Question       *handlers.QuestionHandler
	Proctoring     *handlers.ProctoringHandler
	AdminDashboard *handlers.AdminDashboardHandler
	Document       *handlers.DocumentHandler
	Team           *handlers.TeamHandler
	UserTeam       *handlers.UserTeamHandler
}

func Register(app *fiber.App, h Handlers, cfg config.Config) {
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})
	app.Static("/uploads", filepath.Join(cfg.UploadDir, "public"))
	app.Static("/docs", "./docs")

	api := app.Group("/api/v1")
	api.Post("/auth/register", h.Auth.Register)
	api.Post("/auth/login", h.Auth.Login)
	api.Post("/auth/logout", h.Auth.Logout)
	api.Get("/competitions", h.Competition.List)
	api.Get("/competitions/:id", h.Competition.Detail)

	protected := api.Group("", middleware.JWT(cfg.JWTSecret))
	protected.Get("/auth/me", h.Auth.Me)
	protected.Put("/auth/profile", h.Auth.UpdateProfile)
	protected.Post("/competitions/:competition_id/register", h.Registration.RegisterCompetition)
	protected.Get("/me/competitions", h.Registration.MyCompetitions)
	protected.Post("/registrations/:registration_id/payment-proof", h.Payment.UploadProof)
	protected.Post("/registrations/:registration_id/documents", h.Document.UploadDocuments)
	protected.Get("/registrations/:registration_id/documents", h.Document.ListDocuments)
	protected.Get("/registrations/:registration_id/payment", h.Payment.Status)
	protected.Get("/competitions/:competition_id/exam/questions", h.Exam.Questions)
	protected.Post("/competitions/:competition_id/exam/start", h.Exam.Start)
	protected.Post("/competitions/:competition_id/exam/submit", h.Exam.Submit)
	protected.Post("/proctoring/events", h.Proctoring.LogEvent)
	protected.Post("/submissions/:submission_id/proctoring/snapshots", h.Proctoring.UploadSnapshot)

	admin := protected.Group("/admin", middleware.Admin)
	admin.Get("/dashboard", h.AdminDashboard.Summary)
	admin.Get("/participants", h.AdminDashboard.Participants)
	admin.Get("/participants/:id", h.AdminDashboard.Participant)
	admin.Delete("/participants/:id", h.AdminDashboard.DeleteParticipant)
	admin.Post("/competitions", h.Competition.Create)
	admin.Put("/competitions/:id", h.Competition.Update)
	admin.Delete("/competitions/:id", h.Competition.Delete)
	admin.Post("/payments/:payment_id/verify", h.Payment.Verify)
	admin.Get("/payments/:payment_id/proof", h.Payment.Proof)
	admin.Get("/submissions", h.Exam.Monitor)
	admin.Get("/competitions/:competition_id/questions", h.Question.List)
	admin.Post("/competitions/:competition_id/questions", h.Question.Create)
	admin.Put("/questions/:id", h.Question.Update)
	admin.Delete("/questions/:id", h.Question.Delete)
	admin.Get("/submissions/:submission_id/proctoring/summary", h.Proctoring.Summary)
	admin.Get("/submissions/:submission_id/proctoring/events", h.Proctoring.Events)
	admin.Get("/submissions/:submission_id/proctoring/snapshots", h.Proctoring.Snapshots)
	admin.Get("/proctoring/snapshots/:snapshot_id/image", h.Proctoring.SnapshotImage)
	admin.Get("/registrations/:registration_id/documents", h.Document.ListDocuments)
	admin.Get("/documents/:doc_id/view", h.Document.ViewDocument)
	protected.Post("/me/teams", h.UserTeam.SubmitTeam)
	admin.Get("/teams", h.Team.List)
	admin.Post("/teams", h.Team.Create)
	admin.Put("/teams/:id", h.Team.Update)
	admin.Delete("/teams/:id", h.Team.Delete)
}
