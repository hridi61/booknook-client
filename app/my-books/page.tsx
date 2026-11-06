
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

interface Book {
  _id: string;
  title: string;
  category: string;
  copies: number;
  addedBy: string;
}

export default function MyBooksPage() {
  const { data: session, isPending } = authClient.useSession();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyBooks = async () => {
      try {
        const { data, error: tokenError } = await authClient.token();

        if (tokenError || !data?.token) {
          throw new Error("Please login first.");
        }

        const response = await fetch("http://localhost:5000/books", {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to load books.");
        }

        const myBooks = result.filter(
          (book: Book) => book.addedBy === session?.user?.email
        );

        setBooks(myBooks);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your books."
        );
      } finally {
        setLoading(false);
      }
    };

    if (!isPending && session?.user?.email) {
      fetchMyBooks();
    } else if (!isPending && !session?.user?.email) {
      setError("Please login to view your books.");
      setLoading(false);
    }
  }, [isPending, session?.user?.email]);

  if (isPending || loading) {
    return (
      <div className="text-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="mt-3">Loading your books...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-error mb-4">{error}</p>
        <Link href="/books" className="btn btn-primary">
          Browse Books
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-base-200 px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-primary text-center mb-3">
          My Books
        </h1>

        <p className="text-center mb-8">
          Manage the books you have added to BookNook.
        </p>

        <p className="text-center font-semibold mb-6">
          Total My Books: {books.length}
        </p>

        {books.length === 0 ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body text-center">
              <div className="text-6xl">📚</div>

              <h2 className="text-2xl font-bold">
                No Books Added Yet
              </h2>

              <p>You have not added any books.</p>

              <div className="card-actions justify-center mt-4">
                <Link href="/add-book" className="btn btn-primary">
                  Add Your First Book
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <div
                key={book._id}
                className="card bg-base-100 shadow-xl"
              >
                <div className="card-body">
                  <div className="text-5xl text-center">📖</div>

                  <h2 className="card-title justify-center text-primary">
                    {book.title}
                  </h2>

                  <p>
                    <strong>Category:</strong> {book.category}
                  </p>

                  <p>
                    <strong>Available Copies:</strong> {book.copies}
                  </p>

                  <div className="card-actions justify-center mt-4">
                    <Link
                      href={`/books/${book._id}`}
                      className="btn btn-primary"
                    >
                      View Details
                    </Link>

                    <Link
                      href={`/books/${book._id}/edit`}
                      className="btn btn-warning"
                    >
                      Edit Book
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
