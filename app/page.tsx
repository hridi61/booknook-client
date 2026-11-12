"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

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

const slides = [
  {
    title: "Add a book, borrow a book, return a book",
    subtitle: "Your small online library, open all day.",
    button: "Browse Books",
    href: "/books",
    icon: "📚",
    bg: "bg-blue-100",
    heading: "text-blue-800",
  },
  {
    title: "Discover Your Next Favorite Book",
    subtitle: "Explore stories, knowledge and adventures.",
    button: "Explore Collection",
    href: "/books",
    icon: "🔍",
    bg: "bg-violet-100",
    heading: "text-violet-800",
  },
  {
    title: "Share Books With Everyone",
    subtitle: "Add your books and connect with readers.",
    button: "Add a Book",
    href: "/add-book",
    icon: "🤝",
    bg: "bg-emerald-100",
    heading: "text-emerald-800",
  },
];

const categories = ["Fiction", "Science", "History", "Kids", "Others"];

const steps = [
  {
    icon: "🔍",
    title: "Find a book",
    text: "Explore books from different categories.",
    button: "Browse Books",
    href: "/books",
  },
  {
    icon: "📚",
    title: "Borrow it",
    text: "Borrow your favorite book with ease.",
    button: "Choose a Book",
    href: "/books",
  },
  {
    icon: "↩️",
    title: "Return it",
    text: "Return the book after reading.",
    button: "My Borrows",
    href: "/my-borrows",
  },
];

function BookCover({ src, title }: { src?: string; title: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <span className="text-6xl">📖</span>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`Cover of ${title}`}
      className="h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

function HeroSlide({ slide }: { slide: (typeof slides)[number] }) {
  return (
    <div
      className={`${slide.bg} text-center px-6 pt-16 pb-20 md:pt-20 md:pb-24`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-5xl mb-4">{slide.icon}</div>

        <h1 className={`text-3xl md:text-5xl font-bold ${slide.heading}`}>
          {slide.title}
        </h1>

        <p className="text-lg md:text-xl text-gray-600 mt-4">
          {slide.subtitle}
        </p>

        <Link href={slide.href} className="btn btn-primary mt-6">
          {slide.button}
        </Link>
      </div>
    </div>
  );
}

// Swiper is only mounted in the browser. Before that (build and server render)
// the first slide is shown as plain static content, so the page does not jump.
function HeroCarousel() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <HeroSlide slide={slides[0]} />;
  }

  return (
    <Swiper
      modules={[Autoplay, Pagination, Keyboard]}
      slidesPerView={1}
      loop
      keyboard={{ enabled: true }}
      autoplay={{
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      pagination={{ clickable: true }}
      style={
        {
          "--swiper-pagination-color": "#2563eb",
          "--swiper-pagination-bullet-inactive-color": "#6b7280",
          "--swiper-pagination-bullet-inactive-opacity": "0.5",
        } as React.CSSProperties
      }
    >
      {slides.map((slide) => (
        <SwiperSlide key={slide.title}>
          <HeroSlide slide={slide} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch the 6 newest books (public route, no token needed)
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(`${API_URL}/books?sort=newest&limit=6`);

        if (!response.ok) {
          throw new Error("Failed to load books");
        }

        const result = await response.json();

        setBooks(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error("Error loading books:", err);
        setError("Unable to load new arrivals right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <main className="min-h-screen bg-base-100">
      {/* Hero carousel (Swiper) */}
      <section>
        <HeroCarousel />
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold text-center mb-8">New arrivals</h2>

        {loading ? (
          <div className="text-center py-10">
            <span className="loading loading-spinner loading-lg text-primary" />
            <p className="mt-3">Loading books...</p>
            <p className="mt-1 text-sm text-gray-500">
              The first load can take up to a minute while the server wakes up.
            </p>
          </div>
        ) : error ? (
          <p className="text-center text-error py-10">{error}</p>
        ) : books.length === 0 ? (
          <div className="text-center py-10">
            <p>No books available yet.</p>
            <Link href="/add-book" className="btn btn-primary mt-4">
              Add Your First Book
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {books.map((book) => (
              <div
                key={book._id}
                className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-lg transition overflow-hidden"
              >
                <figure className="bg-violet-100 h-40">
                  <BookCover src={book.coverImage} title={book.title} />
                </figure>

                <div className="card-body p-4">
                  <h3 className="card-title text-lg">{book.title}</h3>

                  {book.author && (
                    <p className="text-sm text-gray-500">by {book.author}</p>
                  )}

                  <div className="badge badge-success badge-soft">
                    {book.category}
                  </div>

                  <p className="text-sm">
                    Available Copies: {book.copies}
                    {typeof book.totalCopies === "number" &&
                      ` of ${book.totalCopies}`}
                  </p>

                  <Link
                    href={`/books/${book._id}`}
                    className="btn btn-outline btn-sm w-full mt-2"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/books" className="btn btn-primary">
            See All Books
          </Link>
        </div>
      </section>

      {/* How Borrowing Works */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-center mb-8">
          How borrowing works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map((step) => (
            <Link
              key={step.title}
              href={step.href}
              className="card bg-base-200 p-6 text-center hover:shadow-lg transition"
            >
              <div className="text-4xl mb-3">{step.icon}</div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-gray-500 mt-2">{step.text}</p>
              <span className="btn btn-outline btn-sm mt-4">{step.button}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Categories */}
      <section className="max-w-5xl mx-auto px-6 py-10 text-center">
        <h2 className="text-3xl font-bold mb-7">Top categories</h2>

        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/books?category=${encodeURIComponent(category)}`}
              className="btn btn-outline btn-md rounded-full"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-base-300 bg-base-200 px-6 py-7">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <h3 className="font-bold text-lg">BookNook</h3>
            <p className="text-gray-500">A small online library for everyone.</p>
          </div>

          <div className="text-gray-500">
            <p>hello@booknook.com</p>
            <p>Dhaka, Bangladesh</p>
          </div>

          <div className="md:text-right text-gray-500">
            <p>X &nbsp; Facebook &nbsp; Instagram</p>
            <p>© 2026 BookNook</p>
          </div>
        </div>
      </footer>
    </main>
  );
}