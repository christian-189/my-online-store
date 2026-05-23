// Author: Christian Gewehr
// cartRoutes.js – CRUD routes for the shopping cart.
// All routes are protected by the verifyToken middleware applied in testServer.js.
// The cart is stored as a single document per user containing an array of items,
// which suits MongoDB's document model and avoids joins across collections.
// userId is taken from req.userId (set by verifyToken) instead of req.body,
// preventing users from manipulating other users' carts by sending a fake userId.

const express = require("express");

module.exports = function (db) {
  const router = express.Router();
  const carts = db.collection("carts");

  // CREATE / ADD TO CART – POST /cart
  // Merges new items with existing ones rather than replacing the cart,
  // so adding the same product twice increments the quantity instead of
  // creating a duplicate entry.
  router.post("/", async (req, res) => {
    try {
      const userId = req.userId; // extracted from JWT by verifyToken middleware
      const { items: newItems } = req.body;
      const cart = await carts.findOne({ userId });
      let items = cart?.items || [];

      newItems.forEach(newItem => {
        const existing = items.find(i => i.id === newItem.id);
        if (existing) existing.quantity += newItem.quantity;
        else items.push(newItem);
      });

      await carts.updateOne({ userId }, { $set: { items } }, { upsert: true });
      res.json({ items });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // READ – GET /cart
  router.get("/", async (req, res) => {
    try {
      const userId = req.userId;
      const cart = await carts.findOne({ userId });
      res.json({ items: cart?.items || [] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // UPDATE quantity – PUT /cart/:id
  router.put("/:id", async (req, res) => {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const { quantity } = req.body;

      const cart = await carts.findOne({ userId });
      if (!cart) return res.status(404).json({ error: "Cart not found" });

      const items = cart.items.map(i =>
        i.id === parseInt(id) ? { ...i, quantity } : i
      );

      await carts.updateOne({ userId }, { $set: { items } });
      res.json({ items });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE item – DELETE /cart/:id
  router.delete("/:id", async (req, res) => {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const cart = await carts.findOne({ userId });
      if (!cart) return res.status(404).json({ error: "Cart not found" });

      const items = cart.items.filter(i => i.id !== parseInt(id));
      await carts.updateOne({ userId }, { $set: { items } });
      res.json({ items });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};