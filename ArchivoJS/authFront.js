const form = document.getElementById("signupForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("✅ Evento de envío capturado");
  const name = document.querySelector("#name_user").value;
  const phone_number = document.querySelector("#phone_user").value;
  const email = document.querySelector("#email_user").value;
  const password = document.querySelector("#password_user").value;

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


document.addEventListener("DOMContentLoaded", () => {
  const loginLink = document.getElementById("login-link");
  const loginFormDiv = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  loginLink.addEventListener("click", () => {
    signupForm.style.display = "none";
    loginFormDiv.style.display = "block";
  });
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

  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: "Bienvenido",
        text: `Hola ${data.user.name}`,
        timer: 2000,
      }).then(() => {
        location.reload();
      });

      // Guardar token si vas a usar autenticación
      localStorage.setItem("token", data.token);

      setTimeout(() => {
        window.location.href = "/index.html";
      }, 2000);
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: data.error,
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Oops",
      text: "No se pudo conectar al servidor",
    });
  }
});
