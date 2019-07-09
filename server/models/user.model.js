const mongoose = require('mongoose');
const argon2 = require('argon2');

// If user does not validate their email within 24 hrs,
// their account will be deleted by default
const UserSchema = new mongoose.Schema({
  address: { type: String, required: false, unique: true },
  nonce: { type: int, required: false, default: () => Math.floor(Math.random() * 1000000),  }
});

// Argon2 is used to hash passwords instead of bcrypt https://password-hashing.net/
UserSchema.methods.isValidPassword = async function(password){
  const user = this;
  const verify = await argon2.verify(user.local.password, password);
  return verify;
}

module.exports = mongoose.model('user', UserSchema);
