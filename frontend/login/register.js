const registerForm = document.getElementById("registerForm");
const errorMsg = document.getElementById("error");

const nomeInput = document.getElementById("nome");
const emailInput = document.getElementById("email");
const whatsappInput = document.getElementById("whatsapp");
const senhaInput = document.getElementById("senha");
const cartaoInput = document.getElementById("cartao");
const nomeCartaoInput = document.getElementById("nomeCartao");
const validadeInput = document.getElementById("validade");
const cvvInput = document.getElementById("cvv");
const togglePassword = document.getElementById("togglePassword");
const submitButton = registerForm.querySelector(".btn-register");

const CONFIG_KEY = "barbergo_config";
const USER_KEY = "barbergo_registered_user";

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function somenteNumeros(valor) {
  return String(valor || "").replace(/\D/g, "");
}

function formatarTelefone(valor) {
  let numero = somenteNumeros(valor).slice(0, 11);

  if (numero.length > 10) {
    return numero.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
  }

  if (numero.length > 6) {
    return numero.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
  }

  if (numero.length > 2) {
    return numero.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
  }

  return numero.replace(/^(\d*)/, "($1");
}

function formatarCartao(valor) {
  let numero = somenteNumeros(valor).slice(0, 16);
  return numero.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatarValidade(valor) {
  let numero = somenteNumeros(valor).slice(0, 4);

  if (numero.length >= 3) {
    return numero.replace(/^(\d{2})(\d{0,2})/, "$1/$2");
  }

  return numero;
}

function validarValidadeNaoVencida(validade) {
  if (!/^\d{2}\/\d{2}$/.test(validade)) {
    return false;
  }

  const [mes, ano] = validade.split("/");
  const mesNumero = Number(mes);
  const anoNumero = Number(`20${ano}`);

  if (mesNumero < 1 || mesNumero > 12) {
    return false;
  }

  const hoje = new Date();
  const ultimoDiaDoMes = new Date(anoNumero, mesNumero, 0, 23, 59, 59);

  return ultimoDiaDoMes >= hoje;
}

function mostrarMensagem(texto, cor) {
  errorMsg.style.color = cor;
  errorMsg.textContent = texto;
}

function salvarConfiguracoesIniciais({ nome, whatsapp }) {
  const currentConfig = JSON.parse(localStorage.getItem(CONFIG_KEY)) || {};

  const updatedConfig = {
    ...currentConfig,
    name: nome,
    whatsapp: currentConfig.whatsapp || formatarTelefone(whatsapp),
    phone: currentConfig.phone || formatarTelefone(whatsapp),
    message: currentConfig.message || "",
    image: currentConfig.image || "",
    services: Array.isArray(currentConfig.services) ? currentConfig.services : [
      { id: "service-1", name: "Corte", duration: 45, price: 30 },
      { id: "service-2", name: "Barba", duration: 30, price: 20 },
      { id: "service-3", name: "Corte + Barba", duration: 60, price: 45 },
      { id: "service-4", name: "Sobrancelha", duration: 20, price: 15 }
    ]
  };

  localStorage.setItem(CONFIG_KEY, JSON.stringify(updatedConfig));
}

function salvarUsuarioLocal({ nome, email, whatsapp, senha }) {
  localStorage.setItem(USER_KEY, JSON.stringify({
    shopName: nome,
    email,
    whatsapp: formatarTelefone(whatsapp),
    password: senha
  }));
}

whatsappInput.addEventListener("input", (e) => {
  e.target.value = formatarTelefone(e.target.value);
});

cartaoInput.addEventListener("input", (e) => {
  e.target.value = formatarCartao(e.target.value);
});

validadeInput.addEventListener("input", (e) => {
  e.target.value = formatarValidade(e.target.value);
});

cvvInput.addEventListener("input", (e) => {
  e.target.value = somenteNumeros(e.target.value).slice(0, 4);
});

togglePassword.addEventListener("click", () => {
  const isPassword = senhaInput.type === "password";

  senhaInput.type = isPassword ? "text" : "password";
  togglePassword.innerHTML = isPassword
    ? '<i class="fa-regular fa-eye-slash"></i>'
    : '<i class="fa-regular fa-eye"></i>';
});

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = nomeInput.value.trim();
  const email = emailInput.value.trim();
  const whatsapp = somenteNumeros(whatsappInput.value);
  const senha = senhaInput.value.trim();
  const cartao = somenteNumeros(cartaoInput.value);
  const nomeCartao = nomeCartaoInput.value.trim();
  const validade = validadeInput.value.trim();
  const cvv = cvvInput.value.trim();

  mostrarMensagem("", "#FF6B57");

  if (!nome || !email || !whatsapp || !senha || !cartao || !nomeCartao || !validade || !cvv) {
    mostrarMensagem("Preencha todos os campos.", "#FF6B57");
    return;
  }

  if (!validarEmail(email)) {
    mostrarMensagem("Digite um e-mail válido.", "#FF6B57");
    return;
  }

  if (whatsapp.length < 10 || whatsapp.length > 11) {
    mostrarMensagem("Digite um telefone válido.", "#FF6B57");
    return;
  }

  if (senha.length < 6) {
    mostrarMensagem("A senha deve ter pelo menos 6 caracteres.", "#FF6B57");
    return;
  }

  if (cartao.length !== 16) {
    mostrarMensagem("Digite um número de cartão válido.", "#FF6B57");
    return;
  }

  if (!validarValidadeNaoVencida(validade)) {
    mostrarMensagem("Digite uma validade válida e não vencida.", "#FF6B57");
    return;
  }

  if (!/^\d{3,4}$/.test(cvv)) {
    mostrarMensagem("Digite um CVV válido.", "#FF6B57");
    return;
  }

  salvarConfiguracoesIniciais({ nome, whatsapp });
  salvarUsuarioLocal({ nome, email, whatsapp, senha });

  submitButton.disabled = true;
  submitButton.style.opacity = "0.8";
  submitButton.style.cursor = "not-allowed";

  mostrarMensagem("Conta criada com sucesso.", "#27C17E");

  setTimeout(() => {
    window.location.href = "login.html";
  }, 900);
});