-- Apply before deploying the PYQ route. This migration creates new objects only.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

DO $preflight$
BEGIN
  IF NOT EXISTS (
       SELECT 1 FROM pg_roles WHERE rolname = 'service_role' AND rolbypassrls
     ) THEN
    RAISE EXCEPTION 'Expected Supabase service role is unavailable';
  END IF;
  IF to_regnamespace('prepzii_integrity') IS NOT NULL THEN
    RAISE EXCEPTION 'The full integrity contract is already installed';
  END IF;
  IF NOT has_table_privilege('service_role', 'public.pyq_questions', 'SELECT')
     OR NOT has_table_privilege('service_role', 'public.pyq_attempts', 'SELECT')
     OR NOT has_table_privilege('service_role', 'public.pyq_attempts', 'INSERT')
     OR NOT has_table_privilege('service_role', 'public.user_xp', 'SELECT')
     OR NOT has_table_privilege('service_role', 'public.user_xp', 'INSERT')
     OR NOT has_table_privilege('service_role', 'public.user_xp', 'UPDATE') THEN
    RAISE EXCEPTION 'Existing PYQ or XP service permissions are missing';
  END IF;
END
$preflight$;

CREATE TABLE public.prepzii_pyq_submission_receipts (
  user_id text NOT NULL,
  request_key text NOT NULL,
  answers jsonb NOT NULL,
  result jsonb NOT NULL,
  PRIMARY KEY (user_id, request_key)
);
ALTER TABLE public.prepzii_pyq_submission_receipts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.prepzii_pyq_submission_receipts FROM PUBLIC, anon, authenticated, authenticator, service_role;
GRANT SELECT, INSERT ON public.prepzii_pyq_submission_receipts TO service_role;

