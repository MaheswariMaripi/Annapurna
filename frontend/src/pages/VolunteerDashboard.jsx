import { useEffect, useState } from "react";
import api from "../api/axios";
import DonationCard from "../components/DonationCard";
import { useAuth } from "../context/AuthContext";

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [nearMe, setNearMe] = useState(false);
  const [activeTab, setActiveTab] = useState("available"); // "available" | "myTasks"
  const [loading, setLoading] = useState(true);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      let params = {};
      if (nearMe && navigator.geolocation) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              params = { nearLat: pos.coords.latitude, nearLng: pos.coords.longitude, maxDistanceKm: 15 };
              resolve();
            },
            () => resolve()
          );
        });
      }
      const { data } = await api.get("/donations", { params });
      setDonations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDonations(); }, [nearMe]);

  const accept = async (id) => {
    try {
      await api.patch(`/donations/${id}/accept`);
      setActiveTab("myTasks");
      fetchDonations();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept pickup");
    }
  };

  const advanceStatus = async (id, status) => {
    try {
      await api.patch(`/donations/${id}/status`, { status });
      fetchDonations();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const available = donations.filter((d) => d.status === "pending");
  const myTasks = donations.filter((d) => d.status !== "pending");

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Volunteer Rescue Hub</h1>
          <p className="page-subtitle">Pick up surplus meals and deliver them to local shelters</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: "white", padding: "8px 14px", borderRadius: "var(--radius-full)", border: "1px solid var(--border)", margin: 0, fontWeight: 600, fontSize: "0.88rem" }}>
            <input
              type="checkbox"
              style={{ width: "auto", margin: 0 }}
              checked={nearMe}
              onChange={(e) => setNearMe(e.target.checked)}
            />
            📍 Near Me (Within 15km)
          </label>
        </div>
      </div>

      <div className="tab-row">
        <button
          className={`tab-btn ${activeTab === "available" ? "active" : ""}`}
          onClick={() => setActiveTab("available")}
        >
          <span>Available for Pickup</span>
          <span className="tab-badge">{available.length}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "myTasks" ? "active" : ""}`}
          onClick={() => setActiveTab("myTasks")}
        >
          <span>My Active Pickups</span>
          <span className="tab-badge">{myTasks.length}</span>
        </button>
      </div>

      {loading && <p style={{ color: "var(--text-muted)" }}>Loading deliveries...</p>}

      {!loading && activeTab === "available" && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              These food packages have been listed by donors and are waiting for a volunteer driver:
            </p>
          </div>
          <div className="grid">
            {available.map((d) => (
              <DonationCard key={d._id} donation={d}>
                <button className="btn" style={{ width: "100%" }} onClick={() => accept(d._id)}>
                  🤝 Accept Pickup Assignment
                </button>
              </DonationCard>
            ))}
            {available.length === 0 && (
              <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>🎉</div>
                <h3>All caught up!</h3>
                <p style={{ color: "var(--text-muted)", marginTop: 6 }}>
                  No food donations are currently awaiting pickup. Check back soon!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {!loading && activeTab === "myTasks" && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Track and update your ongoing delivery assignments:
            </p>
          </div>
          <div className="grid">
            {myTasks.map((d) => (
              <DonationCard key={d._id} donation={d}>
                {d.status === "accepted" && (
                  <button
                    className="btn"
                    style={{ width: "100%", background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)" }}
                    onClick={() => advanceStatus(d._id, "picked_up")}
                  >
                    📦 Mark as Picked Up from Donor
                  </button>
                )}
                {d.status === "picked_up" && (
                  <button
                    className="btn"
                    style={{ width: "100%", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
                    onClick={() => advanceStatus(d._id, "delivered")}
                  >
                    ✅ Mark Delivered to Shelter
                  </button>
                )}
                {d.status === "delivered" && (
                  <div style={{ textAlign: "center", padding: 8, background: "#fffbeb", borderRadius: 8, color: "#b45309", fontWeight: 600, fontSize: "0.85rem" }}>
                    ⏳ Awaiting NGO Receipt Confirmation
                  </div>
                )}
                {d.status === "received" && (
                  <div style={{ textAlign: "center", padding: 8, background: "#ecfdf5", borderRadius: 8, color: "#065f46", fontWeight: 600, fontSize: "0.85rem" }}>
                    ✨ Delivery Completed & Confirmed
                  </div>
                )}
              </DonationCard>
            ))}
            {myTasks.length === 0 && (
              <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>🚴</div>
                <h3>No active delivery tasks</h3>
                <p style={{ color: "var(--text-muted)", marginTop: 6 }}>
                  Switch to the "Available for Pickup" tab to claim a delivery!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerDashboard;
