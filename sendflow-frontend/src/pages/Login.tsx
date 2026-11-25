
import { useState, type FormEvent } from "react";
import { Zap, ArrowRight, Loader2 } from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const API_URL = `${API_BASE.replace(/\/+$/, "").replace(/(?:\/api)+$/i, "")}/api`;

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const endpoint = isRegister ? "register" : "login";

      const response = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isRegister
            ? { name: name.trim(), email: email.trim(), password }
            : { email: email.trim(), password }
        ),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Something went wrong");
      }

      if (isRegister) {
        setSuccess("Account created successfully! Please sign in.");

        setIsRegister(false);
        setName("");
        setPassword("");

        return;
      }

      if (!result.data?.token || !result.data?.user) {
        throw new Error("Invalid login response from server.");
      }

      localStorage.setItem("sendflow_token", result.data.token);

      localStorage.setItem(
        "sendflow_user",
        JSON.stringify(result.data.user)
      );

      window.location.href = "/";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setIsRegister(!isRegister);
    setError("");
    setSuccess("");
    setPassword("");
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
            {isRegister ? "Create your account" : "Welcome back"}
          </h1>

          <p className="muted text-sm text-center mt-2">
            {isRegister
              ? "Get started with SendFlow today."
              : "Sign in to manage your email campaigns."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">

            {isRegister && (
              <div>
                <label className="block text-sm mb-2">
                  Full name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full rounded-xl bg-[#171923] border border-white/10 p-3 outline-none focus:border-violet-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm mb-2">
                Email address
              </label>

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
              <label className="block text-sm mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                minLength={8}
                required
                className="w-full rounded-xl bg-[#171923] border border-white/10 p-3 outline-none focus:border-violet-500"
              />

              {isRegister && (
                <p className="muted text-xs mt-2">
                  Password must be at least 8 characters.
                </p>
              )}
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            {success && (
              <p className="text-green-400 text-sm">{success}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-500 hover:bg-violet-600 disabled:opacity-60 rounded-xl py-3 font-semibold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Please wait...
                </>
              ) : (
                <>
                  {isRegister ? "Create account" : "Sign in"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>

          </form>

          <div className="text-center mt-6 text-sm">
            <span className="muted">
              {isRegister
                ? "Already have an account? "
                : "Don't have an account? "}
            </span>

            <button
              type="button"
              onClick={switchMode}
              className="text-violet-400 hover:text-violet-300 font-semibold"
            >
              {isRegister ? "Sign in" : "Create account"}
            </button>
          </div>

          <p className="muted text-xs text-center mt-6">
            Secure email scheduling, made simple.
          </p>

        </div>
      </div>
    </div>
  );
}
