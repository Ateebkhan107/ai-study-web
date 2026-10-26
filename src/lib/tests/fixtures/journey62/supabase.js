import { sql, literal, json } from "@/lib/tests/phase61Lab.mjs";
const calls = {
  zi_generation_job: ["p_op", "p_owner", "p_id", "p_data"],
  zi_store_generated_test: ["p_owner", "p_key", "p_config", "p_mode", "p_duration", "p_version", "p_questions"],
  zi_start_generated_test: ["p_owner", "p_test"],
  zi_save_generated_answers: ["p_owner", "p_session", "p_revision", "p_answers"],
  zi_submit_generated_test: ["p_owner", "p_session", "p_revision", "p_answers"],
};
const value = (v) => v == null ? "NULL" : typeof v === "object" ? json(v) : literal(v);
export const supabaseAdmin = {
  async rpc(name, args) {
    if (!calls[name]) throw Error("Unexpected synthetic RPC");
    try {
      const kind = name === "zi_save_generated_answers" ? "save" : name === "zi_submit_generated_test" ? "submit" : null;
      let fault = null;
      if (kind) {
        fault = await sql(`UPDATE public.zi_journey_faults SET remaining=0 WHERE owner_id=${literal(args.p_owner)} AND remaining=1 AND kind=${literal(kind)} RETURNING mode;`);
        if (fault === "before") return { data: null, error: { code: "08006" } };
      }
      const result = await sql(`SELECT public.${name}(${calls[name].map((key) => value(args[key])).join(",")});`, "service_role");
      if (fault === "after") return { data: null, error: { code: "08006" } };
      return { data: name === "zi_store_generated_test" ? result : JSON.parse(result), error: null };
    } catch (e) { return { data: null, error: { code: e.message.match(/ERROR:\s+([A-Z0-9]{5}):/)?.[1] || "XX000" } }; }
  },
  from(table) {
    if (!["zi_generated_tests", "zi_generated_sessions", "zi_generated_questions", "pyq_questions"].includes(table)) throw Error(`Unexpected synthetic read: ${table}`);
    const filters = []; let single = false, order = null, limit = 30;
    const query = {
      select() { return query; },
      eq(k, v) { filters.push([k, v]); return query; },
      in() { return query; }, ilike() { return query; }, abortSignal() { return query; },
      order(k) { if (table !== "pyq_questions") order = k; return query; },
      limit(n) { limit = Math.min(n, 60); return query; },
      maybeSingle() { single = true; return query; },
      async then(resolve, reject) {
        try {
          let data;
          if (table === "pyq_questions") data = JSON.parse(await sql("SELECT jsonb_agg(payload ORDER BY payload->>'id') FROM public.zi_journey_references;", "service_role"));
          else {
            for (const [k] of filters) if (!["id", "owner_id", "test_id", "session_id"].includes(k)) throw Error("Unexpected fixture filter");
            if (order && order !== "question_order") throw Error("Unexpected fixture ordering");
            const where = filters.length ? `WHERE ${filters.map(([k, v]) => `${k}=${value(v)}`).join(" AND ")}` : "";
            data = JSON.parse(await sql(`SELECT coalesce(jsonb_agg(to_jsonb(q)),'[]'::jsonb) FROM (SELECT * FROM public.${table} ${where} ${order ? `ORDER BY ${order}` : ""} LIMIT ${limit}) q;`, "service_role"));
          }
          return resolve({ data: single ? data[0] || null : data, error: null });
        } catch (e) { if (reject) return reject(e); throw e; }
      },
    };
    return query;
  },
};
