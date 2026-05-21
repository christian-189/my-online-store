// Author: Christian Gewehr
// adminRoutes.js – Admin-only routes, protected by verifyToken middleware
// applied in testServer.js. An additional isAdmin check here follows the
// principle of defence in depth: even if the middleware is misconfigured,
// non-admin users cannot access these routes.

const express = require("express");

module.exports = function (db) {
  const router = express.Router();
  const users = db.collection("users");
  const carts = db.collection("carts");

  // Secondary admin guard on top of verifyToken middleware.
  router.use((req, res, next) => {
    if (!req.isAdmin) {
      return res.status(403).json({ error: "Admin access required." });
    }
    next();
  });

  // GET /admin/carts – returns all users merged with their cart contents.
  // The password field is excluded from the projection for security.
  router.get("/carts", async (req, res) => {
    try {
      const allUsers = await users
        .find({}, { projection: { password: 0 } })
        .toArray();

      const allCarts = await carts.find({}).toArray();

      // Merge users and carts in memory to avoid multiple round-trips
      // to the database or a complex aggregation pipeline.
      const result = allUsers.map(user => {
        const cart = allCarts.find(c => c.userId === user._id.toString());
        return {
          ...user,
          cartItems: cart?.items || [],
          cartTotal: (cart?.items || []).reduce(
            (sum, item) => sum + item.price * item.quantity, 0
          ),
        };
      });

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
