const STORAGE_KEY = "barbergo_estoque";

const productForm = document.getElementById("productForm");
const productName = document.getElementById("productName");
const productCategory = document.getElementById("productCategory");
const productQuantity = document.getElementById("productQuantity");
const productMin = document.getElementById("productMin");
const formMessage = document.getElementById("formMessage");

const totalProducts = document.getElementById("totalProducts");
const lowStockCount = document.getElementById("lowStockCount");
const totalUnits = document.getElementById("totalUnits");

const searchInput = document.getElementById("searchInput");
const stockTableBody = document.getElementById("stockTableBody");
const emptyState = document.getElementById("emptyState");
const filterButtons = document.querySelectorAll(".filter-btn");

let currentFilter = "todos";

function getToday() {
  return new Date().toLocaleDateString("pt-BR");
}

function loadStock() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  if (data.length === 0) {
    return [
      {
        id: crypto.randomUUID(),
        name: "Pomada Modeladora BarberGo",
        category: "Finalização",
        quantity: 3,
        min: 5,
        updatedAt: getToday()
      }
    ];
  }

  return data;
}

let stock = loadStock();

function saveStock() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stock));
}

function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getStatus(product) {
  return product.quantity <= product.min ? "alerta" : "normal";
}

function updateSummary(products) {
  totalProducts.textContent = products.length;
  lowStockCount.textContent = products.filter(product => getStatus(product) === "alerta").length;
  totalUnits.textContent = products.reduce((acc, product) => acc + product.quantity, 0);
}

function applyFilters(products) {
  const term = normalizeText(searchInput.value.trim());

  return products.filter((product) => {
    const matchesSearch =
      normalizeText(product.name).includes(term) ||
      normalizeText(product.category).includes(term);

    const matchesFilter =
      currentFilter === "todos" ||
      (currentFilter === "alerta" && getStatus(product) === "alerta");

    return matchesSearch && matchesFilter;
  });
}

function renderTable(products) {
  stockTableBody.innerHTML = "";

  if (products.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  products.forEach((product) => {
    const status = getStatus(product);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <div class="product-name">
          <strong>${product.name}</strong>
          <span>Item cadastrado no sistema</span>
        </div>
      </td>
      <td>${product.category}</td>
      <td>${product.quantity}</td>
      <td>${product.min}</td>
      <td>
        <span class="status-badge ${status}">
          ${status === "alerta" ? "Em alerta" : "Normal"}
        </span>
      </td>
      <td>${product.updatedAt}</td>
      <td>
        <div class="actions">
          <button class="action-btn plus" data-action="plus" data-id="${product.id}">
            <i class="fa-solid fa-plus"></i>
          </button>
          <button class="action-btn minus" data-action="minus" data-id="${product.id}">
            <i class="fa-solid fa-minus"></i>
          </button>
          <button class="action-btn delete" data-action="delete" data-id="${product.id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    `;

    stockTableBody.appendChild(row);
  });

  document.querySelectorAll(".action-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const { action, id } = button.dataset;
      handleAction(action, id);
    });
  });
}

function handleAction(action, id) {
  const product = stock.find(item => item.id === id);

  if (!product) {
    return;
  }

  if (action === "plus") {
    product.quantity += 1;
    product.updatedAt = getToday();
  }

  if (action === "minus") {
    if (product.quantity > 0) {
      product.quantity -= 1;
      product.updatedAt = getToday();
    }
  }

  if (action === "delete") {
    stock = stock.filter(item => item.id !== id);
  }

  saveStock();
  renderStock();
}

productForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = productName.value.trim();
  const category = productCategory.value.trim();
  const quantity = Number(productQuantity.value);
  const min = Number(productMin.value);

  formMessage.style.color = "#FF6B57";

  if (!name || !category || Number.isNaN(quantity) || Number.isNaN(min)) {
    formMessage.textContent = "Preencha todos os campos.";
    return;
  }

  if (quantity < 0 || min < 0) {
    formMessage.textContent = "Os valores não podem ser negativos.";
    return;
  }

  stock.push({
    id: crypto.randomUUID(),
    name,
    category,
    quantity,
    min,
    updatedAt: getToday()
  });

  saveStock();
  renderStock();

  formMessage.style.color = "#27C17E";
  formMessage.textContent = "Produto cadastrado com sucesso.";
  productForm.reset();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    renderStock();
  });
});

searchInput.addEventListener("input", renderStock);

function renderStock() {
  const filteredProducts = applyFilters(stock);
  updateSummary(stock);
  renderTable(filteredProducts);
}

renderStock();