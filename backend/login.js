const pool = require('../backend/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function loginUser(email, password) {
  const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (users.length === 0) throw new Error('Usuario no encontrado');

  const user = users[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Contraseña incorrecta');

  const token = jwt.sign({ id: user.id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return { token, user: { id: user.id, name: user.name, email: user.email } };
}

module.exports = loginUser;
