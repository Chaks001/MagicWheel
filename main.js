import './style.css';
import { Wheel } from './wheel.js';

// --- State Management ---
const DEFAULT_WHEELS = [
  { id: '1', name: '🍽️ Déjeuner', items: ['Pizza', 'Burger', 'Salade', 'Sushi', 'Tacos'] },
  { id: '2', name: '🎮 Jeux', items: ['Mario Kart', 'FIFA', 'Call of Duty', 'Minecraft'] },
  { id: '3', name: '🥤 Boisson', items: ['Eau', 'Cola', 'Jus', 'Thé glacé'] }
];

let state = JSON.parse(localStorage.getItem('magic-wheel-state')) || {
  activeWheelId: '1',
  wheels: DEFAULT_WHEELS
};

// --- DOM Elements ---
const canvas = document.getElementById('wheelCanvas');
const input = document.getElementById('entryInput');
const addBtn = document.getElementById('addBtn');
const entryList = document.getElementById('entryList');
const spinBtn = document.getElementById('spinBtn');
const resultOverlay = document.getElementById('resultOverlay');
const resultName = document.getElementById('resultName');
const closeResultBtn = document.getElementById('closeResultBtn');

const wheelTabs = document.getElementById('wheelTabs');
const newWheelBtn = document.getElementById('newWheelBtn');
const deleteWheelBtn = document.getElementById('deleteWheelBtn');

// New Modal Elements
const newWheelModal = document.getElementById('newWheelModal');
const newWheelNameInput = document.getElementById('newWheelNameInput');
const confirmNewWheelBtn = document.getElementById('confirmNewWheelBtn');
const cancelNewWheelBtn = document.getElementById('cancelNewWheelBtn');

// --- Initialization ---
const wheel = new Wheel(canvas, getActiveWheel().items);

// --- Core Logic ---
function getActiveWheel() {
  return state.wheels.find(w => w.id === state.activeWheelId) || state.wheels[0];
}

function saveState() {
  localStorage.setItem('magic-wheel-state', JSON.stringify(state));
}

function updateUI() {
  const activeWheel = getActiveWheel();
  
  // Update Wheel Tabs (Chips)
  wheelTabs.innerHTML = '';
  state.wheels.forEach(w => {
    const chip = document.createElement('div');
    chip.className = `wheel-chip ${w.id === state.activeWheelId ? 'active' : ''}`;
    chip.textContent = w.name;
    chip.onclick = () => {
      state.activeWheelId = w.id;
      updateUI();
    };
    wheelTabs.appendChild(chip);
  });

  // Update List
  entryList.innerHTML = '';
  activeWheel.items.forEach((entry, i) => {
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

  wheel.updateEntries(activeWheel.items);
  saveState();
}

// --- Event Listeners ---
wheel.onWinner = (winner) => {
  resultName.textContent = winner;
  resultOverlay.classList.add('active');
  if (window.navigator.vibrate) window.navigator.vibrate([100, 30, 200]);
};

addBtn.addEventListener('click', addEntry);
input.addEventListener('keypress', (e) => { if (e.key === 'Enter') addEntry(); });

spinBtn.addEventListener('click', () => {
  if (getActiveWheel().items.length < 2) {
    alert('Ajoutez au moins 2 options !');
    return;
  }
  wheel.spin();
});

closeResultBtn.addEventListener('click', () => {
  resultOverlay.classList.remove('active');
});

// --- Multi-Wheel Management ---
newWheelBtn.addEventListener('click', () => {
  newWheelModal.classList.add('active');
  newWheelNameInput.focus();
});

cancelNewWheelBtn.addEventListener('click', () => {
  newWheelModal.classList.remove('active');
  newWheelNameInput.value = '';
});

confirmNewWheelBtn.addEventListener('click', createNewWheel);
newWheelNameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') createNewWheel(); });

function createNewWheel() {
  const name = newWheelNameInput.value.trim();
  if (name) {
    const newWheel = {
      id: Date.now().toString(),
      name: name,
      items: []
    };
    state.wheels.push(newWheel);
    state.activeWheelId = newWheel.id;
    newWheelNameInput.value = '';
    newWheelModal.classList.remove('active');
    updateUI();
  }
}

deleteWheelBtn.addEventListener('click', () => {
  if (state.wheels.length <= 1) {
    alert('Vous devez garder au moins une roue !');
    return;
  }
  if (confirm(`Supprimer la roue "${getActiveWheel().name}" ?`)) {
    state.wheels = state.wheels.filter(w => w.id !== state.activeWheelId);
    state.activeWheelId = state.wheels[0].id;
    updateUI();
  }
});

function addEntry() {
  const value = input.value.trim();
  const activeWheel = getActiveWheel();
  if (value && !activeWheel.items.includes(value)) {
    activeWheel.items.push(value);
    input.value = '';
    updateUI();
  }
}

function removeEntry(index) {
  getActiveWheel().items.splice(index, 1);
  updateUI();
}

// Initial Sync
updateUI();
console.log('Magic Spin Wheel with Custom Modals initialized');
