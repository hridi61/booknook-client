"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import PrivateRoute from "@/app/components/PrivateRoute";

interface Book {
  _id: string;
  title: string;
  author?: string;
  category: string;
  description?: string;
  coverImage?: string;
  totalCopies?: number;
  copies: number;
  addedBy: string;
  addedByName?: string;
}

const API_URL = "https://booknook-server-n74t.onrender.com";
const BORROW_DAYS = 7; // the server sets the return date 7 days after borrowing

function BookDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;

  const { data: session, isPending } = authClient.useSession();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [borrowing, setBorrowing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch book details
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data, error: tokenError } = await authClient.token();

        if (tokenError || !data?.token) {
          throw new Error("Please login again.");
        }

        const response = await fetch(`${API_URL}/books/${bookId}`, {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to load book details.");
        }

        setBook(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load book details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchBook();
    }
  }, [bookId]);

  // Confirm borrow (called from the modal)
  const handleBorrow = async () => {
    const currentBook = book;

    if (!currentBook || currentBook.copies <= 0) {
      toast.error("This book is not available right now.");
      setShowBorrowModal(false);
      return;
    }

    try {
      setBorrowing(true);

      const { data, error: tokenError } = await authClient.token();

      if (tokenError || !data?.token) {
        throw new Error("Please login first.");
      }

      const response = await fetch(`${API_URL}/borrows`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`,
        },
        body: JSON.stringify({
          bookId: currentBook._id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // For example: "You have already borrowed this book"
        throw new Error(result.message || "Failed to borrow book.");
      }

      setBook({
        ...currentBook,
        copies: currentBook.copies - 1,
      });

      setShowBorrowModal(false);
      toast.success("Book borrowed successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      setShowBorrowModal(false);
    } finally {
      setBorrowing(false);
    }
  };

  // Confirm delete (called from the modal)
  const handleDelete = async () => {
    const currentBook = book;

    if (!currentBook) return;

    try {
      setDeleting(true);

      const { data, error: tokenError } = await authClient.token();

      if (tokenError || !data?.token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(`${API_URL}/books/${currentBook._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete book.");
      }

      toast.success("Book deleted successfully!");
      router.push("/books");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="text-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="mt-3">Loading book details...</p>
        <p className="mt-1 text-sm text-base-content/60">
          The first load can take up to a minute while the server wakes up.
        </p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="text-center py-20">
        <p className="text-error mb-4">{error || "Book not found."}</p>

        <Link href="/books" className="btn btn-primary">
          Back to All Books
        </Link>
      </div>
    );
  }

  const isOwner = session?.user?.email === book.addedBy;
  const showImage = Boolean(book.coverImage) && !imageFailed;
  const available = book.copies > 0;

  const returnDate = new Date(
    Date.now() + BORROW_DAYS * 24 * 60 * 60 * 1000
  ).toLocaleDateString();

  return (
    <main className="min-h-screen bg-base-200 px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {showImage ? (
              <div className="flex justify-center mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={book.coverImage}
                  alt={`Cover of ${book.title}`}
                  className="h-64 w-auto rounded-lg object-cover shadow"
                  onError={() => setImageFailed(true)}
                />
              </div>
            ) : (
              <div className="text-6xl text-center mb-4">📖</div>
            )}

            <h1 className="text-3xl font-bold text-primary text-center">
              {book.title}
            </h1>

            {book.author && (
              <p className="text-center text-base-content/70">
                by {book.author}
              </p>
            )}

            <div className="divider" />

            <p>
              <strong>Category:</strong> {book.category}
            </p>

            <p>
              <strong>Available Copies:</strong> {book.copies}
              {typeof book.totalCopies === "number" && ` of ${book.totalCopies}`}
            </p>

            <p>
              <strong>Added By:</strong>{" "}
              {book.addedByName
                ? `${book.addedByName} (${book.addedBy})`
                : book.addedBy}
            </p>

            {book.description && (
              <div className="mt-2">
                <strong>Description:</strong>
                <p className="mt-1 whitespace-pre-line text-base-content/80">
                  {book.description}
                </p>
              </div>
            )}

            {/* Borrow button (not for the owner) */}
            {!isOwner && (
              <div className="flex justify-center mt-6">
                {available ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowBorrowModal(true)}
                  >
                    Borrow Book
                  </button>
                ) : (
                  <button className="btn btn-disabled" disabled>
                    Not Available
                  </button>
                )}
              </div>
            )}

            {/* Edit and Delete buttons (owner only) */}
            {isOwner && (
              <div className="card-actions justify-center mt-6">
                <Link
                  href={`/books/${book._id}/edit`}
                  className="btn btn-warning"
                >
                  Edit Book
                </Link>

                <button
                  className="btn btn-error"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete Book
                </button>
              </div>
            )}

            <div className="text-center mt-6">
              <Link href="/books" className="btn btn-outline">
                Back to All Books
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Borrow confirmation modal */}
      {showBorrowModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-xl text-primary">Confirm Borrow</h3>

            <div className="flex gap-4 mt-4">
              {showImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={book.coverImage}
                  alt={`Cover of ${book.title}`}
                  className="h-28 w-auto rounded object-cover shadow"
                />
              ) : (
                <div className="text-5xl">📖</div>
              )}

              <div>
                <p className="font-semibold">{book.title}</p>
                {book.author && (
                  <p className="text-sm text-base-content/70">
                    by {book.author}
                  </p>
                )}
                <p className="mt-2 text-sm">
                  <strong>Return by:</strong> {returnDate}
                </p>
                <p className="text-sm">
                  <strong>Copies left after borrowing:</strong>{" "}
                  {book.copies - 1}
                </p>
              </div>
            </div>

            <div className="modal-action">
              <button
                className="btn btn-outline"
                onClick={() => setShowBorrowModal(false)}
                disabled={borrowing}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleBorrow}
                disabled={borrowing}
              >
                {borrowing ? "Borrowing..." : "Confirm Borrow"}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => !borrowing && setShowBorrowModal(false)}
          />
        </dialog>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-xl text-error">Delete this book?</h3>
            <p className="mt-3">
              <strong>{book.title}</strong> and its borrow records will be
              removed. This cannot be undone.
            </p>

            <div className="modal-action">
              <button
                className="btn btn-outline"
                onClick={() => setShowDeleteModal(false)}
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
            onClick={() => !deleting && setShowDeleteModal(false)}
          />
        </dialog>
      )}
    </main>
  );
}

export default function BookDetailsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <PrivateRoute>
        <BookDetailsContent />
      </PrivateRoute>
    </Suspense>
  );
}