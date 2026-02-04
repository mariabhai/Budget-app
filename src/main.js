import './style.css';

const expenseForm = document.querySelector('#expense-form');
const expenseList = document.querySelector('#expense-list');
const expenseDescInput = document.querySelector('#desc');
const expenseAmountInput = document.querySelector('#amount');

const incomeForm = document.querySelector('#income-form');
const incomeList = document.querySelector('#income-list');
const incomeDescInput = document.querySelector('#income-desc');
const incomeAmountInput = document.querySelector('#income-amount');

expenseForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const desc = expenseDescInput.value.trim();
  const amount = Number(expenseAmountInput.value);

  if (!desc || Number.isNaN(amount)) {
    return;
  }

  const li = document.createElement('li');
  li.innerHTML = `
    <span>${desc}</span>
    <strong>${amount.toFixed(2)} kr</strong>
  `;
  expenseList.appendChild(li);

  expenseForm.reset();
  expenseDescInput.focus();
});
// Income form handling
incomeForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const desc = incomeDescInput.value.trim();
  const amount = Number(incomeAmountInput.value);

  if (!desc || Number.isNaN(amount)) {
    return;
  }

  const li = document.createElement('li');
  li.innerHTML = `
    <span>${desc}</span>
    <strong>${amount.toFixed(2)} kr</strong>
  `;
  incomeList.appendChild(li);

  incomeForm.reset();
  incomeDescInput.focus();
});
