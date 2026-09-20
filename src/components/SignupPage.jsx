import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import BackButton from "./BackButton";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-6 py-24">
      <BackButton />

      <h1 className="font-display text-2xl font-semibold mb-6">Create Account</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1">Full Name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
          />
          <p className="text-[11px] text-muted mt-1">
            At least 8 characters, one uppercase letter, one number.
          </p>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded-md py-3 text-sm font-semibold hover:bg-black/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p className="text-center text-xs text-muted mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-accent underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}