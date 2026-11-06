
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="navbar bg-base-100 shadow-md px-4 md:px-10">
      {/* Logo */}
      <div className="navbar-start">
        <Link href="/" className="text-2xl font-bold text-primary">
          BookNook
        </Link>
      </div>

      {/* Desktop Menu */}
      <div className="navbar-center hidden md:flex">
        <ul className="menu menu-horizontal px-1 gap-2">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/books">All Books</Link></li>

          {!isPending && session?.user && (
            <>
              <li><Link href="/add-book">Add Book</Link></li>
              <li><Link href="/my-books">My Books</Link></li>
              <li><Link href="/my-borrows">My Borrows</Link></li>
            </>
          )}
        </ul>
      </div>

      {/* Right Side */}
      <div className="navbar-end gap-2">

        {/* Mobile Menu */}
        <div className="dropdown dropdown-end md:hidden">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-outline btn-primary btn-sm"
          >
            ☰ Menu
          </div>

          <ul
            tabIndex={0}
            className="menu dropdown-content bg-base-100 rounded-box z-50 mt-3 w-48 p-2 shadow-lg"
          >
            <li><Link href="/">Home</Link></li>
            <li><Link href="/books">All Books</Link></li>

            {!isPending && session?.user && (
              <>
                <li><Link href="/add-book">Add Book</Link></li>
                <li><Link href="/my-books">My Books</Link></li>
                <li><Link href="/my-borrows">My Borrows</Link></li>
              </>
            )}
          </ul>
        </div>

        {/* Login / Logout */}
        {!isPending && (
          <>
            {session?.user ? (
              <>
                <span className="hidden sm:inline font-medium">
                  {session.user.name}
                </span>

                <button
                  onClick={handleLogout}
                  className="btn btn-outline btn-primary btn-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost btn-sm">
                  Login
                </Link>

                <Link href="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
