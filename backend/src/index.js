require("dotenv").config();
const express = require("express");
const { sequelize } = require("./models");
const cors = require("cors");
const authenticateToken = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/users", require("./routes/users"));
app.use("/stores", require("./routes/stores"));
app.use("/ratings", require("./routes/ratings"));

// Protected test route
app.get("/dashboard", authenticateToken, (req, res) => {
  res.json({
    message: `Hello ${req.user.email}, you have access to the dashboard!`,
    user: req.user,
  });
});

// Default route
app.get("/", (req, res) => {
  res.send("✅ Server is running...");
});

// Start server
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected");

    // Sync models (do not alter schema automatically)
    return sequelize.sync({ alter: false });
  })
  .then(() => {
    console.log("✅ All models synced with database");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
  });
