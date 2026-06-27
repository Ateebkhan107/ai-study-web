export async function getFormulaBooks() {
  const res = await fetch("/api/formula-books");

  if (!res.ok) throw new Error("Failed");

  return res.json();
}

export async function getFormulaBook(id) {
  const res = await fetch(`/api/formula-books/${id}`);

  if (!res.ok) throw new Error("Failed");

  return res.json();
}

export function getPdfUrl(fileName) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/formula-books/${fileName}`;
}