CREATE FUNCTION public.prepzii_submit_pyq(p_user text, p_key text, p_answers jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, pg_temp AS $submit$
DECLARE
  canonical jsonb;
  prior public.prepzii_pyq_submission_receipts;
  previously_answered uuid[];
  answer jsonb;
  question jsonb;
  current_question_id uuid;
  chosen text;
  kind text;
  correct boolean;
  accepted jsonb;
  attempt_id uuid;
  grades jsonb := '[]';
  result jsonb;
  points integer := 0;
  solved integer := 0;
  correct_count integer := 0;
  answered boolean := false;
  balance integer;
  today date := (clock_timestamp() AT TIME ZONE 'UTC')::date;
  new_level integer;
  next_threshold bigint := 6500;
  level_step integer := 1500;
BEGIN
  IF p_user IS NULL OR p_user = '' OR p_key IS NULL OR length(p_key) NOT BETWEEN 16 AND 200
     OR jsonb_typeof(p_answers) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Invalid PYQ request' USING ERRCODE = '22023';
  END IF;
  IF jsonb_array_length(p_answers) NOT BETWEEN 1 AND 200 THEN
    RAISE EXCEPTION 'Invalid PYQ batch size' USING ERRCODE = '22023';
  END IF;

  SELECT jsonb_agg(normalized ORDER BY normalized->>'question_id') INTO canonical
  FROM (
    SELECT jsonb_build_object(
      'question_id', (entry->>'question_id')::uuid,
      'selected_option', NULLIF(upper(btrim(entry->>'selected_option')), '')
    ) AS normalized
    FROM jsonb_array_elements(p_answers) AS answers(entry)
  ) AS normalized_answers;
  IF (SELECT count(DISTINCT entry->>'question_id') FROM jsonb_array_elements(canonical) AS answers(entry))
     <> jsonb_array_length(canonical) THEN
    RAISE EXCEPTION 'Missing or repeated PYQ question' USING ERRCODE = '22023';
  END IF;

  -- Serialize overlapping decks and retries by user before reading receipts or attempt history.
  PERFORM pg_advisory_xact_lock(hashtextextended('prepzii-integrity:' || p_user, 0));
  SELECT * INTO prior FROM public.prepzii_pyq_submission_receipts
  WHERE user_id = p_user AND request_key = p_key;
  IF FOUND THEN
    IF prior.answers IS DISTINCT FROM canonical THEN
      RAISE EXCEPTION 'PYQ request key payload conflict' USING ERRCODE = 'PZ409';
    END IF;
    RETURN prior.result;
  END IF;

  -- Existing receipts can still replay, but new writes must use the full contract after cutover.
  IF to_regnamespace('prepzii_integrity') IS NOT NULL THEN
    RAISE EXCEPTION 'Full integrity contract is active';
  END IF;

  SELECT COALESCE(array_agg(DISTINCT previous.question_id), ARRAY[]::uuid[])
  INTO previously_answered
  FROM public.pyq_attempts AS previous
  WHERE previous.user_id = p_user
    AND NULLIF(btrim(previous.selected_option), '') IS NOT NULL
    AND previous.question_id IN (
      SELECT (entry->>'question_id')::uuid FROM jsonb_array_elements(canonical) AS answers(entry)
    );

  FOR answer IN SELECT value FROM jsonb_array_elements(canonical) LOOP
    current_question_id := (answer->>'question_id')::uuid;
    SELECT to_jsonb(q) INTO question FROM public.pyq_questions AS q WHERE q.id = current_question_id;
    IF question IS NULL THEN
      RAISE EXCEPTION 'Unknown PYQ question' USING ERRCODE = '22023';
    END IF;
    chosen := answer->>'selected_option';
    kind := COALESCE(question->>'question_type', 'MCQ');
    accepted := CASE WHEN jsonb_typeof(question->'correct_options') = 'array'
      THEN question->'correct_options' ELSE '[]'::jsonb END;

    IF chosen IS NULL THEN
      correct := false;
    ELSIF kind = 'NUMERICAL' THEN
      IF chosen !~ '^[+-]?([0-9]+(\.[0-9]*)?|\.[0-9]+)(E[+-]?[0-9]+)?$' THEN
        RAISE EXCEPTION 'Invalid numerical answer' USING ERRCODE = '22023';
      END IF;
      correct := CASE WHEN jsonb_array_length(accepted) > 0 THEN
        EXISTS (SELECT 1 FROM jsonb_array_elements_text(accepted) AS a(value) WHERE value::numeric = chosen::numeric)
        WHEN question->>'numerical_min' IS NOT NULL AND question->>'numerical_max' IS NOT NULL THEN
          chosen::numeric BETWEEN (question->>'numerical_min')::numeric AND (question->>'numerical_max')::numeric
        ELSE chosen::numeric = (question->>'numerical_answer')::numeric END;
    ELSE
      IF chosen !~ '^[A-D](,[A-D])*$' THEN
        RAISE EXCEPTION 'Invalid answer option' USING ERRCODE = '22023';
      END IF;
      IF kind = 'MULTIPLE_CORRECT' THEN
        correct := (SELECT array_agg(DISTINCT value ORDER BY value) FROM unnest(string_to_array(chosen, ',')) AS a(value))
          = (SELECT array_agg(DISTINCT upper(btrim(value)) ORDER BY upper(btrim(value)))
             FROM jsonb_array_elements_text(accepted) AS a(value));
      ELSE
        correct := CASE WHEN jsonb_array_length(accepted) > 0 THEN
          EXISTS (SELECT 1 FROM jsonb_array_elements_text(accepted) AS a(value) WHERE upper(btrim(value)) = chosen)
          ELSE upper(btrim(question->>'correct_option')) = chosen END;
      END IF;
    END IF;
    correct := COALESCE(correct, false);

    IF chosen IS NOT NULL THEN
      answered := true;
      IF current_question_id <> ALL(previously_answered) THEN
        points := points + CASE WHEN correct THEN 10 ELSE 2 END;
        solved := solved + 1;
        correct_count := correct_count + correct::integer;
      END IF;
    END IF;

    INSERT INTO public.pyq_attempts (user_id, question_id, selected_option, is_correct)
    VALUES (p_user, current_question_id, COALESCE(chosen, ''), correct) RETURNING id INTO attempt_id;
    grades := grades || jsonb_build_array(jsonb_build_object(
      'id', attempt_id, 'question_id', current_question_id, 'selected_option', chosen, 'is_correct', correct,
      'correct_option', question->'correct_option', 'correct_options', question->'correct_options',
      'numerical_answer', question->'numerical_answer', 'numerical_min', question->'numerical_min',
      'numerical_max', question->'numerical_max', 'explanation', question->'explanation',
      'explanation_image', question->'explanation_image'
    ));
  END LOOP;

  IF answered THEN
    INSERT INTO public.user_xp (user_id, xp, name) VALUES (p_user, 0, 'Student')
    ON CONFLICT (user_id) DO NOTHING;

    UPDATE public.user_xp AS xp_row
    SET xp = COALESCE(xp_row.xp, 0) + points,
        pyq_solved = COALESCE(xp_row.pyq_solved, 0) + solved,
        correct_answers = COALESCE(xp_row.correct_answers, 0) + correct_count,
        accuracy = CASE WHEN solved > 0 THEN round(
          100.0 * (COALESCE(xp_row.correct_answers, 0) + correct_count)
          / (COALESCE(xp_row.pyq_solved, 0) + solved)
        ) ELSE xp_row.accuracy END,
        streak = CASE WHEN xp_row.last_study_date >= today THEN xp_row.streak
          WHEN xp_row.last_study_date = today - 1 THEN COALESCE(xp_row.streak, 0) + 1 ELSE 1 END,
        last_study_date = greatest(xp_row.last_study_date, today)
    WHERE xp_row.user_id = p_user RETURNING xp_row.xp INTO balance;

    IF points > 0 THEN
      -- Same thresholds and titles as src/utils/levelEngine.js.
      new_level := CASE WHEN balance < 500 THEN 1 WHEN balance < 1200 THEN 2
        WHEN balance < 2200 THEN 3 WHEN balance < 3500 THEN 4 WHEN balance < 5000 THEN 5 ELSE 6 END;
      WHILE balance >= next_threshold LOOP
        new_level := new_level + 1;
        level_step := level_step + 300;
        next_threshold := next_threshold + level_step;
      END LOOP;
      UPDATE public.user_xp
      SET level = new_level,
          badge = CASE WHEN new_level >= 10 THEN 'Grandmaster' WHEN new_level >= 8 THEN 'Master'
            WHEN new_level >= 6 THEN 'Elite' WHEN new_level >= 4 THEN 'Expert'
            WHEN new_level >= 2 THEN 'Challenger' ELSE 'Explorer' END
      WHERE user_id = p_user;
    END IF;
  ELSE
    SELECT xp FROM public.user_xp WHERE user_id = p_user INTO balance;
  END IF;

  result := jsonb_build_object('success', true, 'xp', COALESCE(balance, 0), 'results', grades);
  INSERT INTO public.prepzii_pyq_submission_receipts (user_id, request_key, answers, result)
  VALUES (p_user, p_key, canonical, result);
  RETURN result;
END
$submit$;

REVOKE ALL ON FUNCTION public.prepzii_submit_pyq(text, text, jsonb) FROM PUBLIC, anon, authenticated, authenticator, service_role;
GRANT EXECUTE ON FUNCTION public.prepzii_submit_pyq(text, text, jsonb) TO service_role;

DO $permissions$
BEGIN
  IF EXISTS (
    SELECT 1 FROM unnest(ARRAY['anon', 'authenticated', 'authenticator']) AS browser(role_name)
    WHERE has_function_privilege(role_name, 'public.prepzii_submit_pyq(text,text,jsonb)', 'EXECUTE')
      OR has_table_privilege(role_name, 'public.prepzii_pyq_submission_receipts',
        'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
  ) THEN
    RAISE EXCEPTION 'PYQ submission objects must be restricted to server roles';
  END IF;
END
$permissions$;

NOTIFY pgrst, 'reload schema';
COMMIT;
