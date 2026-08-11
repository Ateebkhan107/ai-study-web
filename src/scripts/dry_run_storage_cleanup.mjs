import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

const DRY_RUN = true;
const REPORT_PATH = path.join(process.cwd(), "tmp", "storage-cleanup-report.json");
const PYQ_BUCKET = "pyq-images";
const FORMULA_BUCKET = "formula-books";
const PYQ_IMAGE_COLUMNS = [
  "question_image",
  "option_a_image",
  "option_b_image",
  "option_c_image",
  "option_d_image",
  "explanation_image",
];

process.loadEnvFile(".env.local");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    realtime: {
      transport: WebSocket,
    },
  }
);

function objectPathFromPublicUrl(value, bucket) {
  if (!value) return null;

  const marker = `/storage/v1/object/public/${bucket}/`;
  const raw = String(value);
  const index = raw.indexOf(marker);

  if (index === -1) return null;

  return decodeURIComponent(raw.slice(index + marker.length).split(/[?#]/)[0]);
}

async function listAllObjects(bucket, prefix = "") {
  const objects = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(prefix, {
        limit: 1000,
        offset,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) throw error;
    if (!data?.length) break;

    for (const item of data) {
      const objectPath = prefix ? `${prefix}/${item.name}` : item.name;
      const isFolder = item.id === null || item.metadata === null;

      if (isFolder) {
        objects.push(...await listAllObjects(bucket, objectPath));
      } else {
        objects.push({
          bucket,
          path: objectPath,
          size: item.metadata?.size || 0,
          created_at: item.created_at,
          updated_at: item.updated_at,
        });
      }
    }

    if (data.length < 1000) break;
    offset += data.length;
  }

  return objects;
}

async function getPyqImageReferences() {
  const references = new Set();
  const select = PYQ_IMAGE_COLUMNS.join(",");
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("pyq_questions")
      .select(select)
      .range(from, from + pageSize - 1);

    if (error) throw error;

    for (const row of data || []) {
      for (const value of Object.values(row)) {
        const objectPath = objectPathFromPublicUrl(value, PYQ_BUCKET);
        if (objectPath) references.add(objectPath);
      }
    }

    if (!data || data.length < pageSize) break;
    from += pageSize;
  }

  return references;
}

async function getFormulaBookReferences() {
  const { data, error } = await supabase
    .from("formula_books")
    .select("file_name")
    .not("file_name", "is", null);

  if (error) throw error;

  return new Set((data || []).map((row) => String(row.file_name)).filter(Boolean));
}

function classifyObjects(objects, references) {
  const used = [];
  const orphaned = [];

  for (const object of objects) {
    if (references.has(object.path)) {
      used.push(object);
    } else {
      orphaned.push({
        ...object,
        reason: "Object path is not referenced by audited database URL/name fields.",
      });
    }
  }

  return { used, orphaned };
}

async function auditBucket(bucket, references) {
  const objects = await listAllObjects(bucket);
  const { used, orphaned } = classifyObjects(objects, references);
  const missingObjects = [...references].filter((reference) =>
    !objects.some((object) => object.path === reference)
  );

  return {
    bucket,
    active: references.size > 0,
    totals: {
      objects: objects.length,
      referenced: references.size,
      used: used.length,
      orphaned: orphaned.length,
      missingObjects: missingObjects.length,
    },
    orphaned,
    missingObjects,
  };
}

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase environment variables.");
  }

  const reports = [
    await auditBucket(PYQ_BUCKET, await getPyqImageReferences()),
    await auditBucket(FORMULA_BUCKET, await getFormulaBookReferences()),
  ];

  const report = {
    dryRun: DRY_RUN,
    generatedAt: new Date().toISOString(),
    reports,
  };

  await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await fs.writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);

  console.log(`Storage cleanup report written to ${REPORT_PATH}`);
  for (const entry of reports) {
    console.log(`${entry.bucket}: ${JSON.stringify(entry.totals)}`);
  }

  if (DRY_RUN) {
    console.log("DRY_RUN is true. No files were deleted.");
    return;
  }

  for (const entry of reports) {
    const paths = entry.orphaned.map((object) => object.path);
    for (let index = 0; index < paths.length; index += 100) {
      const chunk = paths.slice(index, index + 100);
      const { error } = await supabase.storage.from(entry.bucket).remove(chunk);
      if (error) throw error;
    }
  }

  console.log("DRY_RUN is false. Orphaned files were deleted.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
