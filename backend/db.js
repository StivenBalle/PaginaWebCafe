require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Logs de verificación
console.log("🛠️ Verificando configuración de base de datos:");
console.log("Host:", process.env.DB_HOST);
console.log("Puerto:", process.env.DB_PORT);
console.log("Usuario:", process.env.DB_USER);
console.log("Contraseña:", process.env.DB_PASSWORD ? "✔️ cargada" : "❌ vacía");
console.log("Base de datos:", process.env.DB_NAME);

// Probar la conexión
pool.connect()
  .then(client => {
    console.log("✅ Conexión exitosa a PostgreSQL");
    client.release(); // ¡IMPORTANTE!
  })
  .catch(err => {
    console.error("❌ Error al conectar a PostgreSQL:", err.message);
  });

module.exports = pool;