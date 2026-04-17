import './style.css';
import { Wheel } from './wheel.js';

// State
let entries = JSON.parse(localStorage.getItem('wheel-entries')) || ['Pizza', 'Burger', 'Salade', 'Sushi', 'Tacos'];

// DOM Elements
const canvas = document.getElementById('wheelCanvas');
const input = document.getElementById('entryInput');
const addBtn = document.getElementById('addBtn');
const entryList = document.getElementById('entryList');
const spinBtn = document.getElementById('spinBtn');
const resultOverlay = document.getElementById('resultOverlay');
const resultName = document.getElementById('resultName');
const closeResultBtn = document.getElementById('closeResultBtn');

// Initialize Wheel
const wheel = new Wheel(canvas, entries);

// Listeners
wheel.onWinner = (winner) => {
  resultName.textContent = winner;
  resultOverlay.classList.add('active');
  
  // Haptic feedback if available
  if (window.navigator.vibrate) {
    window.navigator.vibrate([100, 30, 200]);
  }
};

addBtn.addEventListener('click', addEntry);
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addEntry();
});

spinBtn.addEventListener('click', () => {
  if (entries.length < 2) {
    alert('Ajoutez au moins 2 options pour tourner !');
    return;
  }
  wheel.spin();
});

closeResultBtn.addEventListener('click', () => {
  resultOverlay.classList.remove('active');
});

function addEntry() {
  const value = input.value.trim();
  if (value && !entries.includes(value)) {
    entries.push(value);
    input.value = '';
    updateUI();
  }
}

function removeEntry(index) {
  entries.splice(index, 1);
  updateUI();
}

function updateUI() {
  localStorage.setItem('wheel-entries', JSON.stringify(entries));
  wheel.updateEntries(entries);
  
  entryList.innerHTML = '';
  entries.forEach((entry, i) => {
    const li = document.createElement('li');
    li.className = 'entry-item';
    li.innerHTML = `
      <span>${entry}</span>
      <button class="remove-btn" data-index="${i}">&times;</button>
    `;
    entryList.appendChild(li);
  });

  // Re-attach delete listeners
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.onclick = () => removeEntry(parseInt(btn.dataset.index));
  });
}

// Initial UI sync
updateUI();
console.log('Magic Spin Wheel Initialized');
