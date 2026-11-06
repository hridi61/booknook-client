
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface Book {
  _id: string;
  title: string;
  category: string;
  copies: number;
  addedBy: string;
}

export default function BookDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;

  const { data: session, isPending } = authClient.useSession();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [borrowing, setBorrowing] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data, error: tokenError } = await authClient.token();

        if (tokenError || !data?.token) {
          throw new Error("Please login again.");
        }

        const response = await fetch(
          `http://localhost:5000/books/${bookId}`,
          {
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to load book details."
          );
        }

        setBook(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load book details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchBook();
    }
  }, [bookId]);

  // Borrow Book
  const handleBorrow = async () => {
    if (!book || book.copies <= 0) {
      alert("No copies available.");
      return;
    }

    try {
      setBorrowing(true);

      const { data, error: tokenError } = await authClient.token();

      if (tokenError || !data?.token) {
        throw new Error("Please login first.");
      }

      const response = await fetch("http://localhost:5000/borrows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`,
        },
        body: JSON.stringify({
          bookId: book._id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to borrow book.");
      }

      setBook({
        ...book,
        copies: book.copies - 1,
      });

      alert("Book borrowed successfully!");
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setBorrowing(false);
    }
  };

  // Delete Book
  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this book?"
    );

    if (!confirmed) return;

    try {
      const { data, error: tokenError } = await authClient.token();

      if (tokenError || !data?.token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(
        `http://localhost:5000/books/${book._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete book.");
      }

      router.push("/books");
      router.refresh();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    }
  };

  if (isPending || loading) {
    return (
      <div className="text-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="mt-3">Loading book details...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="text-center py-20">
        <p className="text-error mb-4">
          {error || "Book not found."}
        </p>

        <Link href="/books" className="btn btn-primary">
          Back to All Books
        </Link>
      </div>
    );
  }

  const isOwner = session?.user?.email === book.addedBy;

  return (
    <main className="min-h-screen bg-base-200 px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="text-6xl text-center mb-4">📖</div>

            <h1 className="text-3xl font-bold text-primary text-center">
              {book.title}
            </h1>

            <div className="divider" />

            <p>
              <strong>Category:</strong> {book.category}
            </p>

            <p>
              <strong>Available Copies:</strong> {book.copies}
            </p>

            <p>
              <strong>Added By:</strong> {book.addedBy}
            </p>

            {/* Borrow Button */}
            {!isOwner && (
              <div className="flex justify-center mt-6">
                <button
                  className="btn btn-primary"
                  onClick={handleBorrow}
                  disabled={borrowing || book.copies <= 0}
                >
                  {borrowing
                    ? "Borrowing..."
                    : book.copies <= 0
                    ? "No Copies Available"
                    : "Borrow Book"}
                </button>
              </div>
            )}

            {/* Edit and Delete Buttons */}
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
                  onClick={handleDelete}
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
    </main>
  );
}
