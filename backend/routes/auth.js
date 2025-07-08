const express = require('express');
const registerUser = require('../signup');
const pool = require('../../backend/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateToken, verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', async (req, res) => {
  console.log("📨 Petición recibida en /api/auth/register");
  try {
    const { name, phone_number, email, password } = req.body;
    console.log('📡 Recibiendo solicitud de registro:', { name, phone_number, email });

    if (!name || !phone_number || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const result = await registerUser(name, phone_number, email, password);
    const newUser = result.user || result;
    const token = generateToken(newUser);

    res.status(201).json({
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email }
    });
  } catch (err) {
    console.error('❌ Error en el registro:', err);
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('📝 Intento de login para:', email);

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
  }

  const client = await pool.connect();
  
  try {
    // Validación básica
    if (!email.includes('@') || password.length < 4) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    // Consultar usuario
    console.log('🔍 Buscando usuario en la base de datos...');
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    
    console.log('📊 Usuarios encontrados:', result.rows.length);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];
    console.log('👤 Usuario encontrado:', user.name);
    
    // Verificar contraseña
    console.log('🔐 Verificando contraseña...');
    const match = await bcrypt.compare(password, user.password);
    
    if (!match) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Verificar JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET no configurado');
      return res.status(500).json({ error: 'Error de configuración del servidor' });
    }

    // Generar token
    console.log('🎫 Generando token...');
    const token = generateToken(user);

    console.log('✅ Login exitoso para:', email);
    
    res.status(200).json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (err) {
    console.error('❌ Error al iniciar sesión:', err.message);
    console.error('❌ Stack trace:', err.stack);
    res.status(500).json({ error: 'Error interno del servidor.' });
  } finally {
    client.release();
  }
});

module.exports = router;