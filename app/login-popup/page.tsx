"use client";

import { FormEvent, useState } from "react";

export default function LoginPopupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const params = new URLSearchParams(
        window.location.search
      );
      const redirectUri =
        params.get("redirect_uri") || "";

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key":
            process.env.NEXT_PUBLIC_BETTERAUTH_PUBLIC_KEY ||
            ""
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        setSubmitting(false);
        return;
      }

      const token = data.token as string;

      if (window.opener && redirectUri) {
        const url = new URL(redirectUri);
        url.hash = `access_token=${encodeURIComponent(
          token
        )}`;
        window.opener.postMessage(
          {
            type: "AUTH_SUCCESS_POPUP",
            token
          },
          "*"
        );
        window.location.href = url.toString();
        return;
      }

      setSubmitting(false);
    } catch (err) {
      setError("Unexpected error");
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-sm w-full bg-white p-6 rounded-lg shadow">
        <h1 className="text-lg font-semibold mb-4">
          Sign in
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              className="w-full border rounded px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              className="w-full border rounded px-3 py-2 text-sm"
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-black text-white rounded py-2 text-sm disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}

