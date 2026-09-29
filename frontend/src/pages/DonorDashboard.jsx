import { useEffect, useState } from "react";
import api from "../api/axios";
import DonationCard from "../components/DonationCard";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  foodName: "", description: "", quantity: "", foodType: "veg",
  pickupAddress: "", lat: "", lng: "", expiryTime: "",
};

const DonorDashboard = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchDonations = async () => {
    try {
      setFetching(true);
      const { data } = await api.get("/donations");
      setDonations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchDonations(); }, []);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude }));
        alert(`Location pinned: (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
      },
      () => alert("Unable to retrieve location.")
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append("image", imageFile);

      await api.post("/donations", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setForm(emptyForm);
      setImageFile(null);
      setSuccess("Food donation posted successfully! Nearby volunteers can now pick it up.");
      setTimeout(() => setSuccess(""), 5000);
      fetchDonations();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post donation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Donor Dashboard</h1>
          <p className="page-subtitle">List fresh surplus meals and prevent food waste</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Logged in as:</span>
          <div style={{ fontWeight: 700, color: "var(--primary)" }}>{user?.name}</div>
        </div>
      </div>

      {success && (
        <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: 16, borderRadius: "var(--radius-md)", marginBottom: 24 }}>
          🎉 {success}
        </div>
      )}

      {error && <div className="error">⚠️ {error}</div>}

      <div className="card" style={{ marginBottom: 36 }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", marginBottom: 6 }}>
          ✨ Post a New Food Donation
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 20 }}>
          Provide the food details, pickup instructions, and estimated expiry time.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div>
              <label>Food Item / Dish Name *</label>
              <input
                value={form.foodName}
                onChange={update("foodName")}
                placeholder="e.g. 30 Portions of Fresh Biryani"
                required
              />
            </div>
            <div>
              <label>Quantity *</label>
              <input
                value={form.quantity}
                onChange={update("quantity")}
                placeholder="e.g. 25 boxes, 10 kg, 3 trays"
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div>
              <label>Food Category *</label>
              <select value={form.foodType} onChange={update("foodType")}>
                <option value="veg">🥗 Vegetarian</option>
                <option value="non-veg">🍗 Non-Vegetarian</option>
                <option value="mixed">🍱 Mixed Platter</option>
                <option value="packaged">📦 Packaged & Canned Goods</option>
                <option value="other">🍲 Other Prepared Food</option>
              </select>
            </div>
            <div>
              <label>Best-Before / Expiry Time *</label>
              <input
                type="datetime-local"
                value={form.expiryTime}
                onChange={update("expiryTime")}
                required
              />
            </div>
          </div>

          <label>Description & Dietary Information</label>
          <textarea
            rows={2}
            value={form.description}
            onChange={update("description")}
            placeholder="Contains allergens, packed in foil trays, kept refrigerated..."
          />

          <div className="form-grid-2">
            <div>
              <label>Pickup Address *</label>
              <input
                value={form.pickupAddress}
                onChange={update("pickupAddress")}
                placeholder="Restaurant address, suite/floor, gate"
                required
              />
            </div>
            <div>
              <label>Geo Location Pin</label>
              <button
                type="button"
                className="btn secondary"
                onClick={useMyLocation}
                style={{ width: "100%", padding: "10px" }}
              >
                📍 {form.lat ? `Pinned: ${Number(form.lat).toFixed(3)}, ${Number(form.lng).toFixed(3)}` : "Use My Current GPS Location"}
              </button>
            </div>
          </div>

          <div>
            <label>Food Photo (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              style={{ padding: "8px" }}
            />
          </div>

          <button className="btn" type="submit" disabled={loading} style={{ minWidth: 180, marginTop: 8 }}>
            {loading ? "Publishing Donation..." : "🚀 Publish Donation"}
          </button>
        </form>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem" }}>
          📦 Your Posted Donations ({donations.length})
        </h2>
      </div>

      {fetching ? (
        <p style={{ color: "var(--text-muted)" }}>Loading your donations...</p>
      ) : (
        <div className="grid">
          {donations.map((d) => (
            <DonationCard key={d._id} donation={d} />
          ))}
          {donations.length === 0 && (
            <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: "3rem", marginBottom: 12 }}>🥗</div>
              <h3>No donations posted yet</h3>
              <p style={{ color: "var(--text-muted)", marginTop: 6 }}>
                Fill out the form above to post your first surplus meal!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;
