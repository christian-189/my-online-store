// Author: Christian Gewehr
// testServer.js – Express server entry point.
// Environment variables are loaded from .env via dotenv so that sensitive
// values like JWT_SECRET and the MongoDB URI are never hardcoded in source code.

require("dotenv").config();
const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const uri = process.env.MONGO_URI || "mongodb://localhost:27017/myshop";
const PORT = process.env.PORT || 3000;
const client = new MongoClient(uri);

async function startServer() {
  try {
    await client.connect();
    const db = client.db("myshop");
    console.log("Connected to MongoDB");

    const verifyToken = require("./middleware/verifyToken");

    // Public routes – no token required
    const authRoutes = require("./routes/authRoutes")(db);
    app.use("/auth", authRoutes);

    // Products: GET is public, POST/PUT/DELETE require admin JWT
    // verifyToken is applied globally here; admin check is inside the route handler
    const productRoutes = require("./routes/productRoutes")(db);
    app.use("/products", (req, res, next) => {
      if (req.method === "GET") return next();
      verifyToken(req, res, next);
    }, productRoutes);

    // Protected routes – verifyToken middleware validates the JWT
    const cartRoutes = require("./routes/cartRoutes")(db);
    app.use("/cart", verifyToken, cartRoutes);

    const adminRoutes = require("./routes/adminRoutes")(db);
    app.use("/admin", verifyToken, adminRoutes);

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Error connecting to DB:", err);
  }
}

startServer();
