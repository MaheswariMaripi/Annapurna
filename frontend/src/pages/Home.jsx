import { Link } from "react-router-dom";

const RouteDiagram = () => (
  <svg viewBox="0 0 320 300" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A donor surplus food is picked up by a volunteer and delivered to an NGO">
    <path
      className="home-route-path"
      d="M60 60 C 120 60, 100 150, 160 150 S 220 240, 260 240"
      stroke="#10b981"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeDasharray="6 10"
    />

    <circle cx="60" cy="60" r="28" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
    <path d="M50 54h20l-2 14a2 2 0 0 1-2 2h-14a2 2 0 0 1-2-2z" fill="#10b981" />
    <rect x="52" y="50" width="16" height="6" rx="2" fill="#047857" />
    <text x="60" y="106" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0f172a" fontFamily="var(--font-display)">🍽️ Donor</text>

    <circle cx="160" cy="150" r="28" fill="#ffffff" stroke="#f59e0b" strokeWidth="2.5" />
    <circle cx="152" cy="150" r="6" fill="#f59e0b" />
    <circle cx="168" cy="150" r="6" fill="#f59e0b" />
    <path d="M150 144h20l4 8h-28z" fill="#f59e0b" />
    <text x="160" y="196" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0f172a" fontFamily="var(--font-display)">🚴 Volunteer</text>

    <circle cx="260" cy="240" r="28" fill="#ffffff" stroke="#059669" strokeWidth="2.5" />
    <rect x="248" y="230" width="24" height="18" fill="#059669" rx="2" />
    <rect x="253" y="235" width="5" height="5" fill="#ffffff" />
    <rect x="262" y="235" width="5" height="5" fill="#ffffff" />
    <text x="260" y="286" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0f172a" fontFamily="var(--font-display)">🏠 NGO Shelter</text>
  </svg>
);

const steps = [
  {
    icon: "🍽️",
    title: "1. Post What's Surplus",
    body: "Restaurants, caterers, and individuals list available food in seconds with quantity, expiry time, and location.",
  },
  {
    icon: "🚴",
    title: "2. Volunteer Claims Pickup",
    body: "Nearby volunteer drivers receive alerts, view GPS directions, and claim the pickup before the expiry window closes.",
  },
  {
    icon: "🏠",
    title: "3. Direct Delivery to Shelters",
    body: "The volunteer delivers hot meals and produce directly to verified shelters and community kitchens with instant receipt confirmation.",
  },
];

const roles = [
  {
    role: "Donor",
    icon: "🍽️",
    color: "#7c3aed",
    body: "Restaurants, cafes, event caterers, bakeries, and individuals with surplus quality food.",
    cta: "Join as a Donor →",
  },
  {
    role: "Volunteer",
    icon: "🚴",
    color: "#0284c7",
    body: "Community heroes with a bicycle, car, or scooter who bridge the distance between food and families.",
    cta: "Become a Volunteer →",
  },
  {
    role: "NGO / Shelter",
    icon: "🏠",
    color: "#059669",
    body: "Verified community shelters, orphanages, and food pantries receiving direct, free meal shipments.",
    cta: "Register Your Shelter →",
  },
];

const Home = () => (
  <div>
    <section className="home-hero">
      <div className="home-hero-inner">
        <div>
          <h1>
            Every surplus meal deserves a plate, <span className="gradient-text">never a bin.</span>
          </h1>
          <p className="lede">
            Annapurna bridges the gap between commercial surplus food, volunteer drivers, and community shelters — completing rescues the very same day.
          </p>
          <div className="home-cta-row">
            <Link className="btn large" to="/register">
              🚀 Start Sharing & Rescuing Food
            </Link>
            <Link className="btn secondary large" to="/login">
              Sign In
            </Link>
          </div>
          <div className="home-trust">
            <span>✨ 100% Free & Community Driven</span>
            <span>•</span>
            <span>🌱 Annapurna Zero Food Waste Mission</span>
          </div>
        </div>
        <div className="home-hero-visual">
          <RouteDiagram />
        </div>
      </div>
    </section>

    <section className="home-section">
      <h2>How Annapurna Works</h2>
      <p className="section-intro">Three simple steps to move food from where it's extra to where it's needed most.</p>
      <div className="home-steps">
        {steps.map((step) => (
          <div className="home-step-card" key={step.title}>
            <div className="home-step-num">{step.icon}</div>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="home-section" style={{ background: "#ffffff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)", margin: "0 auto 40px", maxWidth: 1180 }}>
      <h2>Built for Everyone in the Loop</h2>
      <p className="section-intro">Personalized workflows and real-time coordination tailored to each stakeholder.</p>
      <div className="home-roles">
        {roles.map((r) => (
          <div className="home-role-card" style={{ "--role-color": r.color }} key={r.role}>
            <div style={{ fontSize: "2rem", marginBottom: 12 }}>{r.icon}</div>
            <h3>{r.role}</h3>
            <p>{r.body}</p>
            <Link to="/register">{r.cta}</Link>
          </div>
        ))}
      </div>
    </section>

    <section className="home-final-cta">
      <h2>Ready to turn surplus food into smiles?</h2>
      <p>Whether you have fresh food to share, a vehicle to drive, or a shelter to feed, your community needs you.</p>
      <Link className="btn large" to="/register">
        Join the Annapurna Network Today
      </Link>
    </section>

    <footer className="home-footer">
      <div className="home-footer-inner">
        <div className="home-footer-brand">
          🍲 Annapurna
        </div>
        <nav style={{ display: "flex", gap: 20 }}>
          <Link to="/login" style={{ color: "#94a3b8" }}>Login</Link>
          <Link to="/register" style={{ color: "#94a3b8" }}>Register</Link>
        </nav>
      </div>
    </footer>
  </div>
);

export default Home;
