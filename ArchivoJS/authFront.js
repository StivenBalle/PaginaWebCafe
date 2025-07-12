// Inicializar cuando el DOM esté cargado
document.addEventListener("componentsLoaded", function() {
  checkAuthStatus();
  
  // Agregar evento al botón de cerrar sesión si existe
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
  const loginLink = document.getElementById("login-link");
  const loginFormDiv = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (loginLink && loginFormDiv && signupForm) {
    loginLink.addEventListener("click", () => {
      signupForm.style.display = "none";
      loginFormDiv.style.display = "block";
      document.getElementById("overlay").style.display = "flex";
    });
  }
  // Y lo mismo para signup-link
  const signupLink = document.getElementById("signup-link");
  if (signupLink) {
    signupLink.addEventListener("click", () => {
      signupForm.style.display = "block";
      loginFormDiv.style.display = "none";
      document.getElementById("overlay").style.display = "flex";
    });
  }
});

const form = document.getElementById("signupForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("✅ Evento de envío capturado");

  const name = document.querySelector("#name_user").value.trim();
  const phone_number = document.querySelector("#phone_user").value.trim();
  const email = document.querySelector("#email_user").value.trim();
  const password = document.querySelector("#password_user").value;

  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{7,15}$/;
  const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s+[A-Za-zÁÉÍÓÚáéíóúÑñ]+)+$/;

  if (!nameRegex.test(name)) {
    return Swal.fire({
      icon: "warning",
      title: "Nombre inválido",
      text: "Debe ingresar al menos nombre y apellido",
    });
  }

  if (!phoneRegex.test(phone_number)) {
    return Swal.fire({
      icon: "warning",
      title: "Teléfono inválido",
      text: "Solo se permiten números (7 a 15 dígitos)",
    });
  }

  if (!emailRegex.test(email)) {
    return Swal.fire({
      icon: "warning",
      title: "Email inválido",
      text: "Debe tener el formato nombre@dominio.com",
    });
  }

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone_number, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "✅ Registro exitoso",
        text: data.message || "Usuario registrado correctamente",
        timer: 2000,
        showConfirmButton: false
      });
      form.reset();
    } else {
      Swal.fire({
        icon: "error",
        title: "❌ Error al registrar",
        text: data.error || "Ocurrió un error inesperado",
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "❌ Error del servidor",
      text: error.message || "No se pudo conectar con el servidor",
    });
  }
});

const signupLink = document.getElementById("signup-link");

signupLink.addEventListener("click", () => {
  document.getElementById("signupForm").style.display = "block";
  document.getElementById("loginForm").style.display = "none";
});

const closeButton = document.getElementById("close-button-form");
closeButton.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("overlay").style.display = "none";;
});

const closeButtonLogin = document.getElementById("close-button-login");
closeButtonLogin.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("overlay").style.display = "none";;
});

document.querySelector(".form-login").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email_login").value.trim();
  const password = document.getElementById("password_login").value;

  if (!email || !password) {
    Swal.fire({
      icon: "warning",
      title: "Campos requeridos",
      text: "Por favor ingresa email y contraseña",
    });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return Swal.fire({
      icon: "warning",
      title: "Email inválido",
      text: "Debe tener el formato nombre@dominio.com",
    });
  }

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      // Guardar token y usuario en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      Swal.fire({
        icon: "success",
        title: "Bienvenido",
        text: `Hola, ${data.user.name}`,
        timer: 1000,
        showConfirmButton: false
      }).then(() => {
        // Actualizar la UI inmediatamente
        updateAuthUI();
        
        // Cerrar el modal/formulario si existe
        closeAuthModal();
        
        // Opcional: redirigir después de un breve delay
        setTimeout(() => {
          window.location.href = "/index.html";
        }, 1000);
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: data.error,
      });
    }
  } catch (error) {
    console.error("Error en login:", error);
    Swal.fire({
      icon: "error",
      title: "Oops",
      text: "No se pudo conectar al servidor",
    });
  }
});

// Función para actualizar la UI después del login
function updateAuthUI() {
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
  
  if (showFormButton && userProfile) {
    // Ocultar botón de login
    showFormButton.classList.add("auth-hidden");
    
    // Mostrar perfil de usuario
    userProfile.classList.remove("auth-hidden");
    userProfile.classList.add("auth-visible");
    
    // Configurar información del usuario
    if (userName) userName.textContent = userData.name || "Usuario";
    if (userAvatar) userAvatar.textContent = (userData.name || "U").charAt(0).toUpperCase();
  }
}

// Función para mostrar el botón de login
function showLoginButton() {
  const showFormButton = document.getElementById("show-form-button");
  const userProfile = document.getElementById("user-profile");
  
  if (showFormButton && userProfile) {
    // Mostrar botón de login
    showFormButton.classList.remove("auth-hidden");
    
    // Ocultar perfil de usuario
    userProfile.classList.add("auth-hidden");
    userProfile.classList.remove("auth-visible");
  }
}

// Función para cerrar el modal/formulario de autenticación
function closeAuthModal() {
  // Personaliza esta función según tu implementación de modal
  const modal = document.getElementById("auth-modal");
  const overlay = document.getElementById("modal-overlay");
  
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("active");
  }
  
  if (overlay) {
    overlay.style.display = "none";
    overlay.classList.remove("active");
  }
  
  // Si usas clases para mostrar/ocultar
  const authForm = document.querySelector(".auth-form-container");
  if (authForm) {
    authForm.classList.remove("show");
    authForm.classList.add("hide");
  }
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
        timer: 1000,
        showConfirmButton: false
      }).then(() => {
        updateAuthUI();
        window.location.href = "/index.html";
      });
    }
  });
}

// Función para verificar el estado de autenticación al cargar la página
function checkAuthStatus() {
  updateAuthUI();
}

// Escuchar cambios en el localStorage (para sincronizar entre pestañas)
window.addEventListener('storage', function(e) {
  if (e.key === 'token' || e.key === 'user') {
    checkAuthStatus();
  }
});