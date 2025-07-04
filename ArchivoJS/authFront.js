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