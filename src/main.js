import './style.css';
const STORAGE_KEY = 'budget-items';

const expenseForm = document.querySelector('#expense-form');
const expenseList = document.querySelector('#expense-list');
const expenseDescInput = document.querySelector('#desc');
const expenseAmountInput = document.querySelector('#amount');
const expenseCategorySelect = document.querySelector('#expense-category');

const incomeForm = document.querySelector('#income-form');
const incomeList = document.querySelector('#income-list');
const incomeDescInput = document.querySelector('#income-desc');
const incomeAmountInput = document.querySelector('#income-amount');
const incomeCategorySelect = document.querySelector('#income-category');

const balanceEl = document.querySelector('#balance');
const balanceCard = document.querySelector('#balance-card');

let items = [];

function formatMoney(amount) {
  return `${amount.toFixed(2)} kr`;
}

// Spara listan i localStorage så den finns kvar vid nästa besök.
function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// Läs in listan från localStorage (om den finns).
function loadItems() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Räkna ut balans och uppdatera färg.
function updateBalance() {
  const incomeTotal = items
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);
  const expenseTotal = items
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = incomeTotal - expenseTotal;
  balanceEl.textContent = formatMoney(balance);
  balanceEl.classList.remove('positive', 'negative', 'zero');
  balanceCard.classList.remove('positive', 'negative', 'zero');
  if (balance > 0) {
    balanceEl.classList.add('positive');
    balanceCard.classList.add('positive');
  } else if (balance < 0) {
    balanceEl.classList.add('negative');
    balanceCard.classList.add('negative');
  } else {
    balanceEl.classList.add('zero');
    balanceCard.classList.add('zero');
  }
}

// Skapar ett <li>-element för en budgetpost.
function createItemElement(item) {
  const li = document.createElement('li');
  li.dataset.id = item.id;
  li.innerHTML = `
    <div class="meta">
      <span>${item.desc}</span>
      <small>${item.category}</small>
    </div>
    <div class="actions">
      <strong>${formatMoney(item.amount)}</strong>
      <button class="delete-btn" type="button" aria-label="Radera">Radera</button>
    </div>
  `;
  return li;
}

// Renderar ut listorna på sidan.
function renderLists() {
  expenseList.innerHTML = '';
  incomeList.innerHTML = '';

  items
    .filter((item) => item.type === 'expense')
    .forEach((item) => expenseList.appendChild(createItemElement(item)));
  items
    .filter((item) => item.type === 'income')
    .forEach((item) => incomeList.appendChild(createItemElement(item)));

  updateBalance();
}

// Lägg till en ny post i listan.
function addItem({ type, desc, amount, category }) {
  items.unshift({
    id: crypto.randomUUID(),
    type,
    desc,
    amount,
    category,
  });
  saveItems();
  renderLists();
}

// Ta bort en post med id.
function deleteItem(id) {
  items = items.filter((item) => item.id !== id);
  saveItems();
  renderLists();
}

// Gemensam logik för båda formulären.
function handleFormSubmit({
  event,
  type,
  form,
  descInput,
  amountInput,
  categorySelect,
}) {
  event.preventDefault();

  const desc = descInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categorySelect.value;

  if (!desc || Number.isNaN(amount) || amount <= 0 || !category) {
    return;
  }

  addItem({ type, desc, amount, category });

  form.reset();
  descInput.focus();
}

// Klick på radera-knapp i listan.
function handleDeleteClick(event) {
  const button = event.target.closest('.delete-btn');
  if (!button) return;
  const li = button.closest('li');
  if (!li?.dataset.id) return;
  deleteItem(li.dataset.id);
}

// Fyll dropdown med kategorier.
function populateCategories(select, categories) {
  select.innerHTML = '';
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });
}

// Ladda kategorier från JSON-filen.
async function loadCategories() {
  const response = await fetch('/categories.json');
  if (!response.ok) {
    throw new Error('Kunde inte ladda kategorier.');
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

// Start: ladda kategorier, ladda sparade poster, rendera.
async function init() {
  const categories = await loadCategories();
  populateCategories(expenseCategorySelect, categories);
  populateCategories(incomeCategorySelect, categories);

  items = loadItems();
  renderLists();
}

expenseForm.addEventListener('submit', (event) =>
  handleFormSubmit({
    event,
    type: 'expense',
    form: expenseForm,
    descInput: expenseDescInput,
    amountInput: expenseAmountInput,
    categorySelect: expenseCategorySelect,
  }),
);

incomeForm.addEventListener('submit', (event) =>
  handleFormSubmit({
    event,
    type: 'income',
    form: incomeForm,
    descInput: incomeDescInput,
    amountInput: incomeAmountInput,
    categorySelect: incomeCategorySelect,
  }),
);

expenseList.addEventListener('click', handleDeleteClick);
incomeList.addEventListener('click', handleDeleteClick);

init();
