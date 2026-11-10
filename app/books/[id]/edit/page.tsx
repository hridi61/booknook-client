"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

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
}

const API_URL = "https://booknook-server-n74t.onrender.com";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

function EditBookContent() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newPreview, setNewPreview] = useState("");
  const [copies, setCopies] = useState<number | null>(null);
  const [totalCopies, setTotalCopies] = useState<number | null>(null);

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

        const response = await fetch(`${API_URL}/books/${bookId}`, {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to load book.");
        }

        const book: Book = result;

        setTitle(book.title ?? "");
        setAuthor(book.author ?? "");
        setCategory(book.category ?? "");
        setDescription(book.description ?? "");
        setCoverImage(book.coverImage ?? "");
        setCopies(book.copies);
        setTotalCopies(
          typeof book.totalCopies === "number" ? book.totalCopies : null
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load book.");
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchBook();
    }
  }, [bookId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      setNewImage(null);
      setNewPreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image must be smaller than 5MB.");
      e.target.value = "";
      return;
    }

    setNewImage(file);
    setNewPreview(URL.createObjectURL(file));
  };

  const uploadToImgbb = async (file: File): Promise<string> => {
    const key = process.env.NEXT_PUBLIC_IMGBB_KEY;

    if (!key) {
      throw new Error("Image upload is not configured (missing imgbb key).");
    }

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
      method: "POST",
      body: formData,
    });

    const json = await res.json();

    if (!res.ok || !json?.success || !json?.data?.url) {
      throw new Error("Image upload failed. Please try again.");
    }

    return json.data.url as string;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (
      !title.trim() ||
      !author.trim() ||
      !category.trim() ||
      !description.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Saving changes...");

    try {
      // Keep the current cover unless a new file was chosen
      let finalImage = coverImage;

      if (newImage) {
        toast.loading("Uploading cover image...", { id: toastId });
        finalImage = await uploadToImgbb(newImage);
        toast.loading("Saving changes...", { id: toastId });
      }

      const { data, error: tokenError } = await authClient.token();

      if (tokenError || !data?.token) {
        throw new Error("Please login again.");
      }

      // The server does not allow editing copies or totalCopies.
      const body: Record<string, string> = {
        title: title.trim(),
        author: author.trim(),
        category: category.trim(),
        description: description.trim(),
      };

      if (finalImage) {
        body.coverImage = finalImage;
      }

      const response = await fetch(`${API_URL}/books/${bookId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update book.");
      }

      toast.success("Book updated successfully!", { id: toastId });

      router.push(`/books/${bookId}`);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      toast.error(message, { id: toastId });
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

  const shownImage = newPreview || coverImage;

  return (
    <main className="min-h-screen bg-base-200 px-6 py-12">
      <div className="max-w-xl mx-auto">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="text-3xl font-bold text-primary text-center">
              Edit Book
            </h1>

            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
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
                  <span className="label-text font-semibold">Author</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Category</span>
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
                  <span className="label-text font-semibold">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full h-28"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Cover Image</span>
                </label>
                {shownImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={shownImage}
                    alt="Cover preview"
                    className="mb-3 h-48 w-auto rounded-lg object-cover"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered w-full"
                  onChange={handleImageChange}
                />
                <p className="mt-1 text-sm text-base-content/60">
                  Leave empty to keep the current cover.
                </p>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Copies</span>
                </label>
                <p className="text-base-content/80">
                  {copies !== null ? `${copies} available` : "N/A"}
                  {totalCopies !== null && ` of ${totalCopies} total`}
                </p>
                <p className="mt-1 text-sm text-base-content/60">
                  Copies change automatically when books are borrowed and
                  returned.
                </p>
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
                  disabled={saving}
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
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <EditBookContent />
    </Suspense>
  );
}