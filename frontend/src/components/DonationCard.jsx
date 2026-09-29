import { Icon } from "./Icons";

const urgencyLabel = { urgent: "Urgent (< 2h)", today: "Today", later: "Flexible" };

const DonationCard = ({ donation, children }) => {
  return (
    <div className="donation-card">
      <div className="donation-card-hero">
        {donation.imageUrl ? (
          <img
            src={donation.imageUrl}
            alt={donation.foodName}
            className="donation-card-img"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="donation-card-icon-fallback" style={{ color: "var(--primary)" }}>
            <Icon name={donation.foodType === "veg" ? "leaf" : donation.foodType === "packaged" ? "package" : "utensils"} size={44} />
          </div>
        )}
        <div className="donation-card-badges">
          <span className={`tag status ${donation.status}`}>
            {donation.status.replace("_", " ")}
          </span>
          <span className={`tag ${donation.urgency}`}>
            {urgencyLabel[donation.urgency] || donation.urgency}
          </span>
        </div>
      </div>

      <div className="donation-card-body">
        <h3 className="donation-card-title">{donation.foodName}</h3>
        {donation.description && (
          <p className="donation-card-desc">{donation.description}</p>
        )}

        <div className="donation-card-meta">
          <div className="meta-row">
            <span className="meta-icon"><Icon name="package" size={16} color="var(--primary)" /></span>
            <span className="meta-label">Quantity:</span>
            <span className="meta-val">{donation.quantity} ({donation.foodType})</span>
          </div>
          <div className="meta-row">
            <span className="meta-icon"><Icon name="location" size={16} color="var(--primary)" /></span>
            <span className="meta-label">Pickup:</span>
            <span className="meta-val">{donation.pickupAddress}</span>
          </div>
          <div className="meta-row">
            <span className="meta-icon"><Icon name="clock" size={16} color="var(--primary)" /></span>
            <span className="meta-label">Best Before:</span>
            <span className="meta-val">
              {new Date(donation.expiryTime).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          {donation.distanceKm != null && (
            <div className="meta-row">
              <span className="meta-icon"><Icon name="compass" size={16} color="var(--primary)" /></span>
              <span className="meta-label">Distance:</span>
              <span className="meta-val" style={{ color: "var(--primary)" }}>
                {donation.distanceKm.toFixed(1)} km away
              </span>
            </div>
          )}
        </div>

        <div className="donation-card-actors">
          {donation.donor?.name && (
            <div className="actor-pill" style={{ flexWrap: "wrap" }}>
              <Icon name="user" size={14} color="var(--text-muted)" />
              <span>Donor:</span>
              <strong>{donation.donor.name}</strong>
              {donation.donor.phone && (
                <div style={{ display: "inline-flex", gap: 6, marginLeft: 6 }}>
                  <a
                    href={`tel:${donation.donor.phone.replace(/\s+/g, "")}`}
                    className="contact-pill-link"
                    title="Call Donor"
                  >
                    📞 {donation.donor.phone}
                  </a>
                  <a
                    href={`https://wa.me/${donation.donor.phone.replace(/\D/g, "").length === 10 ? "91" + donation.donor.phone.replace(/\D/g, "") : donation.donor.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-pill-whatsapp"
                    title="WhatsApp Donor"
                  >
                    💬 Chat
                  </a>
                </div>
              )}
            </div>
          )}
          {donation.volunteer?.name && (
            <div className="actor-pill" style={{ flexWrap: "wrap" }}>
              <Icon name="bike" size={14} color="var(--text-muted)" />
              <span>Volunteer:</span>
              <strong>{donation.volunteer.name}</strong>
              {donation.volunteer.phone && (
                <div style={{ display: "inline-flex", gap: 6, marginLeft: 6 }}>
                  <a
                    href={`tel:${donation.volunteer.phone.replace(/\s+/g, "")}`}
                    className="contact-pill-link"
                    title="Call Volunteer"
                  >
                    📞 {donation.volunteer.phone}
                  </a>
                  <a
                    href={`https://wa.me/${donation.volunteer.phone.replace(/\D/g, "").length === 10 ? "91" + donation.volunteer.phone.replace(/\D/g, "") : donation.volunteer.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-pill-whatsapp"
                    title="WhatsApp Volunteer"
                  >
                    💬 Chat
                  </a>
                </div>
              )}
            </div>
          )}
          {donation.ngo?.name && (
            <div className="actor-pill">
              <Icon name="building" size={14} color="var(--text-muted)" />
              <span>NGO:</span>
              <strong>{donation.ngo.name}</strong>
            </div>
          )}
        </div>

        {children && <div className="donation-card-actions">{children}</div>}
      </div>
    </div>
  );
};

export default DonationCard;
