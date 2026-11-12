"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import PrivateRoute from "@/app/components/PrivateRoute";

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

function Cover({ src, title }: { src?: string; title: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className="text-3xl w-12 text-center shrink-0">📖</div>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`Cover of ${title}`}
      className="h-16 w-12 shrink-0 rounded object-cover shadow"
      onError={() => setFailed(true)}
    />
  );
}

function MyBorrowsContent() {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [returnTarget, setReturnTarget] = useState<Borrow | null>(null);
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    const fetchBorrows = async () => {
      try {
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

    fetchBorrows();
  }, []);

  // Confirm return (called from the modal)
  const handleReturn = async () => {
    if (!returnTarget) return;

    try {
      setReturning(true);

      const { data, error: tokenError } = await authClient.token();

      if (tokenError || !data?.token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(`${API_URL}/borrows/${returnTarget._id}`, {
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
        previous.filter((borrow) => borrow._id !== returnTarget._id)
      );

      toast.success("Book returned successfully!");
      setReturnTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      setReturnTarget(null);
    } finally {
      setReturning(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="mt-3">Loading your borrowed books...</p>
        <p className="mt-1 text-sm text-base-content/60">
          The first load can take up to a minute while the server wakes up.
        </p>
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
          <div className="card bg-base-100 shadow-xl">
            <div className="overflow-x-auto">
              <table className="table min-w-[680px]">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th className="whitespace-nowrap">Borrowed On</th>
                    <th className="whitespace-nowrap">Return By</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {borrows.map((borrow) => {
                    const overdue =
                      borrow.returnDate &&
                      new Date(borrow.returnDate).getTime() < Date.now();

                    return (
                      <tr key={borrow._id}>
                        <td>
                          <div className="flex items-center gap-3 min-w-[180px]">
                            <Cover
                              src={borrow.bookImage}
                              title={borrow.bookTitle}
                            />
                            <span className="font-semibold text-primary">
                              {borrow.bookTitle}
                            </span>
                          </div>
                        </td>

                        <td className="whitespace-nowrap">
                          {new Date(borrow.borrowedAt).toLocaleDateString()}
                        </td>

                        <td className="whitespace-nowrap">
                          {borrow.returnDate
                            ? new Date(borrow.returnDate).toLocaleDateString()
                            : "N/A"}
                        </td>

                        <td>
                          {overdue ? (
                            <span className="badge badge-error whitespace-nowrap">
                              Overdue
                            </span>
                          ) : (
                            <span className="badge badge-success badge-soft whitespace-nowrap">
                              On time
                            </span>
                          )}
                        </td>

                        <td>
                          <div className="flex justify-end gap-2 whitespace-nowrap">
                            <Link
                              href={`/books/${borrow.bookId}`}
                              className="btn btn-outline btn-sm"
                            >
                              View Book
                            </Link>

                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => setReturnTarget(borrow)}
                            >
                              Return Book
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Return confirmation modal */}
      {returnTarget && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-xl text-primary">Return this book?</h3>

            <p className="mt-3">
              You are returning <strong>{returnTarget.bookTitle}</strong>. It
              will become available for other readers again.
            </p>

            <div className="modal-action">
              <button
                className="btn btn-outline"
                onClick={() => setReturnTarget(null)}
                disabled={returning}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={handleReturn}
                disabled={returning}
              >
                {returning ? "Returning..." : "Yes, Return"}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => !returning && setReturnTarget(null)}
          />
        </dialog>
      )}
    </main>
  );
}

export default function MyBorrowsPage() {
  return (
    <PrivateRoute>
      <MyBorrowsContent />
    </PrivateRoute>
  );
}