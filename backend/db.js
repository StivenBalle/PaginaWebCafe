require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false,
  }
});

// Logs de verificación
console.log("🛠️ Verificando configuración de base de datos:");
console.log("URL:", process.env.DATABASE_URL);
console.log("Host:", process.env.DB_HOST);
console.log("Puerto:", process.env.DB_PORT);
console.log("Usuario:", process.env.DB_USER);
console.log("Contraseña:", process.env.DB_PASSWORD ? "✔️ cargada" : "❌ vacía");
console.log("Base de datos:", process.env.DB_NAME);

// Probar la conexión
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Conexión exitosa a PostgreSQL");
    client.release();
  } catch (err) {
    console.error("❌ Error al conectar a PostgreSQL:", err.message);
  }
})();

module.exports = pool;