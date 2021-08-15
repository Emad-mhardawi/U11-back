const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = Schema({
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

  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  
},
{
    timestamps: true,
}
);

const User = mongoose.model("User", userSchema);

module.exports = User;