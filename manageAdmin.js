// Just for testing.

const { MongoClient } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGO_URI || "mongodb://localhost:27017/myshop");

async function run() {
  await client.connect();
  const db = client.db("myshop");
  const users = db.collection("users");

  // Delete all users (including the admin).
  await users.deleteMany({});
  console.log("All users deleted.");

  await client.close();
}

run();