// seedProducts.js – One-time script to insert the product catalogue into MongoDB.
// Run this once with: node seedProducts.js
// Safe to re-run: clears the collection before inserting to avoid duplicates.

const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017/myshop";
const client = new MongoClient(uri);

const products = [
  { id: 1, name: "Beach towel", price: 19.99, img: "/pics/beach/towel.jpg",
    features: ["Perfect towel for sunny beach days", "Keeps you sandfree", "100% cotton – softer than ever before", "Safe for kids; no chemicals used."] },
  { id: 2, name: "Cowboy hat", price: 19.99, img: "/pics/beach/hat.jpg",
    features: ["A stylish must-have", "Keeps your head cool", "100% cowboy vibes", "Aussie made"] },
  { id: 3, name: "Drinking bottle", price: 9.99, img: "/pics/beach/bottle.jpg",
    features: ["Leak proof", "BPA free", "500ml capacity", "Lightweight"] },
  { id: 4, name: "Cutting board", price: 14.99, img: "/pics/kitchen/cutting_board.jpg",
    features: ["Durable bamboo", "Perfect size", "Easy to clean", "Eco-friendly"] },
  { id: 5, name: "Chef's knife", price: 29.99, img: "/pics/kitchen/knife.jpg",
    features: ["Razor sharp", "Ergonomic handle", "Stainless steel", "Dishwasher safe"] },
  { id: 6, name: "Kitchen pan", price: 39.99, img: "/pics/kitchen/pan.jpg",
    features: ["Stainless steel", "Anti-stick coating", "Oven safe", "Easy to clean"] },
  { id: 7, name: "Kitchen scale", price: 24.99, img: "/pics/kitchen/scale.jpg",
    features: ["Accurate measurements", "Tare function", "Retro design", "Your best kitchen mate"] },
  { id: 8, name: "Pepper mill", price: 12.99, img: "/pics/kitchen/pepper_mill.jpg",
    features: ["Grinds your pepper smoothly", "Ceramic grinder", "Easy to handle", "Adds flavor to your dishes"] },
  { id: 9, name: "Garden chair", price: 49.99, img: "/pics/garden/chair.jpg",
    features: ["Comfortable seating", "Weather resistant", "100% wood", "Perfect for outdoor relaxation"] },
  { id: 10, name: "Hammock", price: 59.99, img: "/pics/garden/hammock.jpg",
    features: ["Perfect for relaxing", "Durable fabric", "Easy to set up", "Your personal paradise"] },
];

async function seed() {
  try {
    await client.connect();
    const db = client.db("myshop");
    const collection = db.collection("products");

    // Clear existing products to avoid duplicates on re-run
    await collection.deleteMany({});
    await collection.insertMany(products);
    console.log(`Inserted ${products.length} products into MongoDB.`);
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await client.close();
  }
}

seed();
