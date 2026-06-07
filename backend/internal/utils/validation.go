package utils

import (
	"fmt"
	"regexp"

	"github.com/go-playground/validator/v10"
)

var validate = newValidator()

func newValidator() *validator.Validate {
	instance := validator.New()
	_ = instance.RegisterValidation("password_strength", func(fl validator.FieldLevel) bool {
		password := fl.Field().String()
		return regexp.MustCompile(`[A-Z]`).MatchString(password) &&
			regexp.MustCompile(`[a-z]`).MatchString(password) &&
			regexp.MustCompile(`[0-9]`).MatchString(password) &&
			regexp.MustCompile(`[^A-Za-z0-9]`).MatchString(password)
	})
	return instance
}

func Validate(input interface{}) map[string]string {
	if err := validate.Struct(input); err != nil {
		out := map[string]string{}
		for _, fieldErr := range err.(validator.ValidationErrors) {
			out[fieldErr.Field()] = fmt.Sprintf("failed %s validation", fieldErr.Tag())
		}
		return out
	}
	return nil
}

func Pagination(page, limit int) (int, int) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	return page, limit
}
