const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = Schema(
  {
    username: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      city: { type: String, required: false },
      country: { type: String, required: false },
      region: { type: String, required: false },
    },

    phoneNumber: {
      type: String,
      required: false,
    },

    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },

    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
