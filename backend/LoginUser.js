const pool = require('../backend/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function loginUser(email, password) {
  return new Promise((resolve, reject) => {
    if (!email.includes('@') || password.length < 4) {
      return reject(new Error('Credenciales inválidas'));
    }

    pool.query('SELECT * FROM users WHERE email = $1', [email], async (err, result) => {
      if (err) {
        return reject(err);
      }

      if (result.rows.length === 0) {
        return reject(new Error('Usuario no encontrado'));
      }

      try {
        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);
        
        if (!match) {
          return reject(new Error('Contraseña incorrecta'));
        }

        if (!process.env.JWT_SECRET) {
          return reject(new Error('JWT_SECRET no está configurado'));
        }

        const token = jwt.sign(
          { id: user.id, email: user.email, name: user.name },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );

        resolve({
          token,
          user: { id: user.id, name: user.name, email: user.email }
        });
      } catch (error) {
        reject(error);
      }
    });
  });
}

module.exports = loginUser;
