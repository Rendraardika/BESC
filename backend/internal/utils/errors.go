package utils

import "errors"

var (
	ErrNotFound       = errors.New("resource not found")
	ErrUnauthorized   = errors.New("unauthorized")
	ErrForbidden      = errors.New("forbidden")
	ErrConflict       = errors.New("resource already exists")
	ErrInvalidInput   = errors.New("invalid input")
	ErrPaymentPending = errors.New("payment is not verified")
	ErrExamSubmitted  = errors.New("exam already submitted")
)
