
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface Book {
  _id: string;
  title: string;
  category: string;
  copies: number;
  addedBy: string;
}

const API_URL = "https://booknook-server-n74t.onrender.com";

function EditBookContent() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [copies, setCopies] = useState("1");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data, error: tokenError } = await authClient.token();

        if (tokenError || !data?.token) {
          throw new Error("Please login again.");
        }

        const response = await fetch(
          `${API_URL}/books/${bookId}`,
          {
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to load book.");
        }

        const book: Book = result;

        setTitle(book.title);
        setCategory(book.category);
        setCopies(String(book.copies));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load book."
        );
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchBook();
    }
  }, [bookId]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !category.trim() || copies === "") {
      setError("Please fill in all fields.");
      return;
    }

    const copiesNumber = Number(copies);

    if (!Number.isInteger(copiesNumber) || copiesNumber < 0) {
      setError("Copies must be a valid non-negative number.");
      return;
    }

    setSaving(true);

    try {
      const { data, error: tokenError } = await authClient.token();

      if (tokenError || !data?.token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(
        `${API_URL}/books/${bookId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            category: category.trim(),
            copies: copiesNumber,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update book.");
      }

      router.push(`/books/${bookId}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="mt-3">Loading book...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-base-200 px-6 py-12">
      <div className="max-w-xl mx-auto">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="text-3xl font-bold text-primary text-center">
              Edit Book
            </h1>

            {error && (
              <p className="text-error text-center">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Title</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    Category
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    Available Copies
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="input input-bordered w-full"
                  value={copies}
                  onChange={(e) => setCopies(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-3 justify-center pt-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Updating..." : "Update Book"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => router.push(`/books/${bookId}`)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function EditBookPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-20">
          Loading...
        </div>
      }
    >
      <EditBookContent />
    </Suspense>
  );
}
