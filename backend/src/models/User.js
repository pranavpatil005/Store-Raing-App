const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 50] // name must be 3-50 chars
    }
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password_hash: { // match the DB column
    type: DataTypes.STRING,
    allowNull: false
  },
  address: DataTypes.STRING,
  role: {
    type: DataTypes.ENUM("ADMIN", "USER", "STORE_OWNER"),
    defaultValue: "USER"
  }
});

module.exports = User;
