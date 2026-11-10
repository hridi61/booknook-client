"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

const API_URL = "https://booknook-server-n74t.onrender.com";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export default function AddBookPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [totalCopies, setTotalCopies] = useState("1");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      setImageFile(null);
      setPreview("");
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

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // Upload the cover image to imgbb and return its public URL
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

    if (!imageFile) {
      setError("Please choose a cover image.");
      return;
    }

    const copiesNumber = Number(totalCopies);

    // The server requires at least 1 copy
    if (!Number.isInteger(copiesNumber) || copiesNumber < 1) {
      setError("Total copies must be a whole number of at least 1.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Uploading cover image...");

    try {
      const coverImage = await uploadToImgbb(imageFile);

      toast.loading("Saving book...", { id: toastId });

      // Get JWT token from Better Auth
      const { data, error: tokenError } = await authClient.token();

      if (tokenError || !data?.token) {
        throw new Error("Please log in first to add a book.");
      }

      const response = await fetch(`${API_URL}/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
          category: category.trim(),
          description: description.trim(),
          coverImage,
          totalCopies: copiesNumber,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add book.");
      }

      toast.success("Book added successfully!", { id: toastId });

      router.push("/books");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-base-200 px-6 py-12">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-primary">Add New Book</h1>

          <p className="mt-3 text-base-content/70">
            Share a new book with the BookNook community.
          </p>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-control mb-5">
                <label className="label">
                  <span className="label-text font-semibold">Book Title</span>
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
                  <span className="label-text font-semibold">Author</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter author name"
                  className="input input-bordered w-full"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                />
              </div>

              <div className="form-control mb-5">
                <label className="label">
                  <span className="label-text font-semibold">Category</span>
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

              <div className="form-control mb-5">
                <label className="label">
                  <span className="label-text font-semibold">Description</span>
                </label>
                <textarea
                  placeholder="Write a short description"
                  className="textarea textarea-bordered w-full h-28"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-control mb-5">
                <label className="label">
                  <span className="label-text font-semibold">Cover Image</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered w-full"
                  onChange={handleImageChange}
                />
                {preview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt="Cover preview"
                    className="mt-3 h-48 w-auto rounded-lg object-cover"
                  />
                )}
              </div>

              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text font-semibold">Total Copies</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Enter number of copies"
                  className="input input-bordered w-full"
                  value={totalCopies}
                  onChange={(e) => setTotalCopies(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="alert alert-error mb-4">
                  <span>{error}</span>
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