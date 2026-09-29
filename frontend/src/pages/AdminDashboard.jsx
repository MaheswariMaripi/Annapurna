import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import api from "../api/axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("stats");
  const [error, setError] = useState("");

  const fetchAll = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get("/users/stats"),
        api.get("/users"),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error("Admin fetch error:", err);
      setError(err.response?.data?.message || "Failed to load admin dashboard data.");
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const verifyNGO = async (id, decision) => {
    try {
      await api.patch(`/users/${id}/verify`, { decision });
      fetchAll();
    } catch (err) {
      alert("Failed to update NGO verification");
    }
  };

  const toggleSuspend = async (id) => {
    try {
      await api.patch(`/users/${id}/suspend`);
      fetchAll();
    } catch (err) {
      alert("Failed to update user status");
    }
  };

  if (error) {
    return (
      <div className="container">
        <div className="card" style={{ borderLeft: "4px solid #ef4444", padding: 24 }}>
          <h2 style={{ color: "#b91c1c" }}>Access Error</h2>
          <p style={{ marginTop: 8 }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return <div className="container" style={{ padding: 40, textAlign: "center" }}>Loading Admin Analytics...</div>;

  const pendingNGOs = users.filter((u) => u.role === "ngo" && u.verificationStatus === "pending");
  const chartData = stats.topVolunteers.map((v) => ({ name: v.name, completed: v.completedCount }));

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Management Suite</h1>
          <p className="page-subtitle">Platform overview, impact analytics, and NGO verifications</p>
        </div>
        <div>
          <span style={{ background: "#fef3c7", border: "1px solid #fde68a", color: "#b45309", padding: "6px 14px", borderRadius: "var(--radius-full)", fontWeight: 700, fontSize: "0.85rem" }}>
            🛡️ Platform Administrator
          </span>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-box">
          <div className="num">{stats.totalDonations}</div>
          <div className="label">📦 Total Donations</div>
        </div>
        <div className="stat-box">
          <div className="num" style={{ color: "#059669" }}>{stats.completed}</div>
          <div className="label">🍲 Meals Delivered</div>
        </div>
        <div className="stat-box">
          <div className="num" style={{ color: "#7c3aed" }}>{stats.activeDonors}</div>
          <div className="label">🍽️ Active Donors</div>
        </div>
        <div className="stat-box">
          <div className="num" style={{ color: "#0284c7" }}>{stats.activeVolunteers}</div>
          <div className="label">🚴 Active Volunteers</div>
        </div>
        <div className="stat-box">
          <div className="num" style={{ color: "#059669" }}>{stats.verifiedNGOs}</div>
          <div className="label">🏠 Verified NGOs</div>
        </div>
        <div className="stat-box" style={{ borderLeft: pendingNGOs.length > 0 ? "4px solid #f97316" : "" }}>
          <div className="num" style={{ color: pendingNGOs.length > 0 ? "#ea580c" : "var(--text-muted)" }}>
            {pendingNGOs.length}
          </div>
          <div className="label">⏳ Pending NGO Approvals</div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="card" style={{ height: 300, marginBottom: 28 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", marginBottom: 12 }}>
            🏆 Top Volunteers by Completed Deliveries
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
              <YAxis allowDecimals={false} stroke="var(--text-muted)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              />
              <Bar dataKey="completed" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="tab-row">
        <button
          className={`tab-btn ${tab === "stats" ? "active" : ""}`}
          onClick={() => setTab("stats")}
        >
          <span>Overview</span>
        </button>
        <button
          className={`tab-btn ${tab === "ngo" ? "active" : ""}`}
          onClick={() => setTab("ngo")}
        >
          <span>Pending NGO Verifications</span>
          <span className="tab-badge">{pendingNGOs.length}</span>
        </button>
        <button
          className={`tab-btn ${tab === "users" ? "active" : ""}`}
          onClick={() => setTab("users")}
        >
          <span>User Directory ({users.length})</span>
        </button>
      </div>

      {tab === "ngo" && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Review registration credentials and approve NGOs to receive food donations:
            </p>
          </div>
          <div className="grid">
            {pendingNGOs.map((u) => (
              <div className="card" key={u._id} style={{ display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", marginBottom: 6 }}>{u.name}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 4 }}>📧 {u.email}</p>
                <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 6, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span>📞</span>
                  {u.phone ? (
                    <>
                      <a href={`tel:${u.phone.replace(/\s+/g, "")}`} className="contact-pill-link">
                        {u.phone}
                      </a>
                      <a
                        href={`https://wa.me/${u.phone.replace(/\D/g, "").length === 10 ? "91" + u.phone.replace(/\D/g, "") : u.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-pill-whatsapp"
                      >
                        💬 WhatsApp
                      </a>
                    </>
                  ) : (
                    <span>No phone</span>
                  )}
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 14 }}>📍 {u.address || "No address"}</p>
                
                <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: 8, marginBottom: 16, border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Registration Number</span>
                  <strong style={{ fontSize: "0.95rem", color: "var(--primary)" }}>{u.ngoRegistrationNumber || "N/A"}</strong>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
                  <button className="btn" style={{ flex: 1 }} onClick={() => verifyNGO(u._id, "approved")}>
                    ✓ Approve
                  </button>
                  <button className="btn danger" style={{ flex: 1 }} onClick={() => verifyNGO(u._id, "rejected")}>
                    ✕ Reject
                  </button>
                </div>
              </div>
            ))}
            {pendingNGOs.length === 0 && (
              <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>✅</div>
                <h3>No pending verifications</h3>
                <p style={{ color: "var(--text-muted)", marginTop: 6 }}>All registered NGOs have been verified and processed.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="grid">
          {users.map((u) => (
            <div className="card" key={u._id} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", margin: 0 }}>{u.name}</h3>
                <span className={`nav-role-tag ${u.role}`}>{u.role}</span>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 4 }}>📧 {u.email}</p>
              <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 10, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span>📞</span>
                {u.phone ? (
                  <a href={`tel:${u.phone.replace(/\s+/g, "")}`} className="contact-pill-link">
                    {u.phone}
                  </a>
                ) : (
                  <span>No phone</span>
                )}
              </div>
              
              <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: 8, fontSize: "0.85rem", marginBottom: 16 }}>
                <div>Pickups / Donations Completed: <strong>{u.completedCount || 0}</strong></div>
                <div>User Rating: <strong>{u.rating ? `⭐ ${u.rating}` : "No ratings yet"}</strong></div>
              </div>

              <div style={{ marginTop: "auto" }}>
                <button
                  className={`btn ${u.isActive ? "danger" : "secondary"}`}
                  style={{ width: "100%", padding: "8px 14px", fontSize: "0.88rem" }}
                  onClick={() => toggleSuspend(u._id)}
                >
                  {u.isActive ? "🚫 Suspend Account" : "✅ Reactivate Account"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "stats" && (
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginBottom: 8 }}>Platform Health & Summary</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6 }}>
            Annapurna has coordinated <strong>{stats.totalDonations}</strong> food donations, diverting surplus food from local restaurants and caterers into <strong>{stats.completed}</strong> verified meals served at shelters and community centers.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
