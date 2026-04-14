const FINANCE_KEY = "barbergo_financeiro";
const STOCK_KEY = "barbergo_estoque";

const manualForm = document.getElementById("manualForm");
const transactionType = document.getElementById("transactionType");
const transactionCategory = document.getElementById("transactionCategory");
const transactionDescription = document.getElementById("transactionDescription");
const transactionAmount = document.getElementById("transactionAmount");
const manualMessage = document.getElementById("manualMessage");

const stockPurchaseForm = document.getElementById("stockPurchaseForm");
const stockProduct = document.getElementById("stockProduct");
const purchaseQuantity = document.getElementById("purchaseQuantity");
const unitCost = document.getElementById("unitCost");
const purchaseTotal = document.getElementById("purchaseTotal");
const stockMessage = document.getElementById("stockMessage");

const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const balanceValue = document.getElementById("balanceValue");
const stockExpense = document.getElementById("stockExpense");

const searchInput = document.getElementById("searchInput");
const financeTableBody = document.getElementById("financeTableBody");
const emptyState = document.getElementById("emptyState");
const filterButtons = document.querySelectorAll(".filter-btn");

let currentFilter = "todos";

function formatMoney(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function getTodayBR() {
  return new Date().toLocaleDateString("pt-BR");
}

function getTodayISO() {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function loadFinance() {
  return JSON.parse(localStorage.getItem(FINANCE_KEY)) || [];
}

function loadStock() {
  const data = JSON.parse(localStorage.getItem(STOCK_KEY)) || [];

  if (data.length === 0) {
    return [
      {
        id: "demo-stock-1",
        name: "Pomada Modeladora BarberGo",
        category: "Finalização",
        quantity: 3,
        min: 5,
        updatedAt: getTodayBR()
      }
    ];
  }

  return data;
}

let financeData = loadFinance();
let stockData = loadStock();

function saveFinance() {
  localStorage.setItem(FINANCE_KEY, JSON.stringify(financeData));
}

function saveStock() {
  localStorage.setItem(STOCK_KEY, JSON.stringify(stockData));
}

function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function populateStockSelect() {
  stockProduct.innerHTML = `<option value="">Selecione um produto</option>`;

  stockData.forEach((product) => {
    const option = document.createElement("option");
    option.value = product.id;
    option.textContent = `${product.name} (${product.quantity} unid.)`;
    stockProduct.appendChild(option);
  });
}

function updatePurchaseTotal() {
  const qty = Number(purchaseQuantity.value) || 0;
  const cost = Number(unitCost.value) || 0;
  const total = qty * cost;
  purchaseTotal.textContent = formatMoney(total);
}

function updateSummary() {
  const income = financeData
    .filter((item) => item.type === "entrada")
    .reduce((acc, item) => acc + item.amount, 0);

  const expense = financeData
    .filter((item) => item.type === "saida")
    .reduce((acc, item) => acc + item.amount, 0);

  const stockCost = financeData
    .filter((item) => item.categoryKey === "compra_estoque")
    .reduce((acc, item) => acc + item.amount, 0);

  totalIncome.textContent = formatMoney(income);
  totalExpense.textContent = formatMoney(expense);
  balanceValue.textContent = formatMoney(income - expense);
  stockExpense.textContent = formatMoney(stockCost);
}

function applyFilters(data) {
  const term = normalizeText(searchInput.value.trim());

  return data.filter((item) => {
    const matchesSearch =
      normalizeText(item.category).includes(term) ||
      normalizeText(item.description).includes(term);

    const matchesFilter =
      currentFilter === "todos" ||
      (currentFilter === "entrada" && item.type === "entrada") ||
      (currentFilter === "saida" && item.type === "saida") ||
      (currentFilter === "estoque" && item.categoryKey === "compra_estoque");

    return matchesSearch && matchesFilter;
  });
}

function renderTable(data) {
  financeTableBody.innerHTML = "";

  if (data.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  data
    .slice()
    .sort((a, b) => new Date(b.createdAtISO) - new Date(a.createdAtISO))
    .forEach((item) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${item.date}</td>
        <td>
          <span class="type-badge ${item.type}">
            ${item.type === "entrada" ? "Entrada" : "Saída"}
          </span>
        </td>
        <td>${item.category}</td>
        <td>${item.description}</td>
        <td class="${item.type === "entrada" ? "value-positive" : "value-negative"}">
          ${item.type === "entrada" ? "+" : "-"} ${formatMoney(item.amount)}
        </td>
        <td>
          <button class="delete-btn" data-id="${item.id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;

      financeTableBody.appendChild(row);
    });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      financeData = financeData.filter((item) => item.id !== id);
      saveFinance();
      renderFinance();
    });
  });
}

function renderFinance() {
  updateSummary();
  populateStockSelect();
  const filtered = applyFilters(financeData);
  renderTable(filtered);
}

manualForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const type = transactionType.value;
  const category = transactionCategory.value.trim();
  const description = transactionDescription.value.trim();
  const amount = Number(transactionAmount.value);

  manualMessage.style.color = "#FF6B57";

  if (!type || !category || Number.isNaN(amount)) {
  manualMessage.textContent = "Preencha os campos obrigatórios.";
  return;
}

  if (amount <= 0) {
    manualMessage.textContent = "Digite um valor válido.";
    return;
  }

  financeData.push({
    id: crypto.randomUUID(),
    type,
    category,
    categoryKey: normalizeText(category).replace(/\s+/g, "_"),
    description: description || "-",
    amount,
    date: getTodayBR(),
    createdAtISO: `${getTodayISO()}T12:00:00`
  });

  saveFinance();
  renderFinance();

  manualMessage.style.color = "#27C17E";
  manualMessage.textContent = "Lançamento salvo com sucesso.";
  manualForm.reset();
});

stockPurchaseForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const productId = stockProduct.value;
  const qty = Number(purchaseQuantity.value);
  const cost = Number(unitCost.value);

  stockMessage.style.color = "#FF6B57";

  if (!productId || Number.isNaN(qty) || Number.isNaN(cost)) {
    stockMessage.textContent = "Preencha todos os campos da compra.";
    return;
  }

  if (qty <= 0 || cost <= 0) {
    stockMessage.textContent = "Informe quantidade e custo válidos.";
    return;
  }

  const product = stockData.find((item) => item.id === productId);

  if (!product) {
    stockMessage.textContent = "Produto não encontrado no estoque.";
    return;
  }

  const total = qty * cost;

  product.quantity += qty;
  product.updatedAt = getTodayBR();

  financeData.push({
    id: crypto.randomUUID(),
    type: "saida",
    category: "Compra de Estoque",
    categoryKey: "compra_estoque",
    description: `${qty} unid. de ${product.name} a ${formatMoney(cost)} cada`,
    amount: total,
    date: getTodayBR(),
    createdAtISO: `${getTodayISO()}T12:00:00`
  });

  saveStock();
  saveFinance();
  renderFinance();

  stockMessage.style.color = "#27C17E";
  stockMessage.textContent = `Compra registrada com sucesso. Gasto total: ${formatMoney(total)}.`;
  stockPurchaseForm.reset();
  updatePurchaseTotal();
});

[purchaseQuantity, unitCost].forEach((input) => {
  input.addEventListener("input", updatePurchaseTotal);
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    renderFinance();
  });
});

searchInput.addEventListener("input", renderFinance);

renderFinance();
updatePurchaseTotal();