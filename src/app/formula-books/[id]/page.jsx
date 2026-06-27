"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getFormulaBook, getPdfUrl } from "@/lib/formulaBooks";

export default function FormulaBookPage() {
  const { id } = useParams();
  const router = useRouter();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBook() {
      try {
        const data = await getFormulaBook(id);
        setBook(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadBook();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-lg">
        Loading Formula Book...
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-semibold">Formula Book Not Found</h2>

        <button
          onClick={() => router.back()}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">

        <div>
          <h1 className="text-2xl font-bold">{book.title}</h1>

          <p className="text-gray-500">
            {book.subject} • {book.pages} Pages
          </p>
        </div>

        <button
          onClick={() => router.back()}
          className="rounded-lg bg-gray-900 px-5 py-2 text-white hover:bg-black"
        >
          Back
        </button>

      </div>

      {/* PDF */}
      <iframe
        src={getPdfUrl(book.file_name)}
        title={book.title}
        className="h-[calc(100vh-80px)] w-full"
      />
    </div>
  );
}