const pool = require('../backend/db');
const bcrypt = require('bcrypt');

async function registerUser(name, phone_number, email, password) {
  try {
    console.log("📥 Datos recibidos del formulario:", { name, phone_number, email });
    console.log("📡 Verificando si el correo ya existe...");
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      throw new Error('Ya existe una cuenta con este correo.');
    }

    console.log("🔐 Hasheando la contraseña...");
    const hashed = await bcrypt.hash(password, 10);

    console.log("📄 Insertando nuevo usuario...");
    await pool.query(
      'INSERT INTO users (name, phone_number, email, password) VALUES ($1, $2, $3, $4)',
      [name, phone_number, email, hashed]
    );

    console.log("✅ Usuario registrado con éxito.");
    return { message: 'Usuario registrado con éxito' };
  } catch (err) {
    console.error('❌ Error en registerUser:', err);
    throw err;
  }
}
module.exports = registerUser;