import { useEffect, useState } from "react";
import api from "../api/axios";
import DonationCard from "../components/DonationCard";
import { useAuth } from "../context/AuthContext";

const NGODashboard = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [activeTab, setActiveTab] = useState("available");
  const [loading, setLoading] = useState(true);
  const [claimMessage, setClaimMessage] = useState("");

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/donations");
      setDonations(data);
    } catch (err) {
      console.error("Failed to load donations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const confirmReceipt = async (id) => {
    try {
      await api.patch(`/donations/${id}/status`, { status: "received" });
      fetchDonations();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to confirm receipt");
    }
  };

  const claimDonation = async (id) => {
    try {
      await api.patch(`/donations/${id}/claim`);
      setClaimMessage("🎉 Successfully claimed donation for your shelter!");
      setTimeout(() => setClaimMessage(""), 4500);
      fetchDonations();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to claim donation");
    }
  };

  if (user && user.verificationStatus === "pending") {
    return (
      <div className="container">
        <div className="card" style={{ maxWidth: 600, margin: "60px auto", textAlign: "center", padding: "50px 30px" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>⏳</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", marginBottom: 8 }}>
            NGO Verification In Progress
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", lineHeight: 1.6 }}>
            Your shelter account has been registered and is currently pending administrator verification.
            Once approved, you will be able to claim and receive community donations.
          </p>
        </div>
      </div>
    );
  }

  // Available donations: pending, accepted, or picked up (not yet received or cancelled)
  const availableDonations = donations.filter(
    (d) =>
      d.status !== "received" &&
      d.status !== "cancelled" &&
      (!d.ngo || d.ngo?._id === user?._id || d.ngo === user?._id)
  );

  // Deliveries assigned to this NGO
  const myDeliveries = donations.filter(
    (d) => d.ngo?._id === user?._id || d.ngo === user?._id
  );

  const awaitingConfirmation = myDeliveries.filter((d) => d.status === "delivered");
  const inTransit = myDeliveries.filter(
    (d) => d.status === "accepted" || d.status === "picked_up" || d.status === "pending"
  );
  const receivedHistory = myDeliveries.filter((d) => d.status === "received");

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">NGO & Shelter Portal</h1>
          <p className="page-subtitle">Request surplus food and confirm received meals for your shelter</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "6px 14px", borderRadius: "var(--radius-full)", fontWeight: 700, fontSize: "0.85rem" }}>
            ✓ Verified NGO Organization
          </span>
        </div>
      </div>

      {claimMessage && (
        <div style={{ padding: "14px 20px", background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", borderRadius: "var(--radius-md)", marginBottom: 24, fontWeight: 600 }}>
          {claimMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="tab-row">
        <button
          className={`tab-btn ${activeTab === "available" ? "active" : ""}`}
          onClick={() => setActiveTab("available")}
        >
          <span>Available Food Donations</span>
          <span className="tab-badge">{availableDonations.length}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "incoming" ? "active" : ""}`}
          onClick={() => setActiveTab("incoming")}
        >
          <span>Incoming for Us</span>
          <span className="tab-badge">{awaitingConfirmation.length + inTransit.length}</span>
          {awaitingConfirmation.length > 0 && (
            <span style={{ background: "var(--orange)", color: "white", padding: "1px 6px", borderRadius: 10, fontSize: "0.75rem", fontWeight: 700 }}>
              {awaitingConfirmation.length} to confirm
            </span>
          )}
        </button>
        <button
          className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <span>Received History</span>
          <span className="tab-badge">{receivedHistory.length}</span>
        </button>
      </div>

      {loading && <p style={{ color: "var(--text-muted)" }}>Loading food donations...</p>}

      {!loading && activeTab === "available" && (
        <div>
          <div style={{ marginBottom: 18 }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Surplus meals listed by local donors. Tap <strong>"Request for Our Shelter"</strong> to claim the food.
            </p>
          </div>
          <div className="grid">
            {availableDonations.map((d) => {
              const isClaimedByMe = d.ngo?._id === user?._id || d.ngo === user?._id;
              return (
                <DonationCard key={d._id} donation={d}>
                  {isClaimedByMe ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <span className="tag status" style={{ background: "#e0f2fe", color: "#0369a1", textAlign: "center", border: "1px solid #7dd3fc" }}>
                        📌 Claimed by Your Shelter
                      </span>
                      {d.status === "delivered" && (
                        <button className="btn" style={{ width: "100%" }} onClick={() => confirmReceipt(d._id)}>
                          ✅ Confirm Receipt of Food
                        </button>
                      )}
                    </div>
                  ) : (
                    <button className="btn" style={{ width: "100%" }} onClick={() => claimDonation(d._id)}>
                      📥 Request for Our Shelter
                    </button>
                  )}
                </DonationCard>
              );
            })}
            {availableDonations.length === 0 && (
              <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>📦</div>
                <h3>No available donations right now</h3>
                <p style={{ color: "var(--text-muted)", marginTop: 6 }}>
                  As soon as donors list new meals, they will appear here for you to claim.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {!loading && activeTab === "incoming" && (
        <div>
          {awaitingConfirmation.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "#c2410c" }}>
                  🚨 Awaiting Your Receipt Confirmation
                </h3>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 16 }}>
                Volunteers have delivered these items to your address. Please verify packages and confirm receipt:
              </p>
              <div className="grid">
                {awaitingConfirmation.map((d) => (
                  <DonationCard key={d._id} donation={d}>
                    <button className="btn" style={{ width: "100%", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }} onClick={() => confirmReceipt(d._id)}>
                      ✅ Confirm Meals Received
                    </button>
                  </DonationCard>
                ))}
              </div>
            </div>
          )}

          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginBottom: 12 }}>
            🚚 Scheduled & In-Transit for Your Shelter
          </h3>
          <div className="grid">
            {inTransit.map((d) => (
              <DonationCard key={d._id} donation={d}>
                <div style={{ padding: "8px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid var(--border)", textAlign: "center", fontSize: "0.85rem", fontWeight: 600, color: "var(--primary)" }}>
                  {d.status === "pending"
                    ? "⏳ Waiting for Volunteer Driver"
                    : d.status === "accepted"
                    ? "🚴 Volunteer En Route to Donor"
                    : "📦 Volunteer Picked Up, Heading to Shelter"}
                </div>
              </DonationCard>
            ))}
            {inTransit.length === 0 && awaitingConfirmation.length === 0 && (
              <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>🏠</div>
                <h3>No incoming deliveries scheduled</h3>
                <p style={{ color: "var(--text-muted)", marginTop: 6 }}>
                  Browse the "Available Food Donations" tab and request items for your shelter.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {!loading && activeTab === "history" && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Archive of all donations delivered and received by your shelter:
            </p>
          </div>
          <div className="grid">
            {receivedHistory.map((d) => (
              <DonationCard key={d._id} donation={d} />
            ))}
            {receivedHistory.length === 0 && (
              <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>📜</div>
                <h3>No received history yet</h3>
                <p style={{ color: "var(--text-muted)", marginTop: 6 }}>
                  When you confirm incoming deliveries, they will be archived here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NGODashboard;
