// Author: Christian Gewehr
// Header.js – Sticky navigation bar showing the store title and auth controls.
// User state is passed down as a prop from App rather than read from
// localStorage directly, so the header re-renders immediately on login/logout.

import { Link, useNavigate } from "react-router-dom";
import { logout } from "../api/cart";

export default function Header({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();      // Clears token and user from localStorage
    onLogout();    // Notifies App to clear user state
    navigate("/");
  };

  return (
    <header>
      <h1>My Online Store</h1>
      <nav className="header-nav">
        {user ? (
          <>
            <span className="header-username">👤 {user.username}</span>
            {/* Admin link is only rendered if the logged-in user has isAdmin flag */}
            {user.isAdmin && (
              <Link to="/admin" className="nav-link nav-link-admin">Admin</Link>
            )}
            <button className="nav-logout-btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
