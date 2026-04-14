const SETTINGS_KEY = "barbergo_config";

const settingsForm = document.getElementById("settingsForm");
const shopName = document.getElementById("shopName");
const shopPhone = document.getElementById("shopPhone");
const shopWhatsapp = document.getElementById("shopWhatsapp");
const shopMessage = document.getElementById("shopMessage");
const shopImage = document.getElementById("shopImage");
const removeImageBtn = document.getElementById("removeImageBtn");
const formMessage = document.getElementById("formMessage");

const previewAvatar = document.getElementById("previewAvatar");
const previewName = document.getElementById("previewName");
const previewPhone = document.getElementById("previewPhone");
const previewWhatsapp = document.getElementById("previewWhatsapp");
const previewGreeting = document.getElementById("previewGreeting");
const previewMessage = document.getElementById("previewMessage");
const previewServicesList = document.getElementById("previewServicesList");

const serviceForm = document.getElementById("serviceForm");
const serviceName = document.getElementById("serviceName");
const serviceDuration = document.getElementById("serviceDuration");
const servicePrice = document.getElementById("servicePrice");
const serviceSubmitBtn = document.getElementById("serviceSubmitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const serviceMessage = document.getElementById("serviceMessage");
const servicesList = document.getElementById("servicesList");

let currentImageData = "";
let currentServices = [];
let editingServiceId = null;

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getDefaultSettings() {
  return {
    name: "Minha Barbearia",
    phone: "",
    whatsapp: "",
    message: "",
    image: "",
    services: [
      { id: createId(), name: "Corte", duration: 45, price: 30 },
      { id: createId(), name: "Barba", duration: 30, price: 20 },
      { id: createId(), name: "Corte + Barba", duration: 60, price: 45 },
      { id: createId(), name: "Sobrancelha", duration: 20, price: 15 }
    ]
  };
}

function loadSettings() {
  const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
  const defaults = getDefaultSettings();

  return {
    ...defaults,
    ...(saved || {}),
    services: Array.isArray(saved?.services) ? saved.services : defaults.services
  };
}

function saveSettings(data) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
}

function getInitials(name) {
  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length === 0) return "BG";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function onlyNumbers(value) {
  return value.replace(/\D/g, "");
}

function maskPhone(value) {
  let number = onlyNumbers(value).slice(0, 11);

  if (number.length > 10) {
    return number.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
  }

  if (number.length > 6) {
    return number.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
  }

  if (number.length > 2) {
    return number.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
  }

  return number.replace(/^(\d*)/, "($1");
}

function applyMaskInput(input) {
  input.addEventListener("input", (e) => {
    e.target.value = maskPhone(e.target.value);
    updatePreview();
  });
}

function formatMoney(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function buildSettingsObject() {
  return {
    name: shopName.value.trim() || "Minha Barbearia",
    phone: shopPhone.value.trim(),
    whatsapp: shopWhatsapp.value.trim(),
    message: shopMessage.value.trim(),
    image: currentImageData,
    services: currentServices
  };
}

function persistCurrentSettings() {
  saveSettings(buildSettingsObject());
}

function getServiceMeta(service) {
  const parts = [];

  if (service.duration) {
    parts.push(`${service.duration} min`);
  }

  if (service.price || service.price === 0) {
    parts.push(formatMoney(service.price));
  }

  return parts.length ? parts.join(" • ") : "Sem duração e preço definidos";
}

function updatePreview() {
  const nameValue = shopName.value.trim() || "Minha Barbearia";
  const phoneValue = shopPhone.value.trim() || "Telefone não definido";
  const whatsappValue = shopWhatsapp.value.trim() || "WhatsApp não definido";
  const messageValue = shopMessage.value.trim() || "Nenhuma mensagem configurada.";

  previewName.textContent = nameValue;
  previewPhone.textContent = phoneValue;
  previewWhatsapp.textContent = whatsappValue;
  previewGreeting.textContent = nameValue;
  previewMessage.textContent = messageValue;

  if (currentImageData) {
    previewAvatar.style.backgroundImage = `url(${currentImageData})`;
    previewAvatar.style.backgroundColor = "transparent";
    previewAvatar.textContent = "";
  } else {
    previewAvatar.style.backgroundImage = "none";
    previewAvatar.style.background = "linear-gradient(135deg, #FF4C00, #ff7a3c)";
    previewAvatar.textContent = getInitials(nameValue);
  }

  previewServicesList.innerHTML = "";

  if (currentServices.length === 0) {
    previewServicesList.innerHTML = `<span class="service-meta">Nenhum serviço cadastrado.</span>`;
    return;
  }

  currentServices.forEach((service) => {
    const tag = document.createElement("span");
    tag.className = "preview-service-tag";
    tag.textContent = service.name;
    previewServicesList.appendChild(tag);
  });
}

function fillForm(data) {
  shopName.value = data.name || "";
  shopPhone.value = data.phone || "";
  shopWhatsapp.value = data.whatsapp || "";
  shopMessage.value = data.message || "";
  currentImageData = data.image || "";
  currentServices = Array.isArray(data.services) ? data.services : [];
  updatePreview();
  renderServices();
}

function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const maxSize = 400;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };

      img.onerror = reject;
      img.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function resetServiceForm() {
  serviceForm.reset();
  editingServiceId = null;
  serviceSubmitBtn.textContent = "Adicionar serviço";
  cancelEditBtn.classList.add("hidden");
}

