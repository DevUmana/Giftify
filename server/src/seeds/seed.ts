import db from "../config/connection.js";
import cleanDB from "./cleanDb.js";
import User from "../models/User.js";
import mongoose from "mongoose";

try {
  await db();
  await cleanDB();

  // Seed one user to the database, with 3 recipients
  const user = new User({
    id: new mongoose.Types.ObjectId().toString(),
    username: "seededUser",
    email: "testuser@example.com",
    password: "password123",
    recipientList: [
      {
        name: "David B",
        gender: "Male",
        age: 25,
        gifts: [],
        recipientId: new mongoose.Types.ObjectId().toString(),
        budget: 100,
        status: true,
      },
      {
        name: "David U",
        gender: "Male",
        age: 32,
        gifts: [],
        recipientId: new mongoose.Types.ObjectId().toString(),
        budget: 150,
        status: false,
      },
      {
        name: "Alex B",
        gender: "Female",
        age: 20,
        gifts: [],
        recipientId: new mongoose.Types.ObjectId().toString(),
        budget: 200,
        status: true,
      },
    ],
  });

  await user.save();

  console.log("User seeded successfully");
} catch (err) {
  console.error("Error seeding user:", err);
  process.exit(1);
}
