"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Book {
  _id: string;
  title: string;
  author?: string;
  category: string;
  coverImage?: string;
  totalCopies?: number;
  copies: number;
  addedBy: string;
  addedByName?: string;
}

const API_URL = "https://booknook-server-n74t.onrender.com";

function BookCover({ src, title }: { src?: string; title: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className="text-5xl text-center py-10">📖</div>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`Cover of ${title}`}
      className="h-56 w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Read ?category=Fiction from the page URL
        const selected =
          new URLSearchParams(window.location.search).get("category") ?? "";
        setCategory(selected);

        const query = selected
          ? `?sort=newest&category=${encodeURIComponent(selected)}`
          : "?sort=newest";

        const response = await fetch(`${API_URL}/books${query}`);

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
            {category ? `${category} Books` : "All Books"}
          </h1>
          <p className="mt-3 text-base-content/70">
            Discover and explore books from our community.
          </p>

          {category && (
            <Link href="/books" className="btn btn-outline btn-sm mt-4">
              Show all books
            </Link>
          )}
        </div>

        {loading && (
          <div className="text-center py-16">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="mt-3">Loading books...</p>
            <p className="mt-1 text-sm text-base-content/60">
              The first load can take up to a minute while the server wakes up.
            </p>
          </div>
        )}

        {error && <p className="text-center text-error py-10">{error}</p>}

        {!loading && !error && books.length === 0 && (
          <div className="text-center bg-base-100 rounded-xl p-12 shadow">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold">No Books Available</h2>
            <p className="mt-3 text-base-content/70">
              {category
                ? `No ${category} books yet. Try another category.`
                : "No books have been added yet. Please check back later."}
            </p>
          </div>
        )}

        {!loading && !error && books.length > 0 && (
          <>
            <p className="mb-6 font-semibold">Total Books: {books.length}</p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((book) => (
                <div
                  key={book._id}
                  className="card bg-base-100 shadow-lg hover:shadow-xl transition overflow-hidden"
                >
                  <figure>
                    <BookCover src={book.coverImage} title={book.title} />
                  </figure>

                  <div className="card-body">
                    <h2 className="card-title text-xl">{book.title}</h2>

                    {book.author && (
                      <p className="text-base-content/70">by {book.author}</p>
                    )}

                    <div className="badge badge-primary badge-outline">
                      {book.category}
                    </div>

                    <p className="mt-3">
                      Available:{" "}
                      <span className="font-bold">
                        {book.copies}
                        {typeof book.totalCopies === "number" &&
                          ` / ${book.totalCopies}`}
                      </span>
                    </p>

                    <p className="text-sm text-base-content/60">
                      Added by: {book.addedByName || book.addedBy}
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