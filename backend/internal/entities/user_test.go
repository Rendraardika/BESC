package entities

import (
	"testing"
	"time"
)

func TestUserRefreshProfileComplete(t *testing.T) {
	birthDate := time.Date(2006, 1, 2, 0, 0, 0, 0, time.UTC)
	user := &User{
		Name:        "Peserta BESC",
		Email:       "peserta@example.com",
		Phone:       "08123456789",
		Institution: "SMA BESC",
		Photo:       "data:image/png;base64,abc",
		BirthDate:   &birthDate,
		Gender:      "Laki-laki",
		Province:    "Jawa Barat",
		City:        "Bandung",
	}

	user.RefreshProfileComplete()
	if !user.ProfileComplete {
		t.Fatal("expected complete profile")
	}

	user.Phone = ""
	user.RefreshProfileComplete()
	if user.ProfileComplete {
		t.Fatal("expected incomplete profile when required database field is empty")
	}
}
