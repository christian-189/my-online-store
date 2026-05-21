// Author: Christian Gewehr
// verifyToken.js – Express middleware that verifies the JWT on protected routes.
// By centralising auth in a middleware function, all protected routes
// automatically reject unauthenticated requests without repeating the logic.
// The decoded userId and isAdmin flag are attached to the request object
// so route handlers can use them without decoding the token again.

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
  // JWT is expected as a Bearer token in the Authorization header (RFC 6750).
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
    // jwt.verify throws if the token is invalid or expired.
    return res.status(403).json({ error: "Invalid or expired token." });
  }
}

module.exports = verifyToken;
