import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const dashboardPath = { donor: "/donor", volunteer: "/volunteer", ngo: "/ngo", admin: "/admin" };

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "donor",
    address: "",
    ngoRegistrationNumber: "",
  });
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handlePhoneChange = (e) => {
    let raw = e.target.value;
    // Keep only digits
    let digits = raw.replace(/\D/g, "");
    // If user pasted +91 or 91 with 12 digits
    if (digits.length === 12 && digits.startsWith("91")) {
      digits = digits.slice(2);
    }
    // If user typed leading 0 with 11 digits
    if (digits.length === 11 && digits.startsWith("0")) {
      digits = digits.slice(1);
    }
    setPhoneNumber(digits.slice(0, 10));
  };

  const isInvalidStart = phoneNumber.length > 0 && !/^[6-9]/.test(phoneNumber);
  const isValidPhone = phoneNumber.length === 10 && /^[6-9]/.test(phoneNumber);

  const formatDisplay = (num) => {
    if (!num) return "";
    if (num.length > 5) {
      return `${num.slice(0, 5)} ${num.slice(5)}`;
    }
    return num;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!phoneNumber) {
      setError("Please enter your 10-digit Indian mobile number (+91).");
      return;
    }

    if (isInvalidStart) {
      setError("Indian mobile numbers must start with 6, 7, 8, or 9.");
      return;
    }

    if (phoneNumber.length !== 10) {
      setError(`Please enter a complete 10-digit mobile number (${phoneNumber.length}/10 digits entered).`);
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        phone: `+91 ${phoneNumber}`,
      };
      const user = await register(payload);
      navigate(dashboardPath[user.role]);
    } catch (err) {
      if (!err.response) {
        setError("Unable to connect to the backend server. Please verify the backend is running on port 5000.");
      } else {
        setError(err.response?.data?.message || "Registration failed. Please check your details and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box" style={{ maxWidth: 560 }}>
        <div className="auth-brand-badge">
          <span>🍲</span>
          <span>Annapurna Network • India</span>
        </div>
        <h2>Join Annapurna</h2>
        <p className="auth-subtitle">Connect donors, volunteers, and shelters across India to rescue and share surplus meals</p>

        {error && <div className="error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Interactive Role Selection Cards */}
          <div className="role-selector-container">
            <div className="role-selector-header">
              <label style={{ margin: 0, fontWeight: 700, fontSize: "0.92rem", color: "var(--text-main)" }}>
                I am registering as:
              </label>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Tap to select</span>
            </div>
            <div className="role-cards-grid">
              <div
                className={`role-option-card donor ${form.role === "donor" ? "selected" : ""}`}
                onClick={() => setForm({ ...form, role: "donor" })}
              >
                <span className="role-check-indicator">✓</span>
                <span className="role-card-badge">Donor</span>
                <div className="role-card-icon-disc">🍽️</div>
                <h4>Food Donor</h4>
                <p>Restaurants, bakeries & individuals</p>
              </div>

              <div
                className={`role-option-card volunteer ${form.role === "volunteer" ? "selected" : ""}`}
                onClick={() => setForm({ ...form, role: "volunteer" })}
              >
                <span className="role-check-indicator">✓</span>
                <span className="role-card-badge">Volunteer</span>
                <div className="role-card-icon-disc">🚴</div>
                <h4>Volunteer</h4>
                <p>Pick up meals & deliver nearby</p>
              </div>

              <div
                className={`role-option-card ngo ${form.role === "ngo" ? "selected" : ""}`}
                onClick={() => setForm({ ...form, role: "ngo" })}
              >
                <span className="role-check-indicator">✓</span>
                <span className="role-card-badge">Shelter</span>
                <div className="role-card-icon-disc">🏠</div>
                <h4>NGO / Shelter</h4>
                <p>Verified kitchens & orphanages</p>
              </div>
            </div>
          </div>

          <div className="form-grid-2">
            <div>
              <label>Full Name / Organization</label>
              <input
                value={form.name}
                onChange={update("name")}
                placeholder="e.g. Green Kitchen or Rohit Sharma"
                required
              />
            </div>
            <div>
              <label>Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={update("email")}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div>
              <label>Password (min 6 chars)</label>
              <input
                type="password"
                value={form.password}
                onChange={update("password")}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div>
              <label>Indian Mobile Number <span style={{ color: "var(--primary)", fontWeight: 700 }}>*</span></label>
              <div className={`phone-input-group ${isValidPhone ? "valid" : ""}`}>
                <span className="phone-prefix-badge">
                  <span className="flag-icon" role="img" aria-label="India Flag">🇮🇳</span>
                  <span>+91</span>
                </span>
                <input
                  type="tel"
                  className="phone-field"
                  value={formatDisplay(phoneNumber)}
                  onChange={handlePhoneChange}
                  placeholder="98765 43210"
                  maxLength={11} // 10 digits + 1 space
                  required
                />
              </div>
              {/* Dynamic validation feedback */}
              {!phoneNumber && (
                <div className="phone-hint muted">
                  <span>ℹ️ 10-digit mobile number for pickup coordination</span>
                </div>
              )}
              {isInvalidStart && (
                <div className="phone-hint warning">
                  <span>⚠️ Indian mobile numbers begin with 6, 7, 8, or 9</span>
                </div>
              )}
              {!isInvalidStart && phoneNumber.length > 0 && phoneNumber.length < 10 && (
                <div className="phone-hint info">
                  <span>📱 {10 - phoneNumber.length} more digit{10 - phoneNumber.length > 1 ? "s" : ""} needed ({phoneNumber.length}/10)</span>
                </div>
              )}
              {isValidPhone && (
                <div className="phone-hint success">
                  <span>✓ Valid Indian mobile (+91 {phoneNumber.slice(0, 5)} {phoneNumber.slice(5)})</span>
                </div>
              )}
            </div>
          </div>

          <label>Address / Operating Location</label>
          <input
            value={form.address}
            onChange={update("address")}
            placeholder="e.g. Indiranagar, Bengaluru, Karnataka"
            required
          />

          {form.role === "ngo" && (
            <div style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)", border: "1.5px solid #c4b5fd", padding: 16, borderRadius: "var(--radius-md)", marginBottom: 18 }}>
              <label style={{ color: "#6d28d9", fontWeight: 700 }}>NGO Registration / Darpan ID</label>
              <input
                value={form.ngoRegistrationNumber}
                onChange={update("ngoRegistrationNumber")}
                placeholder="e.g. KA/2023/0123456 or NGO-12345"
                style={{ marginBottom: 6, background: "#ffffff" }}
                required
              />
              <p style={{ fontSize: "0.82rem", color: "#6d28d9" }}>
                ℹ️ NGO accounts are reviewed by an administrator before community food distributions can be claimed.
              </p>
            </div>
          )}

          <button className="btn" type="submit" style={{ width: "100%", marginTop: 10, padding: "14px", fontSize: "1.05rem" }} disabled={loading}>
            {loading ? "Creating your account..." : "Complete Registration 🚀"}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: "center", fontSize: "0.92rem", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700 }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
