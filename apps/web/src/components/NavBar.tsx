import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" className="brand">
          <span className="brand-dot" />
          FORGE
        </NavLink>
        <ul className="nav-links">
          {user ? (
            <>
              <li>
                <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/gyms" className={({ isActive }) => (isActive ? "active" : "")}>
                  Gyms
                </NavLink>
              </li>
              <li>
                <NavLink to="/profile" className={({ isActive }) => (isActive ? "active" : "")}>
                  Profile
                </NavLink>
              </li>
              <li>
                <button
                  className="btn"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  Log out
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/gyms" className={({ isActive }) => (isActive ? "active" : "")}>
                  Gyms
                </NavLink>
              </li>
              <li>
                <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
                  Log in
                </NavLink>
              </li>
              <li>
                <NavLink to="/signup" className="btn">
                  Get Started
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
}
