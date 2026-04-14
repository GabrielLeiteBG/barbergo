const APPOINTMENTS_KEY = "barbergo_agendamentos";
const FINANCE_KEY = "barbergo_financeiro";
const STOCK_KEY = "barbergo_estoque";
const SETTINGS_KEY = "barbergo_config";

const currentDate = document.getElementById("currentDate");
const lineChart = document.getElementById("lineChart");
const dailyBars = document.getElementById("dailyBars");
const weeklyChart = document.getElementById("weeklyChart");
const stockList = document.getElementById("stockList");
const scheduleList = document.getElementById("scheduleList");

const appointmentsCount = document.getElementById("appointmentsCount");
const dailyRevenue = document.getElementById("dailyRevenue");
const newClientsCount = document.getElementById("newClientsCount");
const weeklyClients = document.getElementById("weeklyClients");
const retentionRate = document.getElementById("retentionRate");

const greetingName = document.getElementById("greetingName");
const profileName = document.getElementById("profileName");
const profileAvatar = document.getElementById("profileAvatar");
const sidebarWhatsappBtn = document.getElementById("sidebarWhatsappBtn");

const hoje = new Date();

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

function loadAppointments() {
  return JSON.parse(localStorage.getItem(APPOINTMENTS_KEY)) || [];
}

function loadFinance() {
  return JSON.parse(localStorage.getItem(FINANCE_KEY)) || [];
}

