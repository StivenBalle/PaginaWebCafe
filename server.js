const express = require("express");
const Stripe = require("stripe");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

// Verificar que las variables de entorno estén configuradas
if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PUBLIC_KEY) {
  console.error("❌ Error: Faltan las claves de Stripe en el archivo .env");
  console.error("Asegúrate de tener STRIPE_SECRET_KEY y STRIPE_PUBLIC_KEY");
  process.exit(1);
}

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

// Middleware de logging para debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Servir archivos estáticos DESPUÉS de las rutas API
// Endpoint para obtener la clave pública de Stripe
app.get("/api/config", (req, res) => {
  console.log("📡 Solicitando configuración de Stripe");
  res.json({
    publishableKey: process.env.STRIPE_PUBLIC_KEY,
  });
});

// Endpoint para obtener productos y precios
app.get("/api/products", async (req, res) => {
  console.log("📦 Solicitando productos de Stripe");
  try {
    const products = await stripe.products.list();
    const prices = await stripe.prices.list();
    console.log(`✅ Productos obtenidos: ${products.data.length} productos, ${prices.data.length} precios`);
    res.json({ products: products.data, prices: prices.data });
  } catch (error) {
    console.error("❌ Error al obtener productos:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para crear sesión de checkout
app.post("/api/create-checkout-session", async (req, res) => {
  console.log("💳 Creando sesión de checkout");
  try {
    const { priceId } = req.body;
    
    if (!priceId) {
      return res.status(400).json({ error: "priceId es requerido" });
    }
    
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription", // Cambia a "payment" si no es suscripción
      success_url: `${req.headers.origin || 'http://localhost:3000'}/assets/successfulPayment.html`,
      cancel_url: `${req.headers.origin || 'http://localhost:3000'}/assets/paymentCanceled.html`,
    });

    console.log("✅ Sesión de checkout creada:", session.id);
    res.json({ url: session.url });
  } catch (error) {
    console.error("❌ Error al crear sesión de checkout:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Servir archivos estáticos desde la raíz del proyecto (no desde 'public')
app.use(express.static(__dirname));

// Ruta específica para servir el index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Manejar rutas que no existen
app.use((req, res) => {
  if (req.url.startsWith('/api/')) {
    res.status(404).json({ error: `API endpoint not found: ${req.url}` });
  } else {
    // Para cualquier otra ruta, intentar servir el archivo
    res.status(404).send('Página no encontrada');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend en http://localhost:${PORT}`);
  console.log(`📂 Archivos estáticos en http://localhost:${PORT}`);
  console.log(`🔧 API disponible en http://localhost:${PORT}/api/`);
});