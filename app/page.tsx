"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-base-100">
      <nav className="navbar bg-base-100 shadow-md px-6">
        <div className="flex-1">
          <Link href="/" className="text-2xl font-bold text-primary">
            📚 BookNook
          </Link>
        </div>

        <div className="flex gap-3">
          <Link href="/login" className="btn btn-ghost">
            Login
          </Link>
          <Link href="/register" className="btn btn-primary">
            Register
          </Link>
        </div>
      </nav>

      <section className="hero min-h-[75vh] bg-base-200">
        <div className="hero-content flex-col lg:flex-row-reverse gap-12">
          <div className="text-8xl">📚</div>

          <div>
            <p className="text-primary font-semibold mb-3">
              Welcome to BookNook
            </p>

            <h1 className="text-5xl font-bold leading-tight">
              Discover Your Next Favorite Book
            </h1>

            <p className="py-6 text-lg">
              Explore amazing books, share your collection, and borrow books
              from other readers. Your next reading adventure starts here!
            </p>

            <Link href="/books" className="btn btn-primary btn-lg">
              Explore Books
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-10">Why Choose BookNook?</h2>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          <div className="card bg-base-200 shadow-md p-6">
            <div className="text-4xl">📖</div>
            <h3 className="text-xl font-bold mt-3">Discover Books</h3>
            <p>Find books from different categories and genres.</p>
          </div>

          <div className="card bg-base-200 shadow-md p-6">
            <div className="text-4xl">🤝</div>
            <h3 className="text-xl font-bold mt-3">Borrow Books</h3>
            <p>Borrow books and enjoy reading with ease.</p>
          </div>

          <div className="card bg-base-200 shadow-md p-6">
            <div className="text-4xl">📚</div>
            <h3 className="text-xl font-bold mt-3">Share Books</h3>
            <p>Add your own books and share them with readers.</p>
          </div>
        </div>
      </section>

      <footer className="footer footer-center bg-neutral text-neutral-content p-6">
        <p>Copyright © 2026 BookNook. All rights reserved.</p>
      </footer>
    </main>
  );
}