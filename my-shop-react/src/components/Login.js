// Author: Christian Gewehr
// Login.js – Login page component.
// On successful login the JWT and user object are stored in localStorage
// via loginUser() in api/cart.js, and the parent App is notified via onLogin.

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/cart";
import { isLoggedIn } from "../api/cart";

export default function Login({ onLogin }) {
  // Separate state for each field keeps the form simple and readable.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic client-side validation before sending a request to the backend.
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const user = await loginUser(email, password);
      onLogin(user);
      navigate("/");
    } catch (err) {
      // Display the error returned by the backend (e.g. "Invalid email or password.")
      setError(err.message);
    }
  };

  if (isLoggedIn()) {
  navigate("/");
  return null;
}

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>
        {error && <p className="auth-error">{error}</p>}
        <div className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleSubmit}>Login</button>
        </div>
        <p className="auth-switch">
          No account yet? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}
