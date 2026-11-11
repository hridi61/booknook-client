"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

function LoginContent() {
  const params = useSearchParams();

  // Private page theke ashle login er por sei page e fire jabe
  const raw = params.get("redirect") || "/";
  const redirect = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "BookNook | Login";
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        const message = error.message || "Invalid email or password";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Welcome back!");
      // Full reload: Navbar notun session dekhte pabe
      window.location.href = redirect;
    } catch {
      const message = "Something went wrong. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: redirect,
      });
    } catch {
      toast.error("Google login failed. Please try again.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-base-200 px-4 py-10">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="text-3xl font-bold text-center">Welcome Back!</h1>

          <p className="text-center text-base-content/60">
            Login to your BookNook account.
          </p>

          <form onSubmit={handleLogin} className="space-y-4 mt-4">
            <div>
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="text-right mt-1">
                <button
                  type="button"
                  className="link link-primary text-sm"
                  onClick={() => toast("Password reset is coming soon")}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {error && <p className="text-error text-sm">{error}</p>}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="divider">OR</div>

          <button
            type="button"
            className="btn btn-outline w-full"
            onClick={handleGoogle}
          >
            Continue with Google
          </button>

          <p className="text-center mt-4">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="link link-primary">
              Register
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}