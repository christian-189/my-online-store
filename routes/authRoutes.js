// Author: Christian Gewehr
// authRoutes.js – Public authentication routes (no JWT required).
// bcrypt is used for password hashing because it is specifically designed
// for passwords: it is intentionally slow and includes a salt automatically,
// making brute-force and rainbow table attacks significantly harder.
// JWT is used instead of server-side sessions because it is stateless –
// the server does not need to store session data, which suits a REST API.

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

module.exports = function (db) {
  const router = express.Router();
  const users = db.collection("users");

  // POST /auth/register – creates a new user with a hashed password.
  router.post("/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required." });
      }

      // Prevent duplicate accounts for the same email address.
      const existing = await users.findOne({ email });
      if (existing) {
        return res.status(409).json({ error: "Email already registered." });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const result = await users.insertOne({
        username,
        email,
        password: hashedPassword,
        isAdmin: false,         // New users are never admins by default
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

  // POST /auth/login – verifies credentials and returns a signed JWT.
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
      }

      const user = await users.findOne({ email });
      if (!user) {
        // Return the same error for wrong email and wrong password
        // to avoid revealing which accounts exist (security best practice).
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      // Sign JWT with userId and isAdmin so the frontend and protected routes
      // can identify the user and their role without a database lookup.
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
