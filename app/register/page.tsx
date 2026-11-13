"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

function validatePassword(password: string) {
  if (password.length < 6) {
    return "Password must be at least 6 characters long.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must have at least one uppercase letter.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must have at least one lowercase letter.";
  }
  return "";
}

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Password rules: uppercase, lowercase and at least 6 characters
    const message = validatePassword(password);
    if (message) {
      setPasswordError(message);
      toast.error(message);
      return;
    }

    setPasswordError("");
    setLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
        ...(photoUrl.trim() ? { image: photoUrl.trim() } : {}),
      });

      if (error) {
        toast.error(error.message || "Registration failed");
        return;
      }

      // After registering, the user goes to the Login page
      try {
        await authClient.signOut();
      } catch {
        // ignore: the user may not have been signed in automatically
      }

      toast.success("Account created. Please login.");
      router.push("/login");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch {
      toast.error("Google login failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-base-200 px-4 py-10">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="text-3xl font-bold text-center">Create Account</h1>
          <p className="text-center text-base-content/60">
            Join BookNook and discover amazing books.
          </p>

          <form onSubmit={handleRegister} className="space-y-4 mt-4">
            <div>
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                className="input input-bordered w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
                <span className="label-text">Photo URL</span>
              </label>
              <input
                type="url"
                placeholder="https://i.pravatar.cc/150?img=12"
                className="input input-bordered w-full"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional. Paste a link to any image, or leave it empty.
              </p>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter password"
                className={`input input-bordered w-full ${
                  passwordError ? "input-error" : ""
                }`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError("");
                }}
                required
              />
              {passwordError ? (
                <p className="text-error text-sm mt-1">{passwordError}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  At least 6 characters, with one uppercase and one lowercase
                  letter.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Register"}
            </button>
          </form>

          <div className="divider">OR</div>

          <button
            type="button"
            onClick={handleGoogle}
            className="btn btn-outline w-full"
            disabled={googleLoading}
          >
            {googleLoading ? "Redirecting..." : "Continue with Google"}
          </button>

          <p className="text-center mt-4">
            Already have an account?{" "}
            <Link href="/login" className="link link-primary">
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}