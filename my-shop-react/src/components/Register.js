// Author: Christian Gewehr
// Register.js – Registration page component.
// After successful registration the user is automatically logged in
// and redirected to the shop, following industry practice (e.g. Shopify)
// of not requiring a separate login step after account creation.

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, loginUser, isLoggedIn } from "../api/cart";

export default function Register({ onLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Redirect already logged-in users to the shop
  if (isLoggedIn()) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      // Register the account, then immediately log in
      await registerUser(username, email, password);
      const user = await loginUser(email, password);
      onLogin(user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Register</h2>
        {error && <p className="auth-error">{error}</p>}
        <div className="auth-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
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
          <button onClick={handleSubmit}>Create Account</button>
        </div>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}