function renderServices() {
  servicesList.innerHTML = "";

  if (currentServices.length === 0) {
    servicesList.innerHTML = `
      <div class="empty-services">
        Nenhum serviço cadastrado ainda.
      </div>
    `;
    return;
  }

  currentServices.forEach((service) => {
    const item = document.createElement("div");
    item.className = "service-item";

    item.innerHTML = `
      <div class="service-item-left">
        <strong>${service.name}</strong>
        <span class="service-meta">${getServiceMeta(service)}</span>
      </div>

      <div class="service-actions">
        <button type="button" class="mini-btn edit" data-action="edit" data-id="${service.id}">
          <i class="fa-solid fa-pen"></i>
        </button>

        <button type="button" class="mini-btn delete" data-action="delete" data-id="${service.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;

    servicesList.appendChild(item);
  });

  servicesList.querySelectorAll(".mini-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      const id = button.dataset.id;

      if (action === "edit") {
        startEditService(id);
      }

      if (action === "delete") {
        deleteService(id);
      }
    });
  });
}

function startEditService(id) {
  const service = currentServices.find((item) => item.id === id);

  if (!service) {
    return;
  }

  editingServiceId = id;
  serviceName.value = service.name || "";
  serviceDuration.value = service.duration ?? "";
  servicePrice.value = service.price ?? "";
  serviceSubmitBtn.textContent = "Salvar edição";
  cancelEditBtn.classList.remove("hidden");
  serviceMessage.style.color = "#FFB020";
  serviceMessage.textContent = "Editando serviço.";
}

function deleteService(id) {
  currentServices = currentServices.filter((service) => service.id !== id);
  persistCurrentSettings();
  renderServices();
  updatePreview();
  resetServiceForm();
  serviceMessage.style.color = "#27C17E";
  serviceMessage.textContent = "Serviço removido com sucesso.";
}

shopImage.addEventListener("change", async (e) => {
  const file = e.target.files[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    formMessage.style.color = "#FF6B57";
    formMessage.textContent = "Selecione um arquivo de imagem válido.";
    return;
  }

  try {
    currentImageData = await resizeImage(file);
    formMessage.textContent = "";
    updatePreview();
  } catch {
    formMessage.style.color = "#FF6B57";
    formMessage.textContent = "Não foi possível carregar a imagem.";
  }
});

removeImageBtn.addEventListener("click", () => {
  currentImageData = "";
  shopImage.value = "";
  updatePreview();
  formMessage.style.color = "#27C17E";
  formMessage.textContent = "Foto removida com sucesso.";
});

[shopName, shopMessage].forEach((input) => {
  input.addEventListener("input", updatePreview);
});

applyMaskInput(shopPhone);
applyMaskInput(shopWhatsapp);

settingsForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = shopName.value.trim();

  formMessage.style.color = "#FF6B57";

  if (!name) {
    formMessage.textContent = "Informe o nome da barbearia.";
    return;
  }

  persistCurrentSettings();
  updatePreview();

  formMessage.style.color = "#27C17E";
  formMessage.textContent = "Configurações salvas com sucesso.";
});

serviceForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = serviceName.value.trim();
  const durationValue = serviceDuration.value.trim();
  const priceValue = servicePrice.value.trim();

  serviceMessage.style.color = "#FF6B57";

  if (!name) {
    serviceMessage.textContent = "Informe o nome do serviço.";
    return;
  }

  const duration = durationValue ? Number(durationValue) : null;
  const price = priceValue ? Number(priceValue) : null;

  if (duration !== null && (Number.isNaN(duration) || duration < 0)) {
    serviceMessage.textContent = "Informe uma duração válida.";
    return;
  }

  if (price !== null && (Number.isNaN(price) || price < 0)) {
    serviceMessage.textContent = "Informe um preço válido.";
    return;
  }

  if (editingServiceId) {
    currentServices = currentServices.map((service) =>
      service.id === editingServiceId
        ? {
            ...service,
            name,
            duration,
            price
          }
        : service
    );

    serviceMessage.style.color = "#27C17E";
    serviceMessage.textContent = "Serviço atualizado com sucesso.";
  } else {
    currentServices.push({
      id: createId(),
      name,
      duration,
      price
    });

    serviceMessage.style.color = "#27C17E";
    serviceMessage.textContent = "Serviço adicionado com sucesso.";
  }

  persistCurrentSettings();
  renderServices();
  updatePreview();
  resetServiceForm();
});

cancelEditBtn.addEventListener("click", () => {
  resetServiceForm();
  serviceMessage.textContent = "";
});

fillForm(loadSettings());