"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import PrivateRoute from "@/app/components/PrivateRoute";

interface Book {
  _id: string;
  title: string;
  author?: string;
  category: string;
  coverImage?: string;
  totalCopies?: number;
  copies: number;
  addedBy: string;
}

const API_URL = "https://booknook-server-n74t.onrender.com";

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

function MyBooksContent() {
  const { data: session, isPending } = authClient.useSession();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchMyBooks = async () => {
      try {
        const email = session?.user?.email;

        if (!email) {
          throw new Error("Please login first.");
        }

        // The server filters by the addedBy query parameter
        const response = await fetch(
          `${API_URL}/books?addedBy=${encodeURIComponent(email)}&sort=newest`
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to load books.");
        }

        setBooks(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load your books."
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

  // Confirm delete (called from the modal)
  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      const { data, error: tokenError } = await authClient.token();

      if (tokenError || !data?.token) {
        throw new Error("Please login first.");
      }

      const response = await fetch(`${API_URL}/books/${deleteTarget._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete book.");
      }

      setBooks((previousBooks) =>
        previousBooks.filter((book) => book._id !== deleteTarget._id)
      );

      toast.success("Book deleted successfully!");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to delete book.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="text-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="mt-3">Loading your books...</p>
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
              <h2 className="text-2xl font-bold">No Books Added Yet</h2>
              <p>You have not added any books.</p>

              <div className="card-actions justify-center mt-4">
                <Link href="/add-book" className="btn btn-primary">
                  Add Your First Book
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="card bg-base-100 shadow-xl">
            <div className="overflow-x-auto">
              <table className="table min-w-[760px]">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Category</th>
                    <th className="whitespace-nowrap">Available Copies</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {books.map((book) => (
                    <tr key={book._id}>
                      <td>
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <Cover src={book.coverImage} title={book.title} />
                          <div>
                            <p className="font-semibold text-primary">
                              {book.title}
                            </p>
                            {book.author && (
                              <p className="text-sm text-base-content/70">
                                by {book.author}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="badge badge-primary badge-outline whitespace-nowrap">
                          {book.category}
                        </span>
                      </td>

                      <td className="whitespace-nowrap">
                        {book.copies}
                        {typeof book.totalCopies === "number" &&
                          ` of ${book.totalCopies}`}
                      </td>

                      <td>
                        <div className="flex justify-end gap-2 whitespace-nowrap">
                          <Link
                            href={`/books/${book._id}`}
                            className="btn btn-primary btn-sm"
                          >
                            View
                          </Link>

                          <Link
                            href={`/books/${book._id}/edit`}
                            className="btn btn-warning btn-sm"
                          >
                            Edit
                          </Link>

                          <button
                            className="btn btn-error btn-sm"
                            onClick={() => setDeleteTarget(book)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-xl text-error">Delete this book?</h3>

            <p className="mt-3">
              <strong>{deleteTarget.title}</strong> and its borrow records will
              be removed. This cannot be undone.
            </p>

            <div className="modal-action">
              <button
                className="btn btn-outline"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => !deleting && setDeleteTarget(null)}
          />
        </dialog>
      )}
    </main>
  );
}

export default function MyBooksPage() {
  return (
    <PrivateRoute>
      <MyBooksContent />
    </PrivateRoute>
  );
}