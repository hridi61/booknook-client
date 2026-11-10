"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

const API_URL = "https://booknook-server-n74t.onrender.com";

interface Borrow {
  _id: string;
  bookId: string;
  bookTitle: string;
  bookImage?: string;
  borrowedBy: string;
  borrowedAt: string;
  returnDate?: string;
}

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
      className="h-48 w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export default function MyBorrowsPage() {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [returningId, setReturningId] = useState("");

  const fetchBorrows = async () => {
    try {
      setError("");

      const { data, error: tokenError } = await authClient.token();

      if (tokenError || !data?.token) {
        throw new Error("Please login first.");
      }

      const response = await fetch(`${API_URL}/borrows`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load borrowed books.");
      }

      setBorrows(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load borrowed books."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrows();
  }, []);

  const handleReturn = async (borrowId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to return this book?"
    );

    if (!confirmed) return;

    try {
      setReturningId(borrowId);

      const { data, error: tokenError } = await authClient.token();

      if (tokenError || !data?.token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(`${API_URL}/borrows/${borrowId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to return book.");
      }

      setBorrows((previous) =>
        previous.filter((borrow) => borrow._id !== borrowId)
      );

      toast.success("Book returned successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setReturningId("");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="mt-3">Loading your borrowed books...</p>
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
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-primary text-center mb-3">
          My Borrowed Books
        </h1>

        <p className="text-center mb-8">View and manage your borrowed books.</p>

        {borrows.length === 0 ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body text-center">
              <div className="text-6xl">📚</div>

              <h2 className="text-2xl font-bold">No Borrowed Books</h2>

              <p>You have not borrowed any books yet.</p>

              <div className="card-actions justify-center mt-4">
                <Link href="/books" className="btn btn-primary">
                  Browse Books
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {borrows.map((borrow) => {
              const overdue =
                borrow.returnDate &&
                new Date(borrow.returnDate).getTime() < Date.now();

              return (
                <div
                  key={borrow._id}
                  className="card bg-base-100 shadow-xl overflow-hidden"
                >
                  <figure>
                    <BookCover src={borrow.bookImage} title={borrow.bookTitle} />
                  </figure>

                  <div className="card-body">
                    <h2 className="card-title justify-center text-primary">
                      {borrow.bookTitle}
                    </h2>

                    <p>
                      <strong>Borrowed On:</strong>{" "}
                      {new Date(borrow.borrowedAt).toLocaleDateString()}
                    </p>

                    {borrow.returnDate && (
                      <p>
                        <strong>Return By:</strong>{" "}
                        {new Date(borrow.returnDate).toLocaleDateString()}{" "}
                        {overdue && (
                          <span className="badge badge-error">Overdue</span>
                        )}
                      </p>
                    )}

                    <div className="card-actions justify-center mt-4">
                      <Link
                        href={`/books/${borrow.bookId}`}
                        className="btn btn-outline"
                      >
                        View Book
                      </Link>

                      <button
                        className="btn btn-success"
                        onClick={() => handleReturn(borrow._id)}
                        disabled={returningId === borrow._id}
                      >
                        {returningId === borrow._id
                          ? "Returning..."
                          : "Return Book"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}