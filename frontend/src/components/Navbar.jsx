import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Icon } from "./Icons";

const dashboardPath = {
  donor: "/donor",
  volunteer: "/volunteer",
  ngo: "/ngo",
  admin: "/admin",
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span className="brand-icon">
          <Icon name="leaf" size={20} color="#ffffff" />
        </span>
        <span>Annapurna</span>
      </Link>
      <nav>
        {user ? (
          <>
            <Link to={dashboardPath[user.role]}>Dashboard</Link>
            <div className="nav-user-pill">
              <span className="nav-user-avatar">{user.name?.charAt(0).toUpperCase() || "U"}</span>
              <div className="nav-user-info">
                <span>{user.name}</span>
                <span className={`nav-role-tag ${user.role}`}>{user.role}</span>
              </div>
            </div>
            <button className="btn-logout" onClick={() => { logout(); navigate("/login"); }}>
              <Icon name="logout" size={14} style={{ marginRight: 4 }} />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="nav-cta">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
