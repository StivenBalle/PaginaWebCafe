const $d = document;
const $bolsas = $d.getElementById("bolsas");
const $template = $d.getElementById("bolsa-template").content;
const $fragment = $d.createDocumentFragment();
const noProductsDiv = document.getElementById("no-products");

let products, prices, stripePublicKey, stripe;
let lastProductCount = 0; 

// Función para inicializar la aplicación
async function initApp() {
  try {
    console.log("🔄 Inicializando aplicación...");
    
    // Obtener la clave pública de Stripe desde el servidor
    console.log("📡 Obteniendo configuración...");
    const configResponse = await fetch("/api/config");
    
    if (!configResponse.ok) {
      const errorText = await configResponse.text();
      console.error("❌ Error en /api/config:", errorText);
      throw new Error(`Error ${configResponse.status}: ${errorText}`);
    }
    
    const config = await configResponse.json();
    stripePublicKey = config.publishableKey;
    console.log("✅ Clave pública obtenida");
    
    // Inicializar Stripe
    stripe = Stripe(stripePublicKey);
    console.log("✅ Stripe inicializado");
    
    // Obtener productos y precios
    console.log("📦 Obteniendo productos...");
    const productsResponse = await fetch("/api/products");
    
    if (!productsResponse.ok) {
      const errorText = await productsResponse.text();
      console.error("❌ Error en /api/products:", errorText);
      throw new Error(`Error ${productsResponse.status}: ${errorText}`);
    }
    
    const data = await productsResponse.json();
    console.log("✅ Productos obtenidos:", data.products.length, "productos");

    products = data.products;
    prices = data.prices;

  if (!products.length || !prices.length) {
    document.getElementById("no-products").style.display = "block";
  } else {
    // Contar productos activos
    lastProductCount = prices.filter(el => {
      const product = products.find(p => p.id === el.product);
      return el.active && product?.active;
    }).length;

    renderProducts();
  }
  startPollingForNewProducts();

  } catch (error) {
    console.error("❌ Error completo:", error);
    console.error("❌ Stack trace:", error.stack);
    console.error("❌ Tipo de error:", typeof error);
    console.error("❌ Propiedades del error:", Object.keys(error));
    
    let message = error.message || "Error desconocido";
    let details = "";
    
    // Información adicional según el tipo de error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      details = "<p><strong>Causa probable:</strong> El servidor no está ejecutándose o no es accesible</p>";
    } else if (error.message.includes('NetworkError') || error.message.includes('ERR_CONNECTION_REFUSED')) {
      details = "<p><strong>Causa probable:</strong> No se puede conectar al servidor</p>";
    }
    
    $bolsas.innerHTML = `<div style="padding: 20px; background: #ffe6e6; border: 1px solid #ff0000; border-radius: 5px; font-family: Arial, sans-serif;">
      <h3>🔍 Error de conexión</h3>
      <p><strong>URL actual:</strong> ${window.location.href}</p>
      <p><strong>Estado del servidor:</strong> <span id="server-status">Verificando...</span></p>
    </div>`;
    
    // Intentar verificar si el servidor está respondiendo
    checkServerStatus();
  }
}

// Función para renderizar productos
function renderProducts() {

  $bolsas.innerHTML = ""; // Limpiar contenedor de productos
  const fragment = document.createDocumentFragment();
  let hasProducts = false;

  prices.forEach((el) => {
    // Buscar el producto asociado al precio
    let productData = products.find((product) => product.id === el.product);

    if (!productData || !el.active || !productData.active) return; // Saltar si no hay producto o precio inactivo
    hasProducts = true;
    // Configurar la tarjeta
    const $clone = $d.importNode($template, true);
    $clone.querySelector(".bolsa").setAttribute("data-price", el.id);
    $clone.querySelector("img").src = productData.images && productData.images.length > 0
        ? productData.images[0]
        : "aromaImagenes/Bolsa_café.png"; // Imagen por defecto
    $clone.querySelector("img").alt = productData.name || "Producto sin nombre";
    
    // Formatear el precio (unit_amount está en centavos)
    const amount = el.unit_amount / 100;
    const currency = el.currency.toUpperCase();
    const formattedPrice = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: currency,
    }).format(amount);
    
    $clone.querySelector("figcaption").innerHTML = `${productData.name || "Sin nombre"}<br>${formattedPrice}`;

    fragment.appendChild($clone);
  });

  if (hasProducts) {
    $bolsas.appendChild(fragment);
    noProductsDiv.style.display = "none";
  } else {
    noProductsDiv.style.display = "block";
  }
}

