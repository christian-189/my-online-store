// Author: Christian Gewehr
// productRoutes.js – CRUD routes for the product catalogue.
// GET /products is public so guests can browse without logging in.
// POST, PUT, DELETE require a valid JWT with isAdmin flag,
// following the same defence-in-depth pattern as adminRoutes.js.

const express = require("express");

module.exports = function (db) {
  const router = express.Router();
  const products = db.collection("products");

  // READ – GET /products (public)
  // Returns all products sorted by id for consistent display order.
  router.get("/", async (req, res) => {
    try {
      const all = await products.find({}).sort({ id: 1 }).toArray();
      res.json(all);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // CREATE – POST /products (admin only)
  router.post("/", async (req, res) => {
    try {
      if (!req.isAdmin) return res.status(403).json({ error: "Admin access required." });

      const { name, price, img, features } = req.body;
      if (!name || !price) return res.status(400).json({ error: "Name and price are required." });

      // Auto-increment id based on the highest existing id
      const last = await products.find({}).sort({ id: -1 }).limit(1).toArray();
      const newId = last.length > 0 ? last[0].id + 1 : 1;

      const result = await products.insertOne({
        id: newId,
        name,
        price: parseFloat(price),
        img: img || "",
        features: features || [],
      });

      res.status(201).json({ message: "Product created.", productId: result.insertedId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // UPDATE – PUT /products/:id (admin only)
  router.put("/:id", async (req, res) => {
    try {
      if (!req.isAdmin) return res.status(403).json({ error: "Admin access required." });

      const id = parseInt(req.params.id);
      const { name, price, img, features } = req.body;

      await products.updateOne(
        { id },
        { $set: { name, price: parseFloat(price), img, features } }
      );

      res.json({ message: "Product updated." });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE – DELETE /products/:id (admin only)
  router.delete("/:id", async (req, res) => {
    try {
      if (!req.isAdmin) return res.status(403).json({ error: "Admin access required." });

      const id = parseInt(req.params.id);
      await products.deleteOne({ id });
      res.json({ message: "Product deleted." });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
