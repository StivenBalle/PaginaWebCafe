const express = require("express");
const Stripe = require("stripe");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();

// Verifica variables de entorno
if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PUBLIC_KEY) {
  console.error("❌ Claves de Stripe faltantes en .env");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Servir archivos estáticos

// Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Obtener clave pública
app.get("/api/config", (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLIC_KEY,
  });
});

// Obtener los productos
app.get("/api/products", async (req, res) => {
  console.log("📦 Solicitando productos activos de Stripe");
  try {
    const productsRes = await stripe.products.list({ active: true });
    const pricesRes = await stripe.prices.list({ active: true });

    const products = productsRes.data;
    const prices = pricesRes.data;

    // Filtrar solo precios que tengan un producto válido
    const validPrices = prices.filter(price =>
      products.some(product => product.id === price.product)
    );

    console.log(`✅ Productos activos: ${products.length}`);
    console.log(`✅ Precios activos válidos: ${validPrices.length}`);

    res.json({
      products,
      prices: validPrices
    });

  } catch (error) {
    console.error("❌ Error al obtener productos:", error.message);
    res.status(500).json({ error: error.message });
  }
});


// Crear sesión de pago
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { priceId } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: "El campo 'priceId' es obligatorio." });
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription", // Cambia a "payment" si es pago único
      success_url: `${req.headers.origin || 'http://localhost:3000'}/assets/successfulPayment.html`,
      cancel_url: `${req.headers.origin || 'http://localhost:3000'}/assets/paymentCanceled.html`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("❌ Error creando sesión de pago:", error);
    res.status(500).json({
      error: "No se pudo crear la sesión de pago.",
      details: error.message,
    });
  }
});

// Ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  if (req.url.startsWith("/api/")) {
    res.status(404).json({ error: `Ruta de API no encontrada: ${req.url}` });
  } else {
    res.status(404).send("Página no encontrada");
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});
