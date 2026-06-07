package handlers

import (
	"github.com/gofiber/fiber/v2"

	"online-competition-platform/internal/dto"
	"online-competition-platform/internal/services"
	"online-competition-platform/pkg/response"
)

type ExamHandler struct {
	service services.ExamService
}

type QuestionHandler struct {
	service services.QuestionService
}

func NewExamHandler(service services.ExamService) *ExamHandler {
	return &ExamHandler{service: service}
}

func NewQuestionHandler(service services.QuestionService) *QuestionHandler {
	return &QuestionHandler{service: service}
}

func (h *ExamHandler) Questions(c *fiber.Ctx) error {
	items, err := h.service.Questions(userID(c), c.Params("competition_id"))
	if err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusOK, "exam questions", items)
}

func (h *ExamHandler) Start(c *fiber.Ctx) error {
	item, err := h.service.Start(userID(c), c.Params("competition_id"))
	if err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusCreated, "exam started", item)
}

func (h *ExamHandler) Submit(c *fiber.Ctx) error {
	var input dto.SubmitExamRequest
	if err := bindAndValidate(c, &input); err != nil {
		return err
	}
	result, err := h.service.Submit(userID(c), c.Params("competition_id"), input)
	if err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusOK, "exam submitted", result)
}

func (h *ExamHandler) Monitor(c *fiber.Ctx) error {
	page, limit := pagination(c)
	items, total, err := h.service.Monitor(page, limit)
	if err != nil {
		return handleError(c, err)
	}
	return response.Paginated(c, "submissions", items, response.Meta{Page: page, Limit: limit, Total: total})
}

func (h *QuestionHandler) Create(c *fiber.Ctx) error {
	var input dto.QuestionRequest
	if err := bindAndValidate(c, &input); err != nil {
		return err
	}
	item, err := h.service.Create(c.Params("competition_id"), input)
	if err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusCreated, "question created", item)
}

func (h *QuestionHandler) List(c *fiber.Ctx) error {
	items, err := h.service.List(c.Params("competition_id"))
	if err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusOK, "questions", items)
}

func (h *QuestionHandler) Update(c *fiber.Ctx) error {
	var input dto.QuestionRequest
	if err := bindAndValidate(c, &input); err != nil {
		return err
	}
	item, err := h.service.Update(c.Params("id"), input)
	if err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusOK, "question updated", item)
}

func (h *QuestionHandler) Delete(c *fiber.Ctx) error {
	if err := h.service.Delete(c.Params("id")); err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusOK, "question deleted", nil)
}
