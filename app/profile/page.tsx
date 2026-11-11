"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import PrivateRoute from "../components/PrivateRoute";

function ProfileContent() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  useEffect(() => {
    document.title = "BookNook | My Profile";
  }, []);

  const avatar =
    user?.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}`;

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="card items-center border border-base-300 bg-base-100 p-8 text-center shadow-sm">
        <div className="avatar">
          <div className="w-28 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatar} alt={user?.name || "User"} referrerPolicy="no-referrer" />
          </div>
        </div>
        <h1 className="mt-4 text-2xl font-bold">{user?.name}</h1>
        <p className="opacity-70">{user?.email}</p>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <PrivateRoute>
      <ProfileContent />
    </PrivateRoute>
  );
}