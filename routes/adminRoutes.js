/* Admin routes – only accessible with a valid JWT where isAdmin === true.
   GET /admin/carts  → returns all users with their shopping cart contents. */

const express = require("express");

module.exports = function (db) {
  const router = express.Router();
  const users = db.collection("users");
  const carts = db.collection("carts");

  // Middleware: block non-admins at the route level (belt-and-suspenders on top
  // of the verifyToken middleware already applied in testServer.js)
  router.use((req, res, next) => {
    if (!req.isAdmin) {
      return res.status(403).json({ error: "Admin access required." });
    }
    next();
  });

  // GET /admin/carts – all users + their cart items
  router.get("/carts", async (req, res) => {
    try {
      // Fetch all users (exclude password field)
      const allUsers = await users
        .find({}, { projection: { password: 0 } })
        .toArray();

      // Fetch all carts
      const allCarts = await carts.find({}).toArray();

      // Merge: attach cart items to each user
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
