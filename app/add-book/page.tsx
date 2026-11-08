
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function AddBookPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [copies, setCopies] = useState("1");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim() || !category.trim() || copies === "") {
      setError("Please fill in all fields.");
      return;
    }

    const copiesNumber = Number(copies);

    if (!Number.isInteger(copiesNumber) || copiesNumber < 0) {
      setError("Copies must be a valid non-negative number.");
      return;
    }

    setLoading(true);

    try {
      // Get JWT token from Better Auth
      const { data, error: tokenError } = await authClient.token();

      if (tokenError || !data?.token) {
        throw new Error("Please login first to add a book.");
      }

      // Send book information to Backend
      const response = await fetch("https://booknook-server-n74t.onrender.com/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          category: category.trim(),
          copies: copiesNumber,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add book.");
      }

      setSuccess("Book added successfully!");

      setTitle("");
      setCategory("");
      setCopies("1");

      setTimeout(() => {
        router.push("/books");
        router.refresh();
      }, 1000);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-base-200 px-6 py-12">
      <div className="max-w-xl mx-auto">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-primary">
            Add New Book
          </h1>

          <p className="mt-3 text-base-content/70">
            Share a new book with the BookNook community.
          </p>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">

            <form onSubmit={handleSubmit}>

              <div className="form-control mb-5">
                <label className="label">
                  <span className="label-text font-semibold">
                    Book Title
                  </span>
                </label>

                <input
                  type="text"
                  placeholder="Enter book title"
                  className="input input-bordered w-full"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-control mb-5">
                <label className="label">
                  <span className="label-text font-semibold">
                    Category
                  </span>
                </label>

                <input
                  type="text"
                  placeholder="Enter book category"
                  className="input input-bordered w-full"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>

              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text font-semibold">
                    Available Copies
                  </span>
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Enter number of copies"
                  className="input input-bordered w-full"
                  value={copies}
                  onChange={(e) => setCopies(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="alert alert-error mb-4">
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="alert alert-success mb-4">
                  <span>{success}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Adding Book...
                  </>
                ) : (
                  "Add Book"
                )}
              </button>

            </form>

          </div>
        </div>

      </div>
    </main>
  );
}
