const monthTitle = document.getElementById("monthTitle");
const calendarGrid = document.getElementById("calendarGrid");
const selectedDateLabel = document.getElementById("selectedDateLabel");
const infoSelectedDate = document.getElementById("infoSelectedDate");
const dayTitle = document.getElementById("dayTitle");
const timeline = document.getElementById("timeline");

const appointmentsCount = document.getElementById("appointmentsCount");
const occupiedCount = document.getElementById("occupiedCount");
const firstAppointment = document.getElementById("firstAppointment");
const lastAppointment = document.getElementById("lastAppointment");

const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");

const modalBackdrop = document.getElementById("modalBackdrop");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

const appointmentForm = document.getElementById("appointmentForm");
const clientName = document.getElementById("clientName");
const clientPhone = document.getElementById("clientPhone");
const serviceType = document.getElementById("serviceType");
const appointmentTime = document.getElementById("appointmentTime");
const formMessage = document.getElementById("formMessage");

const STORAGE_KEY = "barbergo_agendamentos";

const monthNames = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
];

const weekNames = [
  "domingo", "segunda-feira", "terça-feira", "quarta-feira",
  "quinta-feira", "sexta-feira", "sábado"
];

const timeSlots = [
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
  "19:00", "20:00", "21:00", "22:00"
];

let currentViewDate = new Date();
let selectedDate = new Date();
let appointments = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date) {
  const weekDay = weekNames[date.getDay()];
  const day = String(date.getDate()).padStart(2, "0");
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${weekDay}, ${day} de ${month} de ${year}`;
}

function saveAppointments() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}

function getAppointmentsByDate(date) {
  const key = formatDateKey(date);
  return appointments
    .filter(item => item.date === key)
    .sort((a, b) => a.time.localeCompare(b.time));
}

function renderHeaderDates() {
  const formatted = formatDisplayDate(selectedDate);
  selectedDateLabel.textContent = formatted;
  infoSelectedDate.textContent = formatted;
  dayTitle.textContent = `Atendimentos - ${String(selectedDate.getDate()).padStart(2, "0")}/${String(selectedDate.getMonth() + 1).padStart(2, "0")}`;
}

function renderCalendar() {
  calendarGrid.innerHTML = "";

  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();

  monthTitle.textContent = `${monthNames[month]} de ${year}`;

  const firstDay = new Date(year, month, 1);
  const startWeekDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  for (let i = startWeekDay - 1; i >= 0; i--) {
    const btn = document.createElement("button");
    btn.className = "day-btn muted";
    btn.textContent = daysInPrevMonth - i;
    calendarGrid.appendChild(btn);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const btn = document.createElement("button");
    btn.className = "day-btn";
    btn.textContent = day;

    const date = new Date(year, month, day);
    const today = new Date();

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const isSelected =
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();

    if (isToday) {
      btn.classList.add("today");
    }

    if (isSelected) {
      btn.classList.add("selected");
    }

    btn.addEventListener("click", () => {
      selectedDate = new Date(year, month, day);
      renderAll();
    });

    calendarGrid.appendChild(btn);
  }

  const totalCells = startWeekDay + daysInMonth;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

  for (let i = 1; i <= remaining; i++) {
    const btn = document.createElement("button");
    btn.className = "day-btn muted";
    btn.textContent = i;
    calendarGrid.appendChild(btn);
  }
}

function renderSummary() {
  const dayAppointments = getAppointmentsByDate(selectedDate);

  appointmentsCount.textContent = dayAppointments.length;
  occupiedCount.textContent = dayAppointments.length;

  firstAppointment.textContent = dayAppointments.length ? dayAppointments[0].time : "Nenhum";
  lastAppointment.textContent = dayAppointments.length ? dayAppointments[dayAppointments.length - 1].time : "Nenhum";
}

function renderTimeline() {
  const dayAppointments = getAppointmentsByDate(selectedDate);
  timeline.innerHTML = "";

  if (dayAppointments.length === 0) {
    timeline.innerHTML = `
      <div class="empty-day">
        Nenhum agendamento cadastrado para esta data.
      </div>
    `;
    return;
  }

  dayAppointments.forEach((appointment) => {
    const slot = document.createElement("div");
    slot.className = "time-slot";

    slot.innerHTML = `
      <div class="slot-time">${appointment.time}</div>
      <div class="appointment-content">
        <strong>${appointment.name}</strong>
        <span>${appointment.service} • ${appointment.phone}</span>
      </div>
      <div style="display:flex; gap:10px; align-items:center;">
        <span class="slot-tag">Confirmado</span>
        <button class="delete-btn" data-id="${appointment.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;

    timeline.appendChild(slot);
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      appointments = appointments.filter(item => item.id !== id);
      saveAppointments();
      renderAll();
    });
  });
}

function renderTimeOptions() {
  appointmentTime.innerHTML = `<option value="">Selecione</option>`;

  timeSlots.forEach((time) => {
    const option = document.createElement("option");
    option.value = time;
    option.textContent = time;
    appointmentTime.appendChild(option);
  });
}

function openModal() {
  modalBackdrop.classList.remove("hidden");
}

function closeModal() {
  modalBackdrop.classList.add("hidden");
  appointmentForm.reset();
  formMessage.textContent = "";
}

function onlyNumbers(value) {
  return value.replace(/\D/g, "");
}

clientPhone.addEventListener("input", (e) => {
  let value = onlyNumbers(e.target.value).slice(0, 11);

  if (value.length > 10) {
    value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
  } else if (value.length > 6) {
    value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
  } else if (value.length > 2) {
    value = value.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
  } else {
    value = value.replace(/^(\d*)/, "($1");
  }

  e.target.value = value;
});

appointmentForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = clientName.value.trim();
  const phone = clientPhone.value.trim();
  const service = serviceType.value;
  const time = appointmentTime.value;
  const dateKey = formatDateKey(selectedDate);

  formMessage.style.color = "#FF6B57";

  if (!name || !phone || !service || !time) {
    formMessage.textContent = "Preencha todos os campos.";
    return;
  }

  const exists = appointments.some(item => item.date === dateKey && item.time === time);

  if (exists) {
    formMessage.textContent = "Esse horário já está ocupado.";
    return;
  }

  appointments.push({
    id: crypto.randomUUID(),
    date: dateKey,
    name,
    phone,
    service,
    time
  });

  saveAppointments();
  renderAll();

  formMessage.style.color = "#27C17E";
  formMessage.textContent = "Agendamento salvo com sucesso.";

  setTimeout(() => {
    closeModal();
  }, 800);
});

prevMonthBtn.addEventListener("click", () => {
  currentViewDate = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() - 1, 1);
  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  currentViewDate = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1, 1);
  renderCalendar();
});

openModalBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);

modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) {
    closeModal();
  }
});

function renderAll() {
  currentViewDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  renderHeaderDates();
  renderCalendar();
  renderSummary();
  renderTimeline();
}

renderTimeOptions();
renderAll();