// backend/src/routes/seed.js
const express = require("express");
const router = express.Router();
const { User } = require("../models");
const bcrypt = require("bcrypt");

router.get("/seed", async (req, res) => {
  try {
    const passwordHash = await bcrypt.hash("Password@123", 10);
    await User.create({
      name: "Admin",
      email: "admin@example.com",
      password: passwordHash,
      role: "ADMIN",
    });
    res.send("✅ Production DB seeded");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Seeding failed");
  }
});

module.exports = router;
