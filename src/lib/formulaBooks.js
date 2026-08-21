import { supabase } from "./supabase";
import { supabase as supabaseServer } from "@/lib/supabase";
import { unstable_cache } from "next/cache";

const BUCKET_NAME = "formula-books";
const FORMULA_BOOK_SUMMARY_COLUMNS = [
  "id",
  "title",
  "subject",
  "stream",
].join(", ");

export const getCachedFormulaBookSummaries = unstable_cache(
  async () => {
    const { data, error } = await supabaseServer
      .from("formula_books")
      .select(FORMULA_BOOK_SUMMARY_COLUMNS)
      .order("stream", { ascending: true })
      .order("subject", { ascending: true })
      .order("title", { ascending: true });

    if (error) {
      console.error("[FORMULA_BOOKS_CACHE_ERROR]", error);
      return [];
    }

    return data || [];
  },
  ["formula-book-summaries"],
  {
    revalidate: 3600,
    tags: ["formula-books"],
  }
);

/**
 * Get all formula books
 */
export async function getFormulaBooks() {
  const res = await fetch("/api/formula-books");

  if (!res.ok) {
    throw new Error("Failed to fetch formula books.");
  }

  return res.json();
}

/**
 * Get one formula book by ID
 */
export async function getFormulaBook(id) {
  const res = await fetch(`/api/formula-books/${id}`);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const error = new Error(data.message || "Failed to fetch formula book.");
    error.status = res.status;
    error.code = data.error;
    error.upgradeUrl = data.upgradeUrl;
    throw error;
  }

  return res.json();
}

/**
 * Generate the public URL of a PDF stored in Supabase Storage.
 */
export function getPdfUrl(fileName) {
  if (!fileName) return null;

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return data.publicUrl;
}
