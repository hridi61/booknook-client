
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Book {
  _id: string;
  title: string;
  category: string;
  copies: number;
  addedBy: string;
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(
          "https://booknook-server-n74t.onrender.com/books"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch books");
        }

        const data: Book[] = await response.json();
        setBooks(data);
      } catch {
        setError("Unable to load books. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <main className="min-h-screen bg-base-200 px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-primary">
            All Books
          </h1>
          <p className="mt-3 text-base-content/70">
            Discover and explore books from our community.
          </p>
        </div>

        {loading && (
          <div className="text-center py-16">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="mt-3">Loading books...</p>
          </div>
        )}

        {error && (
          <p className="text-center text-error py-10">{error}</p>
        )}

        {!loading && !error && books.length === 0 && (
          <div className="text-center bg-base-100 rounded-xl p-12 shadow">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold">
              No Books Available
            </h2>
            <p className="mt-3 text-base-content/70">
              No books have been added yet. Please check back later.
            </p>
          </div>
        )}

        {!loading && !error && books.length > 0 && (
          <>
            <p className="mb-6 font-semibold">
              Total Books: {books.length}
            </p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((book) => (
                <div
                  key={book._id}
                  className="card bg-base-100 shadow-lg hover:shadow-xl transition"
                >
                  <div className="card-body">
                    <div className="text-5xl mb-2">📖</div>

                    <h2 className="card-title text-xl">
                      {book.title}
                    </h2>

                    <div className="badge badge-primary badge-outline">
                      {book.category}
                    </div>

                    <p className="mt-3">
                      Available Copies:{" "}
                      <span className="font-bold">{book.copies}</span>
                    </p>

                    <p className="text-sm text-base-content/60">
                      Added by: {book.addedBy}
                    </p>

                    <div className="card-actions justify-end mt-4">
                      <Link
                        href={`/books/${book._id}`}
                        className="btn btn-primary"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
