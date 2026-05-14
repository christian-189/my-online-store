/* Auth routes: Register and Login.
   POST /auth/register  – creates a new user with a hashed password.
   POST /auth/login     – verifies credentials and returns a signed JWT. */

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_change_in_production";
const SALT_ROUNDS = 10;

module.exports = function (db) {
  const router = express.Router();
  const users = db.collection("users");

  // ── REGISTER ──────────────────────────────────────────────────────────────
  router.post("/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Basic validation
      if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required." });
      }

      // Check if email already exists
      const existing = await users.findOne({ email });
      if (existing) {
        return res.status(409).json({ error: "Email already registered." });
      }

      // Hash password with bcrypt
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // Store new user – isAdmin defaults to false
      const result = await users.insertOne({
        username,
        email,
        password: hashedPassword,
        isAdmin: false,
        createdAt: new Date(),
      });

      res.status(201).json({
        message: "User registered successfully.",
        userId: result.insertedId,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
      }

      // Find user by email
      const user = await users.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      // Compare provided password with stored hash
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      // Sign JWT – expires in 24 hours
      const token = jwt.sign(
        { userId: user._id.toString(), isAdmin: user.isAdmin },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        message: "Login successful.",
        token,
        user: {
          userId: user._id.toString(),
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
