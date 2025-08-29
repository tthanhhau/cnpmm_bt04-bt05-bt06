const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

async function register({ name, email, password }) {
  email = (email || '').toLowerCase().trim();
  const exists = await User.findOne({ email });
  if (exists) throw new Error('Email already in use');
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash });
  return { id: user._id.toString(), name: user.name, email: user.email };
}

async function login({ email, password }) {
  email = (email || '').toLowerCase().trim();
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid email or password');
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error('Invalid email or password');
  const payload = { id: user._id.toString(), email: user.email, name: user.name, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'super_secret_change_me', { expiresIn: '2h' });
  return { token, user: payload };
}

module.exports = { register, login };
