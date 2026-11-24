
import { useState } from "react";
import { Zap, ArrowRight, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      localStorage.setItem("sendflow_token", result.data.token);
      localStorage.setItem(
        "sendflow_user",
        JSON.stringify(result.data.user)
      );

      window.location.href = "/";
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0d14] flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="flex justify-center items-center gap-3 mb-8">
          <div className="h-11 w-11 rounded-xl bg-violet-500 flex items-center justify-center">
            <Zap />
          </div>
          <span className="text-2xl font-bold">SendFlow</span>
        </div>

        <div className="panel p-8">
          <h1 className="text-2xl font-semibold text-center">
            Welcome back
          </h1>

          <p className="muted text-sm text-center mt-2">
            Sign in to manage your email campaigns.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl bg-[#171923] border border-white/10 p-3 outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-xl bg-[#171923] border border-white/10 p-3 outline-none focus:border-violet-500"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-500 hover:bg-violet-600 disabled:opacity-60 rounded-xl py-3 font-semibold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="muted text-xs text-center mt-6">
            Secure email scheduling, made simple.
          </p>
        </div>
      </div>
    </div>
  );
}
