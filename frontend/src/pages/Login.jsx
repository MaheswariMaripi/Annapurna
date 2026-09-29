import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const dashboardPath = { donor: "/donor", volunteer: "/volunteer", ngo: "/ngo", admin: "/admin" };

const demoAccounts = [
  { role: "donor", label: "🍽️ Donor", email: "bistro@annapurna.org" },
  { role: "volunteer", label: "🚴 Volunteer", email: "alex@annapurna.org" },
  { role: "ngo", label: "🏠 Shelter NGO", email: "hope@annapurna.org" },
  { role: "admin", label: "🛡️ Admin", email: "admin@annapurna.org" },
];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoFill = (acc) => {
    setEmail(acc.email);
    setPassword("password123");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(dashboardPath[user.role]);
    } catch (err) {
      if (!err.response) {
        setError("Unable to connect to the backend server. Please verify the backend is running on port 5000.");
      } else {
        setError(err.response?.data?.message || "Invalid credentials or login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <div className="auth-brand-badge">
          <span>🍲</span>
          <span>Annapurna Portal • India</span>
        </div>
        <h2>Welcome back</h2>
        <p className="auth-subtitle">Sign in to coordinate surplus food pickups and deliveries</p>

        {error && <div className="error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <button
            className="btn"
            type="submit"
            style={{ width: "100%", marginTop: 10, padding: "13px", fontSize: "1.02rem" }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In to Annapurna 🔑"}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="demo-logins-box">
          <div className="demo-logins-title">
            <span>⚡ Quick Demo Logins</span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-light)" }}>(click to auto-fill)</span>
          </div>
          <div className="demo-chips-grid">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                className={`demo-chip-btn ${acc.role}`}
                onClick={() => handleDemoFill(acc)}
              >
                <span>{acc.label}</span>
              </button>
            ))}
          </div>
        </div>

        <p style={{ marginTop: 24, textAlign: "center", fontSize: "0.92rem", color: "var(--text-muted)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--primary)", fontWeight: 700 }}>
            Create an account ✨
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
