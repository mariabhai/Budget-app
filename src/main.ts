import './style.css';
import type { BudgetItem, BudgetItemLists, BudgetItemType } from './models';

const STORAGE_KEY = 'budget-items';

const $ = <T extends Element>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Element hittades inte: ${selector}`);
  return element;
};

const expenseForm = $<HTMLFormElement>('#expense-form');
const expenseList = $<HTMLUListElement>('#expense-list');
const expenseDescInput = $<HTMLInputElement>('#desc');
const expenseAmountInput = $<HTMLInputElement>('#amount');
const expenseCategorySelect = $<HTMLSelectElement>('#expense-category');

const incomeForm = $<HTMLFormElement>('#income-form');
const incomeList = $<HTMLUListElement>('#income-list');
const incomeDescInput = $<HTMLInputElement>('#income-desc');
const incomeAmountInput = $<HTMLInputElement>('#income-amount');
const incomeCategorySelect = $<HTMLSelectElement>('#income-category');

const balanceEl = $<HTMLElement>('#balance');
const balanceCard = $<HTMLElement>('#balance-card');
const expensePanel = $<HTMLElement>('#expense-panel');
const incomePanel = $<HTMLElement>('#income-panel');
const viewButtons = document.querySelectorAll<HTMLButtonElement>('.view-btn');

let items: BudgetItem[] = [];

const formatMoney = (amount: number): string => `${amount.toFixed(2)} kr`;

const saveItems = (): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const loadItems = (): BudgetItem[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as BudgetItem[]) : [];
  } catch {
    return [];
  }
};

function getItemLists(): BudgetItemLists {
  return {
    expense: items.filter((item) => item.type === 'expense'),
    income: items.filter((item) => item.type === 'income'),
  };
}

function renderBalance(): void {
  const lists = getItemLists();
  const income = lists.income.reduce((sum, item) => sum + item.amount, 0);
  const expense = lists.expense.reduce((sum, item) => sum + item.amount, 0);

  const balance = income - expense;
  const status = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'zero';

  balanceEl.textContent = formatMoney(balance);
  balanceEl.classList.remove('positive', 'negative', 'zero');
  balanceCard.classList.remove('positive', 'negative', 'zero');
  balanceEl.classList.add(status);
  balanceCard.classList.add(status);
}

function createItemElement(item: BudgetItem): HTMLLIElement {
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

function renderLists(): void {
  expenseList.innerHTML = '';
  incomeList.innerHTML = '';

  const lists = getItemLists();
  lists.expense.forEach((item) => expenseList.appendChild(createItemElement(item)));
  lists.income.forEach((item) => incomeList.appendChild(createItemElement(item)));

  renderBalance();
}

function addItem(type: BudgetItemType, desc: string, amount: number, category: string) {
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

function deleteItem(id: string): void {
  items = items.filter((item) => item.id !== id);
  saveItems();
  renderLists();
}

function bindForm(
  type: BudgetItemType,
  form: HTMLFormElement,
  descInput: HTMLInputElement,
  amountInput: HTMLInputElement,
  categorySelect: HTMLSelectElement,
): void {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const desc = descInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categorySelect.value;

    if (!desc || Number.isNaN(amount) || amount <= 0 || !category) return;

    addItem(type, desc, amount, category);
    form.reset();
    descInput.focus();
  });
}

function handleDeleteClick(event: MouseEvent): void {
  const target = event.target as HTMLElement | null;
  const button = target?.closest<HTMLButtonElement>('.delete-btn');
  if (!button) return;
  const li = button.closest<HTMLLIElement>('li');
  if (!li?.dataset.id) return;
  deleteItem(li.dataset.id);
}

function populateCategories(
  select: HTMLSelectElement,
  categories: string[],
): void {
  select.innerHTML = '';
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });
}

function setActiveView(type: BudgetItemType): void {
  const showExpense = type === 'expense';
  expensePanel.classList.toggle('is-hidden', !showExpense);
  incomePanel.classList.toggle('is-hidden', showExpense);

  viewButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.view === type);
  });
}

async function loadCategories(): Promise<{ expense: string[]; income: string[] }> {
  const response = await fetch('/categories.json');
  if (!response.ok) {
    throw new Error('Kunde inte ladda kategorier.');
  }

  const data = (await response.json()) as unknown;
  if (Array.isArray(data)) {
    return {
      expense: data as string[],
      income: data as string[],
    };
  }

  if (typeof data === 'object' && data !== null) {
    const expense = (data as { expense?: unknown }).expense;
    const income = (data as { income?: unknown }).income;

    return {
      expense: Array.isArray(expense) ? (expense as string[]) : [],
      income: Array.isArray(income) ? (income as string[]) : [],
    };
  }

  return { expense: [], income: [] };
}

async function init(): Promise<void> {
  const categories = await loadCategories();
  populateCategories(expenseCategorySelect, categories.expense);
  populateCategories(incomeCategorySelect, categories.income);

  items = loadItems();
  renderLists();
}

bindForm(
  'expense',
  expenseForm,
  expenseDescInput,
  expenseAmountInput,
  expenseCategorySelect,
);
bindForm(
  'income',
  incomeForm,
  incomeDescInput,
  incomeAmountInput,
  incomeCategorySelect,
);

viewButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const type = button.dataset.view;
    if (type === 'expense' || type === 'income') {
      setActiveView(type);
    }
  });
});

setActiveView('expense');

expenseList.addEventListener('click', handleDeleteClick);
incomeList.addEventListener('click', handleDeleteClick);

init();
