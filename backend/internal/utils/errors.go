package utils

import "errors"

var (
	ErrNotFound              = errors.New("resource not found")
	ErrUnauthorized          = errors.New("unauthorized")
	ErrForbidden             = errors.New("forbidden")
	ErrConflict              = errors.New("resource already exists")
	ErrConfiguration         = errors.New("configuration error")
	ErrExternalService       = errors.New("external service unavailable")
	ErrInvalidInput          = errors.New("invalid input")
	ErrProfileIncomplete     = errors.New("profile is incomplete")
	ErrRegistrationClosed    = errors.New("registration is closed")
	ErrPaymentPending        = errors.New("payment is not verified")
	ErrPaymentProofNotViewed = errors.New("payment proof must be viewed before verification")
	ErrExamNotStarted        = errors.New("exam has not started")
	ErrExamClosed            = errors.New("exam is closed")
	ErrExamSubmitted         = errors.New("exam already submitted")
	ErrNoQuestions           = errors.New("exam questions are not available")
)
