const express = require('express');
const router = express.Router();
const loginUser = require('./LoginUser');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
  }

  try {
    const result = await loginUser(email, password);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error al iniciar sesión:', err.message);
    if (err.message === 'Usuario no encontrado' || err.message === 'Contraseña incorrecta') {
      return res.status(401).json({ error: err.message });
    }
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;
