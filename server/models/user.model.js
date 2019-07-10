const mongoose = require('mongoose');

// If user does not validate their email within 24 hrs,
// their account will be deleted by default
const UserSchema = new mongoose.Schema({
  address: { type: String, required: false, unique: true },
  nonce: { type: Number, required: false, default: () => Math.floor(Math.random() * 1000000),  }
});

module.exports = mongoose.model('user', UserSchema);
