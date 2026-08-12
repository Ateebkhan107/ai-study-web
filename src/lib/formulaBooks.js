import { supabase } from "./supabase";

const BUCKET_NAME = "formula-books";

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
