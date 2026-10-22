ALTER TABLE lkti_submissions
  ADD COLUMN IF NOT EXISTS poster_submitted_at DATETIME NULL AFTER confirmation_at,
  ADD COLUMN IF NOT EXISTS poster_confirmation_at DATETIME NULL AFTER poster_submitted_at,
  ADD COLUMN IF NOT EXISTS poster_publication_consent_at DATETIME NULL AFTER poster_confirmation_at,
  ADD COLUMN IF NOT EXISTS presentation_submitted_at DATETIME NULL AFTER poster_publication_consent_at,
  ADD COLUMN IF NOT EXISTS presentation_material_confirmation_at DATETIME NULL AFTER presentation_submitted_at,
  ADD COLUMN IF NOT EXISTS presentation_technical_confirmation_at DATETIME NULL AFTER presentation_material_confirmation_at,
  ADD COLUMN IF NOT EXISTS presentation_full_paper_confirmation_at DATETIME NULL AFTER presentation_technical_confirmation_at;
