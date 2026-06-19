-- One-time hard-delete of a contractor by company name.
-- This completely removes the contractor and all related data from the database.
-- Run via: docker exec -i pavagexpert-db psql -U pavagexpert -d pavagexpert < scripts/purge-contractor.sql
--
-- WARNING: This cannot be undone. All claims, quotes, invoices, sessions,
-- notifications, bills, portfolio items, reviews, social profiles, and
-- certifications belonging to this contractor will be permanently deleted.

BEGIN;

-- Find the contractor ID(s) matching the company name
-- Replace 'paysagement dynamique' with the exact company name
DO $$
DECLARE
  v_id UUID;
  v_count INT;
BEGIN
  FOR v_id IN SELECT id FROM contractors WHERE LOWER(company) = LOWER('paysagement dynamique')
  LOOP
    -- Delete bill items (depend on bills -> cascade)
    -- Delete bills (depend on contractor)
    DELETE FROM contractor_bills WHERE contractor_id = v_id;
    -- Delete notifications
    DELETE FROM notifications WHERE contractor_id = v_id;
    -- Delete push subscriptions
    DELETE FROM push_subscriptions WHERE contractor_id = v_id;
    -- Delete sessions
    DELETE FROM sessions WHERE contractor_id = v_id;
    -- Delete social profiles
    DELETE FROM contractor_social_profiles WHERE contractor_id = v_id;
    -- Delete certifications
    DELETE FROM contractor_certifications WHERE contractor_id = v_id;
    -- Delete portfolio items
    DELETE FROM contractor_portfolio WHERE contractor_id = v_id;
    -- Delete reviews
    DELETE FROM contractor_reviews WHERE contractor_id = v_id;
    -- Delete claims (FK cascade to bill_items)
    DELETE FROM claims WHERE contractor_id = v_id;
    -- Delete quotes
    DELETE FROM quotes WHERE contractor_id = v_id;
    -- Delete invoices
    DELETE FROM invoices WHERE contractor_id = v_id;
    -- Finally delete the contractor
    DELETE FROM contractors WHERE id = v_id;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'Deleted contractor id=% (rows affected: %)', v_id, v_count;
  END LOOP;
END $$;

-- Verify deletion
SELECT id, company, email, status FROM contractors WHERE LOWER(company) = LOWER('paysagement dynamique');

COMMIT;
