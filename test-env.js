const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

console.log("🔍 DIAGNÓSTICO COMPLETO DEL PROYECTO");
console.log(50);

// 1. Verificar directorio actual
console.log("📁 Directorio actual:", __dirname);

// 2. Verificar archivo .env
console.log("\n🔧 VERIFICANDO ARCHIVO .ENV:");
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log("✅ Archivo .env existe");
  dotenv.config();
  
  const requiredVars = ['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY'];
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Configurada (${process.env[varName].substring(0, 10)}...)`);
    } else {
      console.log(`❌ ${varName}: NO ENCONTRADA`);
    }
  });
} else {
  console.log("❌ Archivo .env NO EXISTE en:", envPath);
}

// 3. Verificar estructura de carpetas
console.log("\n📂 VERIFICANDO ESTRUCTURA DE CARPETAS:");

// Verificar index.html en la raíz
const indexPath = path.join(__dirname, 'index.html');
if (fs.existsSync(indexPath)) {
  console.log("✅ index.html existe en la raíz");
} else {
  console.log("❌ index.html NO EXISTE en la raíz");
}

// Verificar carpeta assets
const assetsPath = path.join(__dirname, 'assets');
if (fs.existsSync(assetsPath)) {
  console.log("✅ Carpeta 'assets' existe");
  
  const assetFiles = ['successfulPayment.html', 'paymentCanceled.html'];
  assetFiles.forEach(file => {
    const filePath = path.join(assetsPath, file);
    if (fs.existsSync(filePath)) {
      console.log(`  ✅ assets/${file} existe`);
    } else {
      console.log(`  ❌ assets/${file} NO EXISTE`);
    }
  });
} else {
  console.log("❌ Carpeta 'assets' NO EXISTE");
}

// Verificar carpeta Estilos
const estilosPath = path.join(__dirname, 'Estilos');
if (fs.existsSync(estilosPath)) {
  console.log("✅ Carpeta 'Estilos' existe");
} else {
  console.log("❌ Carpeta 'Estilos' NO EXISTE");
}

// Verificar carpeta ArchivoJS
const archivoJSPath = path.join(__dirname, 'ArchivoJS');
if (fs.existsSync(archivoJSPath)) {
  console.log("✅ Carpeta 'ArchivoJS' existe");
  
  const jsPath = path.join(archivoJSPath, 'app.js');
  if (fs.existsSync(jsPath)) {
    console.log("  ✅ ArchivoJS/app.js existe");
  } else {
    console.log("  ❌ ArchivoJS/app.js NO EXISTE");
  }
} else {
  console.log("❌ Carpeta 'ArchivoJS' NO EXISTE");
}

// 4. Verificar dependencias
console.log("\n📦 VERIFICANDO DEPENDENCIAS:");
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  console.log("✅ package.json existe");
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const dependencies = packageJson.dependencies || {};
    
    const required = ['express', 'stripe', 'dotenv', 'cors'];
    required.forEach(dep => {
      if (dependencies[dep]) {
        console.log(`  ✅ ${dep}: ${dependencies[dep]}`);
      } else {
        console.log(`  ❌ ${dep}: NO INSTALADA`);
      }
    });
  } catch (error) {
    console.log("❌ Error al leer package.json:", error.message);
  }
} else {
  console.log("❌ package.json NO EXISTE");
  console.log("💡 Ejecuta: npm init -y && npm install express stripe dotenv cors");
}

// 5. Test de conexión con Stripe
console.log("\n🔌 VERIFICANDO CONEXIÓN CON STRIPE:");
if (process.env.STRIPE_SECRET_KEY) {
  try {
    const Stripe = require("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    stripe.products.list({ limit: 1 })
      .then(() => {
        console.log("✅ Conexión con Stripe API exitosa");
      })
      .catch((error) => {
        console.log("❌ Error en Stripe API:", error.message);
      });
  } catch (error) {
    console.log("❌ Error al inicializar Stripe:", error.message);
  }
} else {
  console.log("❌ No se puede probar Stripe sin STRIPE_SECRET_KEY");
}

// 6. Verificar puerto disponible
console.log("\n🌐 VERIFICANDO PUERTO 3000:");
const testServer = express();
const server = testServer.listen(3000, () => {
  console.log("✅ Puerto 3000 disponible");
  server.close();
}).on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log("⚠️  Puerto 3000 ya está en uso");
    console.log("💡 Detén otros servicios o usa otro puerto");
  } else {
    console.log("❌ Error al verificar puerto:", error.message);
  }
});

console.log("\n"+50);
console.log("✅ Diagnóstico completado. Revisa los errores marcados con ❌");