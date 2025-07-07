const showFormButton = document.getElementById("show-form-button");
const formContainer = document.getElementById("form-container");
const overlay = document.getElementById("overlay");
const closeButton = document.getElementById("close-button");

document.addEventListener("DOMContentLoaded", () => {
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  const navLinks = document.querySelector(".nav-links");

  hamburgerMenu.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
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