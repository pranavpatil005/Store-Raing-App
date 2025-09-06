require("dotenv").config();
const express = require("express");
const { sequelize } = require("./models");
const cors = require("cors");
const authenticateToken = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 4000;


app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());


app.use("/auth", require("./routes/auth"));
app.use("/users", require("./routes/users"));

app.use("/stores", require("./routes/stores"));
app.use("/ratings", require("./routes/ratings"));


app.get("/dashboard", authenticateToken, (req, res) => {
  res.json({
    message: `Hello ${req.user.email}, you have access to the dashboard!`,
    user: req.user,
  });
});

app.get("/", (req, res) => {
  res.send("✅ Server is running...");
});








sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected");

  
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
