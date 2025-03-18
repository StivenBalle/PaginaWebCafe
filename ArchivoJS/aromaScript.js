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
