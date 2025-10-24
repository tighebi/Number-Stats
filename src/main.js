import { analyzeNumberToString } from './stats.js';

const input = document.getElementById('numberInput');
const btn = document.getElementById('goBtn');
const out = document.getElementById('output');

function render(value) {
  try {
    if (!value && value !== 0) {
      out.textContent = 'Please enter a number';
      return;
    }
    const text = analyzeNumberToString(value);
    out.textContent = text;
    out.classList.add('success');
    setTimeout(() => out.classList.remove('success'), 500);
  } catch (e) {
    out.textContent = 'Error: ' + e.message;
    out.classList.add('error');
    setTimeout(() => out.classList.remove('error'), 500);
  }
}

function showEmptyStats() {
  const output = document.getElementById('output');
  output.textContent = `Number: 
Binary: 
Hex: 
Square: 
Square Root: 
Is Even: 
Is Prime: 
Factors: 
`;
}

// Unified analyze function
function handleAnalyze() {
  render(input.value);
}

// Event listeners
btn.addEventListener('click', handleAnalyze);
input.addEventListener('keyup', e => {
  if (e.key === 'Enter') handleAnalyze();
});

// Initial setup
showEmptyStats();
input.focus();
