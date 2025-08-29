const userService = require('../services/userService');

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const result = await userService.register({ name, email, password });
    return res.status(201).json({ message: 'Registered successfully', user: result });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Registration failed' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    const result = await userService.login({ email, password });
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Login failed' });
  }
}

module.exports = { register, login };
