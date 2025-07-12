const showFormButton = document.getElementById("show-form-button");
const formContainer = document.getElementById("form-container");
const overlay = document.getElementById("overlay");
const closeButton = document.getElementById("close-button");

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Cargar el encabezado
    const headerResponse = await fetch('/assets/header.html');
    if (!headerResponse.ok) throw new Error('Error al cargar header.html');
    const headerContent = await headerResponse.text();
    document.body.insertAdjacentHTML('afterbegin', headerContent);

    document.addEventListener("componentsLoaded", () => {
      const hamburgerMenu = document.querySelector(".hamburger-menu");
      const navLinks = document.querySelector(".nav-links");

      if (hamburgerMenu && navLinks) {
        hamburgerMenu.addEventListener("click", () => {
          navLinks.classList.toggle("active");
        });
      }
    });

    // Cargar los formularios
    const formsResponse = await fetch('/assets/forms.html');
    if (!formsResponse.ok) throw new Error('Error al cargar forms.html');
    const formsContent = await formsResponse.text();
    document.body.insertAdjacentHTML('beforeend', formsContent);

    // Cargar el pie de página
    const footerResponse = await fetch('/assets/footer.html');
    if (!footerResponse.ok) throw new Error('Error al cargar footer.html');
    const footerContent = await footerResponse.text();
    document.body.insertAdjacentHTML('beforeend', footerContent);

    // Cargar scripts adicionales y esperar a que terminen
    const scripts = [
      '../ArchivoJS/authFront.js',
      '../ArchivoJS/aromaScript.js'
    ];

    let loadedScripts = 0;

    scripts.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      script.type = 'module';
      script.onload = () => {
        loadedScripts++;
        if (loadedScripts === scripts.length) {
          // Ahora que ambos scripts han cargado, disparamos el evento
          document.dispatchEvent(new Event('componentsLoaded'));
        }
      };
      document.body.appendChild(script);
    });

  } catch (error) {
    console.error('❌ Error al cargar componentes:', error);
  }
});

showFormButton.addEventListener("click", function (event) {
  event.preventDefault();
  formContainer.style.display = "block";
  overlay.style.display = "block";
});

// Ocultar el formulario y la capa al hacer clic fuera del formulario
const showForm = document.getElementById("showFormButton");
const overlayButton = document.getElementById("overlay");

// Muestra el formulario cuando se hace clic en el botón
showFormButton.addEventListener("click", () => {
  overlay.style.display = "flex";
});

// Opción para cerrar el formulario haciendo clic fuera
overlay.addEventListener("click", (event) => {
  if (event.target === overlay) {
    overlay.style.display = "none";
  }
});

// Descarga el informe de sostenibilidad
document.querySelector('.download-button').addEventListener('click', function (event) {
  event.preventDefault(); // Evitar el comportamiento predeterminado del enlace
  alert('Gracias por descargar nuestro Informe de Sostenibilidad.');
  window.location.href = this.href; // Iniciar la descarga manualmente
});

function checkAuthStatus() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  
  if (token && user) {
      const userData = JSON.parse(user);
      showUserProfile(userData);
  } else {
      showLoginButton();
  }
}

// Función para mostrar el perfil del usuario
function showUserProfile(userData) {
  const showFormButton = document.getElementById("show-form-button");
  const userProfile = document.getElementById("user-profile");
  const userName = document.getElementById("user-name");
  const userAvatar = document.getElementById("logout-initial");
  
  // Ocultar botón de login
  showFormButton.classList.add("auth-hidden");
  
  // Mostrar perfil de usuario
  userProfile.classList.remove("auth-hidden");
  userProfile.classList.add("auth-visible");
  
  // Configurar información del usuario
  userName.textContent = userData.name || "Usuario";
  userAvatar.textContent = (userData.name || "U").charAt(0).toUpperCase();
}

// Función para mostrar el botón de login
function showLoginButton() {
  const showFormButton = document.getElementById("show-form-button");
  const userProfile = document.getElementById("user-profile");
  
  // Mostrar botón de login
  showFormButton.classList.remove("auth-hidden");
  
  // Ocultar perfil de usuario
  userProfile.classList.add("auth-hidden");
  userProfile.classList.remove("auth-visible");
}

// Función para cerrar sesión
function logout() {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Se cerrará tu sesión actual',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, cerrar sesión',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#8B4513'
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
        
      Swal.fire({
        icon: 'success',
        title: 'Sesión cerrada',
        text: 'Has cerrado sesión exitosamente',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        checkAuthStatus();
        window.location.href = "/index.html";
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", function() {
  checkAuthStatus();
  document.getElementById("logout-btn").addEventListener("click", logout);
});

// Escuchar cambios en el localStorage (para sincronizar entre pestañas)
window.addEventListener('storage', function(e) {
  if (e.key === 'token' || e.key === 'user') {
      checkAuthStatus();
  }
});