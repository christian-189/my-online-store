const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const uri = "mongodb://localhost:27017/myshop";
const client = new MongoClient(uri);

async function startServer() {
  try {
    await client.connect();
    const db = client.db("myshop");
    console.log("Connected to MongoDB");

    // ── Public routes (no token required) ────────────────────────────────
    const authRoutes = require("./routes/authRoutes")(db);
    app.use("/auth", authRoutes);

    // ── Protected routes (JWT required) ──────────────────────────────────
    const verifyToken = require("./middleware/verifyToken");
    const cartRoutes = require("./routes/cartRoutes")(db);
    app.use("/cart", verifyToken, cartRoutes);

    // Admin route is also imported here once you build it:
    const adminRoutes = require("./routes/adminRoutes")(db);
    app.use("/admin", verifyToken, adminRoutes);

    app.listen(3000, () => console.log("Server running on port 3000"));
  } catch (err) {
    console.error("Error connecting to DB:", err);
  }
}

startServer();
