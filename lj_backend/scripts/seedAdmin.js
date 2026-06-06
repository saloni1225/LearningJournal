require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const ADMIN = {
  role: "admin",
  username: "admin",
  password: "admin123",
  fullName: "System Admin",
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const existing = await User.findOne({ username: ADMIN.username, role: "admin" });
  if (existing) {
    console.log("Admin user already exists (username: admin)");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(ADMIN.password, 10);
  await User.create({ ...ADMIN, password: hashedPassword });
  console.log("Admin created — username: admin | password: admin123");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
