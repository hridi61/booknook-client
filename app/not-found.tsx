import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-base-200 px-6 py-16">
      <div className="card bg-base-100 shadow-xl w-full max-w-lg">
        <div className="card-body items-center text-center">
          <div className="text-7xl">📚</div>

          <h1 className="text-6xl font-bold text-primary mt-2">404</h1>

          <h2 className="text-2xl font-semibold">Page not found</h2>

          <p className="text-base-content/70 mt-2">
            The page you are looking for does not exist, or the book may have
            been moved or removed.
          </p>

          <div className="card-actions justify-center mt-6">
            <Link href="/" className="btn btn-primary">
              Back to Home
            </Link>

            <Link href="/books" className="btn btn-outline">
              Browse Books
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}