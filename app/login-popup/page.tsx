"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  LucideLock,
  LucideMail,
  LucideUser,
  LucideX,
  LucideEye,
  LucideEyeOff,
  LucideCamera,
} from "lucide-react";

function AuthorizeContent() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const responseType = searchParams?.get("response_type") ?? null;
  const redirectUri = searchParams?.get("redirect_uri") ?? null;
  const prompt = searchParams?.get("prompt") ?? null;
  const stateParam = searchParams?.get("state") ?? null;

  useEffect(() => {
    if (prompt === "none" && redirectUri) {
      const hash = `error=login_required&state=${stateParam || ""}`;
      window.location.href = `${redirectUri}#${hash}`;
    }
  }, [prompt, redirectUri, stateParam]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeProfileImage = () => {
    setProfileImagePreview("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint =
        mode === "login" ? "/api/login" : "/api/signup";

      const body: {
        email: string;
        password: string;
        fullName?: string;
        country?: string;
        profileImage?: string;
      } = {
        email,
        password,
      };

      if (mode === "signup") {
        body.fullName = fullName.trim();
        body.country = country.trim();
      }

      const apiKey =
        process.env.NEXT_PUBLIC_BETTERAUTH_PUBLIC_KEY || "";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        const message =
          typeof data.error === "string" && data.error.length > 0
            ? data.error
            : "Authentication failed";
        throw new Error(message);
      }

      if (redirectUri && responseType === "token") {
        const params = new URLSearchParams({
          access_token: data.token,
          token_type: "Bearer",
          expires_in: "3600",
        });
        if (fullName) {
          params.set("full_name", fullName);
        }
        window.location.href = `${redirectUri}#${params.toString()}`;
      } else if (redirectUri && responseType !== "token") {
        setError("Unsupported response type");
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Authentication failed");
      } else {
        setError("Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  if (prompt === "none") {
    return null;
  }

  return (
    <div className="modal-backdrop fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 overflow-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative mt-10 mb-10 max-h-[90vh] overflow-auto">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          onClick={() => {
            if (redirectUri) {
              const hash = "error=access_denied";
              window.location.href = `${redirectUri}#${hash}`;
            }
          }}
        >
          <LucideX className="h-6 w-6" />
        </button>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 bg-brand text-white text-xl font-bold">
            9QC
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {mode === "login" ? "Welcome Back" : "Create your 9QC ID"}
          </h2>
          <p className="text-gray-600">
            Use your 9QC ID to access all 9QC applications
          </p>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Email
              </label>
              <div className="relative">
                <LucideMail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93C47D] text-black"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Password
              </label>
              <div className="relative">
                <LucideLock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93C47D] text-black"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <LucideEyeOff className="h-5 w-5" />
                  ) : (
                    <LucideEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              className="w-full bg-brand hover:bg-[#93C47D] text-white py-3 px-4 rounded-lg font-semibold cursor-pointer"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in with 9QC ID"}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-700 underline"
                onClick={() => setMode("signup")}
                disabled={loading}
              >
                Need an account? Create your 9QC ID
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Full name
              </label>
              <div className="relative">
                <LucideUser className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93C47D] focus:border-transparent transition-all text-black"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Profile picture
              </label>
        <div className="flex items-center space-x-4">
                <div className="relative z-5">
                  {profileImagePreview ? (
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 z-2">
                      <img
                        src={profileImagePreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeProfileImage}
                        className="absolute -top-3 -right-3 h-6 w-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg ring-2 ring-white transition-colors cursor-pointer"
                        disabled={loading}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
                      <LucideCamera className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    id="profileImage"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    disabled={loading}
                    className="hidden"
                  />
                  <label
                    htmlFor="profileImage"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#93C47D] focus:border-transparent transition-all cursor-pointer"
                  >
                    <LucideCamera className="h-4 w-4 mr-2" />
                    {profileImagePreview ? "Change Photo" : "Upload Photo"}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Optional, used to personalise your 9QC profile
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Email
              </label>
              <div className="relative">
                <LucideMail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93C47D] text-black focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Password
              </label>
              <div className="relative">
                <LucideLock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93C47D] text-black focus:border-transparent transition-all"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <LucideEyeOff className="h-5 w-5" />
                  ) : (
                    <LucideEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Country
              </label>
              <input
                type="text"
                className="w-full pl-3 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93C47D] text-black focus:border-transparent transition-all"
                placeholder="Select your country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              className="w-full bg-brand hover:bg-[#93C47D] text-white py-3 px-4 rounded-lg font-semibold transition-colors cursor-pointer"
              disabled={loading}
            >
              {loading ? "Creating 9QC ID..." : "Create 9QC ID"}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
                disabled={loading}
              >
                Already have a 9QC ID? Sign in
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AuthorizePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthorizeContent />
    </Suspense>
  );
}
