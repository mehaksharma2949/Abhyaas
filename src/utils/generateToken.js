// utils/generateToken.js
const jwt = require('jsonwebtoken');

function generateToken(payload) {
  // replace process.env.JWT_SECRET with your secret string if env missing
  const secret = process.env.JWT_SECRET || 'change_this_secret';
  // token payload can be user id and role — adjust as needed
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

module.exports = generateToken;
