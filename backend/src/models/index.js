// src/models/index.js
const sequelize = require("../config/db");
const User = require("./User");
const Store = require("./Store");
const Rating = require("./Rating");

// --------------------
// Define associations
// --------------------

// User -> Rating
User.hasMany(Rating, { foreignKey: "userId", onDelete: "CASCADE" });
Rating.belongsTo(User, { foreignKey: "userId" });

// Store -> Rating
Store.hasMany(Rating, { foreignKey: "storeId", onDelete: "CASCADE" });
Rating.belongsTo(Store, { foreignKey: "storeId" });

// Store Owner -> Store
User.hasMany(Store, { foreignKey: "ownerId", as: "OwnedStores" });
Store.belongsTo(User, { foreignKey: "ownerId", as: "Owner" });

// --------------------
// Sync models
// --------------------
sequelize
  .sync({ alter: false }) // set { force: true } for a full reset
  .then(() => console.log("✅ All models synced with database"))
  .catch((err) => console.error("❌ Error syncing models:", err));

module.exports = { sequelize, User, Store, Rating };
