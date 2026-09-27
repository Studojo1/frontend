-- Campus ambassador referral codes for the 26 September webinar.
--
-- These nine codes were chosen by hand rather than generated, and they all end
-- in 10 so they are easy to dictate over a phone or read off a story. The
-- application table's own generator produces a random two-digit suffix, which
-- would have given these nine something like AANSHI42; seeding them here means
-- the codes already circulating are the codes that work.
--
-- Runs inside the deploy's migration job, once, tracked by filename.

-- The webinar page resolves a code by joining to this table, so the columns
-- have to exist before the seed. The public site creates them lazily on first
-- registration, which may not have happened yet on a fresh environment.
ALTER TABLE IF EXISTS campus_ambassador_applications
  ADD COLUMN IF NOT EXISTS ref_code TEXT;

DO $$
BEGIN
  -- Nothing to seed if the ambassador programme has never been deployed here.
  IF to_regclass('public.campus_ambassador_applications') IS NULL THEN
    RAISE NOTICE 'campus_ambassador_applications does not exist; skipping seed';
    RETURN;
  END IF;

  CREATE UNIQUE INDEX IF NOT EXISTS idx_campus_ambassador_ref_code_unique
    ON campus_ambassador_applications (upper(ref_code))
    WHERE ref_code IS NOT NULL;

  -- Match on the first name, case-insensitively, because the panel holds full
  -- names ("Aanshi Goyal") and some of these were given as a first name only.
  -- Only rows without a code are touched, so a code already handed out is never
  -- reassigned, and re-running this cannot renumber anybody.
  WITH wanted(display_name, first_name, code) AS (
    VALUES
      ('Aanshi Goyal',   'aanshi',   'AANSHI10'),
      ('Ayaan',          'ayaan',    'AYAAN10'),
      ('Devmalya',       'devmalya', 'DEVMALYA10'),
      ('Diya Kerur',     'diya',     'DIYA10'),
      ('Parashar Deb',   'parashar', 'PARASHAR10'),
      ('Juana',          'juana',    'JUANA10'),
      ('Kriti Bhardwaj', 'kriti',    'KRITI10'),
      ('Shyam Gupta',    'shyam',    'SHYAM10'),
      ('Ridhima',        'ridhima',  'RIDHIMA10')
  ),
  -- One row per code: if two applicants share a first name, take the earliest,
  -- so the result does not depend on scan order and a re-run stays stable.
  matched AS (
    SELECT DISTINCT ON (w.code) w.code, a.id
    FROM wanted w
    JOIN campus_ambassador_applications a
      ON lower(split_part(trim(a.full_name), ' ', 1)) = w.first_name
    WHERE a.ref_code IS NULL
    ORDER BY w.code, a.id
  )
  UPDATE campus_ambassador_applications a
  SET ref_code = m.code,
      -- A code only grants a discount while its owner is 'selected', so an
      -- ambassador who is still 'new' in the panel would hand out a code that
      -- silently fails. Seeding the code means they are in the programme.
      status = 'selected'
  FROM matched m
  WHERE a.id = m.id;

  -- Anyone left over never filled in the public application form — they were
  -- recruited directly. Their code is already being shared, so create the row
  -- rather than leave the code dead at checkout.
  --
  -- email carries a per-code placeholder rather than '' because the table has a
  -- unique index on lower(email): a second blank would abort this migration and
  -- with it the whole deploy. The .invalid TLD is reserved by RFC 2606 and can
  -- never be delivered to, so a placeholder cannot be mistaken for a real
  -- address or accidentally emailed. Ops replaces it when they collect details.
  INSERT INTO campus_ambassador_applications
    (full_name, whatsapp, email, college, year_of_study, why_you, status, ref_code, referral_source)
  SELECT w.display_name, '', lower(w.code) || '@ambassador.invalid', '', '',
         'Recruited directly for the 26 Sep webinar',
         'selected', w.code, 'direct-recruit'
  FROM (VALUES
      ('Aanshi Goyal',   'AANSHI10'),
      ('Ayaan',          'AYAAN10'),
      ('Devmalya',       'DEVMALYA10'),
      ('Diya Kerur',     'DIYA10'),
      ('Parashar Deb',   'PARASHAR10'),
      ('Juana',          'JUANA10'),
      ('Kriti Bhardwaj', 'KRITI10'),
      ('Shyam Gupta',    'SHYAM10'),
      ('Ridhima',        'RIDHIMA10')
  ) AS w(display_name, code)
  WHERE NOT EXISTS (
    SELECT 1 FROM campus_ambassador_applications a
    WHERE upper(a.ref_code) = w.code
  );

  RAISE NOTICE 'Ambassador codes now live: %',
    (SELECT count(*) FROM campus_ambassador_applications
     WHERE ref_code IN ('AANSHI10','AYAAN10','DEVMALYA10','DIYA10','PARASHAR10',
                        'JUANA10','KRITI10','SHYAM10','RIDHIMA10')
       AND status = 'selected');
END $$;
