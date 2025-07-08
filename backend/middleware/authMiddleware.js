const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

function generateToken(user) {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET no está definido en variables de entorno");
  }

  const options = {
    expiresIn: '1h',
    issuer: 'cafe-aroma.com',
    audience: user.email,
  };

  return jwt.sign(payload, secret, options);
}

module.exports = {
  verifyToken,
  generateToken
};