function isUserLoggedIn() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  return !!(token && user); // Devuelve true si ambos existen
}

// Event listener para clicks en productos
$d.addEventListener("click", async (e) => {
  if (e.target.closest(".bolsa")) {
    console.log("🕵️ Verificando sesión de usuario...");

    if (!isUserLoggedIn()) {
      console.warn("❌ Usuario no autenticado");

      Swal.fire({
        icon: "warning",
        title: "Inicia sesión",
        text: "Debes iniciar sesión para realizar una compra.",
        confirmButtonText: "Iniciar sesión"
      }).then(() => {
        const loginForm = document.getElementById('loginForm');
        const overlay = document.getElementById('overlay');

        if (loginForm && overlay) {
          overlay.style.display = "block";
          loginForm.style.display = "block";
          overlay.style.display = "flex";

          // Si usas un formulario de registro, escóndelo también
          const signupForm = document.getElementById('signupForm');
          if (signupForm) signupForm.style.display = "none";
        } else {
          console.error("🛑 Formulario de login no encontrado en el DOM.");
        }
      });
      return;
    }

    console.log("✅ Usuario autenticado. Procediendo con la compra...");
    const priceId = e.target.closest(".bolsa").getAttribute("data-price");

    // Buscar si el producto aún está activo
    const price = prices.find(p => p.id === priceId);
    const product = price && products.find(prod => prod.id === price.product);

    if (!price || !product || !price.active || !product.active) {
      Swal.fire({
        icon: "warning",
        title: "Producto no disponible",
        text: "Este producto ha sido retirado temporalmente.",
        confirmButtonText: "Entendido"
      }).then(() => {
        location.reload();
      });
    }

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId: priceId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const session = await response.json();
      window.location.href = session.url;

    } catch (error) {
      console.error("Error al crear sesión de checkout:", error);
      Swal.fire({
        icon: "error",
        title: "Error al procesar el pago",
        text: "Ocurrió un error inesperado.",
        confirmButtonText: "Entendido"
      }).then(() => {
        location.reload();
      });
    }
  }
});

// Función para verificar el estado del servidor
async function checkServerStatus() {
  const statusElement = document.getElementById('server-status');
  try {
    const response = await fetch('/api/config', { 
      method: 'GET',
      timeout: 5000 
    });
    
    if (response.ok) {
      statusElement.innerHTML = '✅ Servidor respondiendo correctamente';
      statusElement.style.color = 'green';
    } else {
      statusElement.innerHTML = `❌ Servidor respondió con error ${response.status}`;
      statusElement.style.color = 'red';
    }
  } catch (error) {
    statusElement.innerHTML = `❌ No se puede conectar al servidor: ${error.message}`;
    statusElement.style.color = 'red';
  }
}

// Función Polling para monitorear si hay o no productos disponibles
function startPollingForNewProducts() {
  setInterval(async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      const currentProducts = data.products;
      const currentPrices = data.prices;

      const currentActiveCount = currentPrices.filter(el => {
        const product = currentProducts.find(p => p.id === el.product);
        return el.active && product?.active;
      }).length;

      if (currentActiveCount > lastProductCount) {
        if (confirm("¡Nuevos productos disponibles! ¿Deseas recargar la página para verlos?")) {
          location.reload();
        }
        lastProductCount = currentActiveCount;
      }
    } catch (err) {
      console.warn("Error al verificar productos nuevos:", err.message);
    }
  }, 60000);
}

// Inicializar la aplicación cuando se carga la página
document.addEventListener("DOMContentLoaded", initApp);