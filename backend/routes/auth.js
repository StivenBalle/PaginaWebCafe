const express = require('express');
const registerUser = require('../signup');
const loginUser = require('../login');

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
    res.json(result);
  } catch (err) {
    console.error('❌ Error en el registro:', err);
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

module.exports = router;