function loadStock() {
  return JSON.parse(localStorage.getItem(STOCK_KEY)) || [];
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMoney(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatShortMoney(value) {
  const amount = Number(value);

  if (amount >= 1000) {
    const compact = (amount / 1000).toFixed(amount >= 10000 ? 0 : 1).replace(".", ",");
    return `R$ ${compact}k`;
  }

  return `R$ ${Math.round(amount)}`;
}

function onlyNumbers(value) {
  return String(value || "").replace(/\D/g, "");
}

function getInitials(name) {
  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length === 0) return "BG";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getClientKey(appointment) {
  const phone = onlyNumbers(appointment.phone || "");
  return phone || appointment.name.trim().toLowerCase();
}

function renderEmptyState(container, message, minHeight = "110px") {
  container.innerHTML = `
    <div class="empty-state" style="min-height: ${minHeight};">
      ${message}
    </div>
  `;
}

function getLastDays(total) {
  const days = [];

  for (let i = total - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date);
  }

  return days;
}

function getWeekdayLabel(date) {
  return date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
}

function loadBarbershopSettings() {
  const settings = loadSettings();
  const name = settings.name || "Minha Barbearia";
  const whatsapp = settings.whatsapp || "";
  const message = settings.message || `Olá! Sentimos sua falta. Que tal agendar seu retorno na ${name}?`;

  if (greetingName) greetingName.textContent = name;
  if (profileName) profileName.textContent = name;

  if (profileAvatar) {
    if (settings.image) {
      profileAvatar.style.backgroundImage = `url(${settings.image})`;
      profileAvatar.textContent = "";
    } else {
      profileAvatar.style.backgroundImage = "none";
      profileAvatar.textContent = getInitials(name);
    }
  }

  const whatsappNumber = onlyNumbers(whatsapp);

  if (sidebarWhatsappBtn) {
    if (whatsappNumber) {
      sidebarWhatsappBtn.href = `https://wa.me/55${whatsappNumber}?text=${encodeURIComponent(message)}`;
      sidebarWhatsappBtn.target = "_blank";
    } else {
      sidebarWhatsappBtn.href = "#";
      sidebarWhatsappBtn.removeAttribute("target");
    }
  }
}

function renderAppointmentsCard(appointments) {
  const todayKey = formatDateKey(hoje);
  const todayAppointments = appointments
    .filter((item) => item.date === todayKey)
    .sort((a, b) => a.time.localeCompare(b.time));

  appointmentsCount.textContent = todayAppointments.length;

  lineChart.innerHTML = "";

  const last7Days = getLastDays(7);
  const counts = last7Days.map((date) => {
    const key = formatDateKey(date);
    return appointments.filter((item) => item.date === key).length;
  });

  const maxCount = Math.max(...counts, 1);

  if (counts.every((value) => value === 0)) {
    renderEmptyState(lineChart, "Sem agendamentos registrados nos últimos dias.", "128px");
  } else {
    counts.forEach((value) => {
      const point = document.createElement("div");
      point.className = "line-point";
      point.style.height = `${Math.max((value / maxCount) * 100, value > 0 ? 18 : 10)}%`;
      lineChart.appendChild(point);
    });
  }

  const cardFooters = document.querySelectorAll(".card-footer");

  if (cardFooters[0]) {
    if (todayAppointments.length === 0) {
      cardFooters[0].innerHTML = `<span class="neutral">Nenhum agendamento marcado para hoje.</span>`;
    } else {
      const nextAppointment = todayAppointments[0];
      cardFooters[0].innerHTML = `<span class="positive">Próximo horário: ${nextAppointment.time}</span>`;
    }
  }

  scheduleList.innerHTML = "";

  if (todayAppointments.length === 0) {
    renderEmptyState(scheduleList, "Nenhum agendamento para hoje.", "180px");
  } else {
    todayAppointments.forEach((item) => {
      const scheduleItem = document.createElement("div");
      scheduleItem.className = "schedule-item";

      scheduleItem.innerHTML = `
        <div class="schedule-time">${item.time}</div>
        <div class="schedule-info">
          <strong>${item.name}</strong>
          <span>${item.service}</span>
        </div>
      `;

      scheduleList.appendChild(scheduleItem);
    });
  }
}

function renderFinanceCard(finance) {
  const todayKey = formatDateKey(hoje);
  const todayRevenueValue = finance
    .filter((item) => item.type === "entrada" && item.createdAtISO?.startsWith(todayKey))
    .reduce((acc, item) => acc + Number(item.amount || 0), 0);

  dailyRevenue.textContent = formatMoney(todayRevenueValue);

  dailyBars.innerHTML = "";

  const last7Days = getLastDays(7);
  const revenues = last7Days.map((date) => {
    const key = formatDateKey(date);
    return finance
      .filter((item) => item.type === "entrada" && item.createdAtISO?.startsWith(key))
      .reduce((acc, item) => acc + Number(item.amount || 0), 0);
  });

  const maxRevenue = Math.max(...revenues, 1);

  if (revenues.every((value) => value === 0)) {
    renderEmptyState(dailyBars, "Nenhuma entrada registrada nos últimos dias.", "110px");
  } else {
    revenues.forEach((value) => {
      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.height = `${Math.max((value / maxRevenue) * 100, value > 0 ? 18 : 10)}%`;
      dailyBars.appendChild(bar);
    });
  }

  const cardFooters = document.querySelectorAll(".card-footer");

  if (cardFooters[1]) {
    if (todayRevenueValue === 0) {
      cardFooters[1].innerHTML = `<span class="neutral">Nenhuma movimentação financeira hoje.</span>`;
    } else {
      cardFooters[1].innerHTML = `<span class="positive">Entradas registradas hoje.</span>`;
    }
  }
}

function renderClientsCard(appointments) {
  const grouped = {};

  appointments.forEach((appointment) => {
    const key = getClientKey(appointment);

    if (!grouped[key]) {
      grouped[key] = {
        firstDate: appointment.date,
        lastDate: appointment.date
      };
      return;
    }

    if (appointment.date < grouped[key].firstDate) {
      grouped[key].firstDate = appointment.date;
    }

    if (appointment.date > grouped[key].lastDate) {
      grouped[key].lastDate = appointment.date;
    }
  });

  const clients = Object.values(grouped);
  const todayKey = formatDateKey(hoje);

  const newToday = clients.filter((client) => client.firstDate === todayKey).length;
  newClientsCount.textContent = newToday;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDaysAgoKey = formatDateKey(sevenDaysAgo);

  const weeklyNewClients = clients.filter((client) => client.firstDate >= sevenDaysAgoKey).length;
  weeklyClients.textContent = weeklyNewClients;

  const activeClients = clients.filter((client) => {
    const diff = (hoje - new Date(`${client.lastDate}T00:00:00`)) / (1000 * 60 * 60 * 24);
    return diff <= 60;
  }).length;

  const retention = clients.length ? Math.round((activeClients / clients.length) * 100) : 0;
  retentionRate.textContent = `${retention}%`;

  const cardFooters = document.querySelectorAll(".card-footer");

  if (cardFooters[2]) {
    if (newToday === 0) {
      cardFooters[2].innerHTML = `<span class="neutral">Nenhum novo cliente cadastrado hoje.</span>`;
    } else {
      cardFooters[2].innerHTML = `<span class="positive">${newToday} novo(s) cliente(s) hoje.</span>`;
    }
  }
}

function renderWeeklyChart(finance) {
  weeklyChart.innerHTML = "";

  const last7Days = getLastDays(7);
  const revenues = last7Days.map((date) => {
    const key = formatDateKey(date);
    return finance
      .filter((item) => item.type === "entrada" && item.createdAtISO?.startsWith(key))
      .reduce((acc, item) => acc + Number(item.amount || 0), 0);
  });

  const maxRevenue = Math.max(...revenues, 1);

  if (revenues.every((value) => value === 0)) {
    renderEmptyState(weeklyChart, "Sem dados suficientes para exibir o gráfico semanal.", "248px");
    return;
  }

  last7Days.forEach((date, index) => {
    const value = revenues[index];

    const column = document.createElement("div");
    column.className = "week-column";

    const valueLabel = document.createElement("span");
    valueLabel.className = "week-value";
    valueLabel.textContent = value > 0 ? formatShortMoney(value) : "R$ 0";

    const bars = document.createElement("div");
    bars.className = "week-bars";

    const orange = document.createElement("div");
    orange.className = "week-bar orange";
    orange.style.height = `${Math.max((value / maxRevenue) * 190, value > 0 ? 18 : 10)}px`;

    const day = document.createElement("span");
    day.className = "week-day";
    day.textContent = getWeekdayLabel(date);

    bars.appendChild(orange);
    column.appendChild(valueLabel);
    column.appendChild(bars);
    column.appendChild(day);
    weeklyChart.appendChild(column);
  });
}

function renderStockAlert(stock) {
  stockList.innerHTML = "";

  const alertProducts = stock
    .filter((item) => Number(item.quantity) <= Number(item.min))
    .slice(0, 3);

  if (alertProducts.length === 0) {
    renderEmptyState(stockList, "Nenhum produto com alerta de estoque no momento.", "180px");
    return;
  }

  alertProducts.forEach((item) => {
    const percent = item.min > 0 ? Math.max((item.quantity / item.min) * 100, 8) : 100;

    const stockItem = document.createElement("div");
    stockItem.className = "stock-item";

    stockItem.innerHTML = `
      <div class="stock-top">
        <strong>${item.name}</strong>
        <span>${item.quantity} unid.</span>
      </div>
      <div class="stock-bar">
        <div class="stock-fill" style="width: ${Math.min(percent, 100)}%"></div>
      </div>
    `;

    stockList.appendChild(stockItem);
  });
}

function renderDashboard() {
  currentDate.textContent = hoje.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  const appointments = loadAppointments();
  const finance = loadFinance();
  const stock = loadStock();

  loadBarbershopSettings();
  renderAppointmentsCard(appointments);
  renderFinanceCard(finance);
  renderClientsCard(appointments);
  renderWeeklyChart(finance);
  renderStockAlert(stock);
}

window.addEventListener("storage", renderDashboard);

renderDashboard();