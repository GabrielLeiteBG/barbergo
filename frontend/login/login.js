const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const rememberMe = document.getElementById("rememberMe");
const errorMessage = document.getElementById("errorMessage");
const togglePassword = document.getElementById("togglePassword");

const REMEMBER_EMAIL_KEY = "barbergo_remember_email";

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function loadRememberedEmail() {
  const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);

  if (savedEmail) {
    emailInput.value = savedEmail;
    rememberMe.checked = true;
  }
}

togglePassword.addEventListener("click", () => {
  const isPassword = senhaInput.type === "password";

  senhaInput.type = isPassword ? "text" : "password";
  togglePassword.innerHTML = isPassword
    ? '<i class="fa-regular fa-eye-slash"></i>'
    : '<i class="fa-regular fa-eye"></i>';
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const senha = senhaInput.value.trim();

  errorMessage.style.color = "#FF6B57";

  if (!email || !senha) {
    errorMessage.textContent = "Preencha e-mail e senha.";
    return;
  }

  if (!validarEmail(email)) {
    errorMessage.textContent = "Digite um e-mail válido.";
    return;
  }

  if (senha.length < 6) {
    errorMessage.textContent = "A senha deve ter pelo menos 6 caracteres.";
    return;
  }

  if (rememberMe.checked) {
    localStorage.setItem(REMEMBER_EMAIL_KEY, email);
  } else {
    localStorage.removeItem(REMEMBER_EMAIL_KEY);
  }

  errorMessage.style.color = "#27C17E";
  errorMessage.textContent = "Login realizado com sucesso.";

  setTimeout(() => {
    window.location.href = "../dashboard/dashboard.html";
  }, 700);
});

loadRememberedEmail();