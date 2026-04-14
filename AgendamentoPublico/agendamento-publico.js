const STORAGE_KEY = "barbergo_agendamentos";
const SETTINGS_KEY = "barbergo_config";

const clientName = document.getElementById("clientName");
const clientPhone = document.getElementById("clientPhone");
const appointmentDate = document.getElementById("appointmentDate");
const serviceType = document.getElementById("serviceType");
const timesGrid = document.getElementById("timesGrid");
const selectedTimeText = document.getElementById("selectedTimeText");
const formMessage = document.getElementById("formMessage");
const publicAppointmentForm = document.getElementById("publicAppointmentForm");

const brandAvatar = document.getElementById("brandAvatar");
const shopNameDisplay = document.getElementById("shopNameDisplay");
const shopPhoneDisplay = document.getElementById("shopPhoneDisplay");
const shopWhatsappDisplay = document.getElementById("shopWhatsappDisplay");
const publicServicesList = document.getElementById("publicServicesList");

const timeSlots = [];
for (let hora = 7; hora <= 22; hora++) {
  timeSlots.push(`${String(hora).padStart(2, "0")}:00`);
}

let selectedTime = "";
let currentServices = [];

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

function getSettings() {
  const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
  const defaults = getDefaultSettings();

  return {
    ...defaults,
    ...(saved || {}),
    services: Array.isArray(saved?.services) ? saved.services : defaults.services
  };
}

function getAppointments() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveAppointments(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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

function getInitials(name) {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "BG";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatMoney(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatServiceMeta(service) {
  const parts = [];

  if (service.duration) {
    parts.push(`${service.duration} min`);
  }

  if (service.price || service.price === 0) {
    parts.push(formatMoney(service.price));
  }

  return parts.length ? parts.join(" • ") : "";
}

function formatDateToInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function setDateLimits() {
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 30);

  appointmentDate.min = formatDateToInput(today);
  appointmentDate.max = formatDateToInput(maxDate);
}

function applyBarbershopData() {
  const settings = getSettings();
  const name = settings.name || "Minha Barbearia";
  const phone = settings.phone || "Não informado";
  const whatsapp = settings.whatsapp || "Não informado";

  currentServices = Array.isArray(settings.services) ? settings.services : [];

  shopNameDisplay.textContent = name;
  shopPhoneDisplay.textContent = phone;
  shopWhatsappDisplay.textContent = whatsapp;

  if (settings.image) {
    brandAvatar.style.backgroundImage = `url(${settings.image})`;
    brandAvatar.textContent = "";
  } else {
    brandAvatar.style.backgroundImage = "none";
    brandAvatar.textContent = getInitials(name);
  }

  renderServices();
}

function renderServices() {
  publicServicesList.innerHTML = "";
  serviceType.innerHTML = `<option value="">Selecione um serviço</option>`;

  if (currentServices.length === 0) {
    publicServicesList.innerHTML = `
      <p class="empty-service-text">Nenhum serviço foi configurado por esta barbearia ainda.</p>
    `;
    serviceType.disabled = true;
    return;
  }

  serviceType.disabled = false;

  currentServices.forEach((service) => {
    const tag = document.createElement("span");
    const meta = formatServiceMeta(service);
    tag.textContent = meta ? `${service.name} • ${meta}` : service.name;
    publicServicesList.appendChild(tag);

    const option = document.createElement("option");
    option.value = service.id;
    option.textContent = meta ? `${service.name} • ${meta}` : service.name;
    serviceType.appendChild(option);
  });
}

function getTakenTimes(date) {
  const appointments = getAppointments();
  return appointments
    .filter((item) => item.date === date)
    .map((item) => item.time);
}

function updateSelectedTimeText() {
  selectedTimeText.textContent = selectedTime
    ? `Horário selecionado: ${selectedTime}`
    : "Nenhum horário selecionado.";
}

function renderTimes() {
  timesGrid.innerHTML = "";
  selectedTime = "";
  updateSelectedTimeText();

  const dateValue = appointmentDate.value;

  if (!dateValue) {
    timesGrid.innerHTML = `<p class="selected-time">Escolha uma data para ver os horários.</p>`;
    return;
  }

  const takenTimes = getTakenTimes(dateValue);

  timeSlots.forEach((time) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "time-btn";
    btn.textContent = time;

    if (takenTimes.includes(time)) {
      btn.classList.add("disabled");
      btn.disabled = true;
    } else {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".time-btn").forEach((item) => item.classList.remove("selected"));
        btn.classList.add("selected");
        selectedTime = time;
        updateSelectedTimeText();
      });
    }

    timesGrid.appendChild(btn);
  });
}

clientPhone.addEventListener("input", (e) => {
  e.target.value = maskPhone(e.target.value);
});

appointmentDate.addEventListener("focus", () => {
  if (typeof appointmentDate.showPicker === "function") {
    appointmentDate.showPicker();
  }
});

appointmentDate.addEventListener("click", () => {
  if (typeof appointmentDate.showPicker === "function") {
    appointmentDate.showPicker();
  }
});

appointmentDate.addEventListener("keydown", (e) => {
  if (e.key !== "Tab") {
    e.preventDefault();
  }
});

appointmentDate.addEventListener("change", renderTimes);

publicAppointmentForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = clientName.value.trim();
  const phone = clientPhone.value.trim();
  const date = appointmentDate.value;
  const serviceId = serviceType.value;

  formMessage.style.color = "#FF6B57";

  if (!name || !phone || !date || !serviceId || !selectedTime) {
    formMessage.textContent = "Preencha os campos e escolha um horário.";
    return;
  }

  const selectedService = currentServices.find((service) => service.id === serviceId);

  if (!selectedService) {
    formMessage.textContent = "Selecione um serviço válido.";
    return;
  }

  const appointments = getAppointments();
  const exists = appointments.some((item) => item.date === date && item.time === selectedTime);

  if (exists) {
    formMessage.textContent = "Esse horário já foi reservado. Escolha outro.";
    renderTimes();
    return;
  }

  appointments.push({
    id: createId(),
    date,
    name,
    phone,
    service: selectedService.name,
    serviceId: selectedService.id,
    time: selectedTime
  });

  saveAppointments(appointments);

  formMessage.style.color = "#27C17E";
  formMessage.textContent = "Agendamento realizado com sucesso.";

  publicAppointmentForm.reset();
  selectedTime = "";
  updateSelectedTimeText();
  renderTimes();
});

setDateLimits();
applyBarbershopData();
renderTimes();