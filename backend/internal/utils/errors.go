package utils

import "errors"

var (
	ErrNotFound          = errors.New("resource not found")
	ErrUnauthorized      = errors.New("unauthorized")
	ErrForbidden         = errors.New("forbidden")
	ErrConflict          = errors.New("resource already exists")
	ErrConfiguration     = errors.New("configuration error")
	ErrInvalidInput      = errors.New("invalid input")
	ErrProfileIncomplete = errors.New("profile is incomplete")
	ErrPaymentPending    = errors.New("payment is not verified")
	ErrExamSubmitted     = errors.New("exam already submitted")
)
