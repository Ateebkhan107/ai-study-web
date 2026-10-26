// Narrow SQL adapter for the separate local mock app. Never used by normal app.
export function localClient({ sql, literal, json }) {
  const calls = {
    zi_generation_job: ['p_op', 'p_owner', 'p_id', 'p_data'],
    zi_store_generated_test: ['p_owner', 'p_key', 'p_config', 'p_mode', 'p_duration', 'p_version', 'p_questions'],
    zi_start_generated_test: ['p_owner', 'p_test'],
    zi_save_generated_answers: ['p_owner', 'p_session', 'p_revision', 'p_answers'],
    zi_submit_generated_test: ['p_owner', 'p_session', 'p_revision', 'p_answers'],
  };
  const tables = new Set(['zi_generated_tests', 'zi_generated_sessions', 'zi_generated_questions', 'user_profiles', 'subscriptions', 'institute_members', 'test_sessions', 'institute_test_attempts', 'zi_preferences']);
  const columns = new Set(['id', 'owner_id', 'test_id', 'session_id', 'clerk_user_id', 'user_id', 'status', 'exam_track', 'preference_key', 'started_at', 'expires_at', 'question_order']);
  const value = v => v == null ? 'NULL' : typeof v === 'object' ? json(v) : literal(v);
  function column(k) { if (!columns.has(k)) throw Error('Unsupported local column'); return k; }
  return {
    async rpc(name, args) {
      if (!Object.hasOwn(calls, name) || Object.keys(args).some(k => !calls[name].includes(k))) throw Error('Unsupported local RPC');
      try {
        const result = await sql(`SELECT public.${name}(${calls[name].map(k => value(args[k])).join(',')});`, 'service_role');
        return { data: name === 'zi_store_generated_test' ? result : JSON.parse(result), error: null };
      } catch (e) { return { data: null, error: { code: e.message.match(/ERROR:\s+([A-Z0-9]{5}):/)?.[1] || 'XX000' } }; }
    },
    from(table) {
      if (!tables.has(table) && table !== 'pyq_questions') throw Error('Unsupported local table');
      const filters = []; let single = false, order = '', limit = 60;
      const q = {
        select() { return q; },
        eq(k, v) { if (table !== 'pyq_questions') filters.push(`${column(k)}=${value(v)}`); return q; },
        gte(k, v) { filters.push(`${column(k)}>=${value(v)}`); return q; },
        lt(k, v) { filters.push(`${column(k)}<${value(v)}`); return q; },
        in() { if (table !== 'pyq_questions') throw Error('Unsupported local filter'); return q; },
        ilike() { if (table !== 'pyq_questions') throw Error('Unsupported local filter'); return q; },
        abortSignal() { return q; },
        order(k, options) { if (table !== 'pyq_questions') order = `${column(k)} ${options?.ascending === false ? 'DESC' : 'ASC'}`; return q; },
        limit(n) { if (!Number.isInteger(n) || n < 1 || n > 120) throw Error('Invalid local limit'); limit = n; return q; },
        maybeSingle() { single = true; return q; },
        async then(resolve, reject) {
          try {
            const raw = table === 'pyq_questions'
              ? await sql("SELECT coalesce(jsonb_agg(payload ORDER BY payload->>'id'),'[]'::jsonb) FROM public.zi_journey_references;", 'service_role')
              : await sql(`SELECT coalesce(jsonb_agg(to_jsonb(q)),'[]'::jsonb) FROM (SELECT * FROM public.${table} ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''} ${order ? `ORDER BY ${order}` : ''} LIMIT ${limit}) q;`, 'service_role');
            const rows = JSON.parse(raw);
            return resolve({ data: single ? rows[0] || null : rows, error: null });
          } catch (e) { if (reject) return reject(e); throw e; }
        },
      };
      return q;
    },
  };
}
