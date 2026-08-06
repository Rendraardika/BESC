-- Migration 017: Cleanup orphaned data and fix cascade delete
-- This migration cleans up orphaned team records (user_id NULL or user not found)
-- and any other dangling references.

-- 1. Delete orphaned teams where user_id is NULL (deleted users)
DELETE FROM teams WHERE user_id IS NULL;

-- 2. Delete orphaned teams where user no longer exists
DELETE FROM teams WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM users);

-- 3. Delete orphaned registrations where user no longer exists
DELETE FROM registrations WHERE user_id NOT IN (SELECT id FROM users);

-- 4. Delete orphaned payments where registration no longer exists
DELETE FROM payments WHERE registration_id NOT IN (SELECT id FROM registrations);

-- 5. Delete orphaned submissions where user no longer exists
DELETE FROM submissions WHERE user_id NOT IN (SELECT id FROM users);
