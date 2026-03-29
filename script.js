const form = document.getElementById('paymentForm');
const recordsBody = document.getElementById('recordsBody');
const emptyState = document.getElementById('emptyState');
const clearDataBtn = document.getElementById('clearData');

const totalEntriesEl = document.getElementById('totalEntries');
const totalAmountEl = document.getElementById('totalAmount');
const pendingEntriesEl = document.getElementById('pendingEntries');

const STORAGE_KEY = 'tallypay_records_v1';
let records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(value);

function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function updateSummary() {
  const totalEntries = records.length;
  const totalAmount = records.reduce((sum, item) => sum + Number(item.amount), 0);
  const pendingEntries = records.filter((item) => item.paytmStatus === 'Pending').length;

  totalEntriesEl.textContent = totalEntries;
  totalAmountEl.textContent = formatCurrency(totalAmount);
  pendingEntriesEl.textContent = pendingEntries;
}

function renderTable() {
  recordsBody.innerHTML = '';

  if (!records.length) {
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
  }

  records.forEach((record) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${record.userName}</td>
      <td>${record.paymentDate}</td>
      <td>${record.mobileNo}</td>
      <td>${formatCurrency(record.amount)}</td>
      <td>${record.method}</td>
      <td><span class="status ${record.paytmStatus}">${record.paytmStatus}</span></td>
      <td><button class="delete-btn" data-id="${record.id}">Delete</button></td>
    `;

    recordsBody.appendChild(tr);
  });

  updateSummary();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const newRecord = {
    id: crypto.randomUUID(),
    userName: document.getElementById('userName').value.trim(),
    paymentDate: document.getElementById('paymentDate').value,
    mobileNo: document.getElementById('mobileNo').value.trim(),
    amount: Number(document.getElementById('amount').value),
    method: document.getElementById('method').value,
    paytmStatus: document.getElementById('paytmStatus').value
  };

  records.unshift(newRecord);
  saveRecords();
  renderTable();
  form.reset();
});

recordsBody.addEventListener('click', (event) => {
  const target = event.target;
  if (target.classList.contains('delete-btn')) {
    const id = target.dataset.id;
    records = records.filter((record) => record.id !== id);
    saveRecords();
    renderTable();
  }
});

clearDataBtn.addEventListener('click', () => {
  const ok = confirm('Delete all payment records? This cannot be undone.');
  if (!ok) return;

  records = [];
  saveRecords();
  renderTable();
});

renderTable();
