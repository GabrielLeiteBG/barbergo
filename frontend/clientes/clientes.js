const STORAGE_KEY = "barbergo_agendamentos";
const SETTINGS_KEY = "barbergo_config";

const clientsTableBody = document.getElementById("clientsTableBody");
const totalClients = document.getElementById("totalClients");
const inactiveClients = document.getElementById("inactiveClients");
const activeClients = document.getElementById("activeClients");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");
const filterButtons = document.querySelectorAll(".filter-btn");

let currentFilter = "todos";

function parseStoredAppointments() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function loadSettings() {
  return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
}

function formatDateBR(dateStr) {
  if (!dateStr) {
    return "-";
  }

  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function daysSince(dateStr) {
  if (!dateStr) {
    return 0;
  }

  const today = new Date();
  const date = new Date(`${dateStr}T00:00:00`);
  const diff = today - date;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function onlyNumbers(value) {
  return String(value || "").replace(/\D/g, "");
}

function buildClientsList(appointments) {
  const grouped = {};

  appointments.forEach((item) => {
    const phoneKey = onlyNumbers(item.phone);
    const fallbackKey = normalizeText(item.name);
    const key = phoneKey || fallbackKey;

    if (!key) {
      return;
    }

    if (!grouped[key]) {
      grouped[key] = {
        name: item.name || "Cliente sem nome",
        phone: item.phone || "-",
        firstDate: item.date,
        lastDate: item.date
      };
      return;
    }

    if (item.date < grouped[key].firstDate) {
      grouped[key].firstDate = item.date;
    }

    if (item.date > grouped[key].lastDate) {
      grouped[key].lastDate = item.date;
      grouped[key].name = item.name || grouped[key].name;
      grouped[key].phone = item.phone || grouped[key].phone;
    }
  });

  return Object.values(grouped)
    .map((client) => {
      const days = daysSince(client.lastDate);
      const status = days >= 60 ? "reengajar" : "ativo";

      return {
        ...client,
        daysWithoutVisit: days,
        status
      };
    })
    .sort((a, b) => b.lastDate.localeCompare(a.lastDate));
}

function updateSummary(clients) {
  const total = clients.length;
  const inactive = clients.filter((client) => client.status === "reengajar").length;
  const active = clients.filter((client) => client.status === "ativo").length;

  totalClients.textContent = total;
  inactiveClients.textContent = inactive;
  activeClients.textContent = active;
}

function applyFilters(clients) {
  const term = normalizeText(searchInput.value.trim());

  return clients.filter((client) => {
    const matchesSearch =
      normalizeText(client.name).includes(term) ||
      normalizeText(client.phone).includes(term);

    const matchesFilter =
      currentFilter === "todos" ||
      (currentFilter === "ativos" && client.status === "ativo") ||
      (currentFilter === "reengajar" && client.status === "reengajar");

    return matchesSearch && matchesFilter;
  });
}

function buildWhatsappLink(client) {
  const settings = loadSettings();
  const shopName = settings.name || "nossa barbearia";
  const clientPhone = onlyNumbers(client.phone);

  if (clientPhone.length < 10) {
    return "#";
  }

  let message = "";

  if (client.status === "reengajar") {
    message =
      settings.message?.trim() ||
      `Olá, ${client.name}! Sentimos sua falta. Que tal agendar seu retorno na ${shopName}?`;
  } else {
    message = `Olá, ${client.name}! Aqui é da ${shopName}. Entrando em contato pelo BarberGo.`;
  }

  return `https://wa.me/55${clientPhone}?text=${encodeURIComponent(message)}`;
}

function renderTable(clients) {
  clientsTableBody.innerHTML = "";

  if (clients.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  clients.forEach((client) => {
    const whatsappLink = buildWhatsappLink(client);
    const hasValidPhone = whatsappLink !== "#";

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <div class="client-name">
          <strong>${client.name}</strong>
          <span>${client.daysWithoutVisit} dias sem novo agendamento</span>
        </div>
      </td>
      <td>${client.phone}</td>
      <td>${formatDateBR(client.lastDate)}</td>
      <td>
        <span class="status-badge ${client.status}">
          ${client.status === "ativo" ? "Ativo" : "Reengajar"}
        </span>
      </td>
      <td>
        ${
          hasValidPhone
            ? `
              <a class="action-btn" href="${whatsappLink}" target="_blank" rel="noopener noreferrer">
                <i class="fa-brands fa-whatsapp"></i>
                ${client.status === "reengajar" ? "Lembrar retorno" : "Contato"}
              </a>
            `
            : `
              <span class="action-btn" style="opacity: 0.6; cursor: not-allowed;">
                <i class="fa-brands fa-whatsapp"></i>
                Sem WhatsApp
              </span>
            `
        }
      </td>
    `;

    clientsTableBody.appendChild(row);
  });
}

function renderClients() {
  const appointments = parseStoredAppointments();
  const allClients = buildClientsList(appointments);
  const filteredClients = applyFilters(allClients);

  updateSummary(allClients);
  renderTable(filteredClients);
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    renderClients();
  });
});

searchInput.addEventListener("input", renderClients);

window.addEventListener("storage", renderClients);
window.addEventListener("focus", renderClients);

renderClients();