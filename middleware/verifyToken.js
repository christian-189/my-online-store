/* Middleware to verify JWT token on protected routes.
   Usage: add verifyToken as middleware to any route that requires authentication.
   The decoded userId is attached to req.userId for use in route handlers. */

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_change_in_production";

function verifyToken(req, res, next) {
  // Expect header: Authorization: Bearer <token>
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.isAdmin = decoded.isAdmin || false;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
}

module.exports = verifyToken;
