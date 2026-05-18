/* Implements the routing functions and also error handling.*/

const express = require("express");

module.exports = function (db) {
  const router = express.Router();
  const carts = db.collection("carts");

  // CREATE / ADD TO CART
  router.post("/", async (req, res) => {
    try {
      const { userId, items: newItems } = req.body;
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

  // UPDATE quantity
  router.put("/:userId/:id", async (req, res) => {
    try {
      const { userId, id } = req.params;
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

  // DELETE item
  router.delete("/:userId/:id", async (req, res) => {
    try {
      const { userId, id } = req.params;
      const cart = await carts.findOne({ userId });
      if (!cart) return res.status(404).json({ error: "Cart not found" });

      const items = cart.items.filter(i => i.id !== parseInt(id));
      await carts.updateOne({ userId }, { $set: { items } });
      res.json({ items });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET Cart
  router.get("/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const cart = await carts.findOne({ userId });
      res.json({ items: cart?.items || [] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};