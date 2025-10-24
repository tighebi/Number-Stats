import { analyzeNumberToString } from './stats.js';

// Elements
const input1 = document.getElementById('numberInput1');
const input2 = document.getElementById('numberInput2');
const btn = document.getElementById('goBtn');
const out = document.getElementById('output');
const controls = document.querySelector('.controls');
const tabSingle = document.getElementById('tabSingle');
const tabCompare = document.getElementById('tabCompare');

let mode = 'single'; // 'single' or 'compare'

function setMode(m) {
  mode = m;
  if (mode === 'compare') {
    controls.classList.add('compare');
    tabSingle.classList.remove('active'); tabSingle.setAttribute('aria-selected','false');
    tabCompare.classList.add('active'); tabCompare.setAttribute('aria-selected','true');
  } else {
    controls.classList.remove('compare');
    tabCompare.classList.remove('active'); tabCompare.setAttribute('aria-selected','false');
    tabSingle.classList.add('active'); tabSingle.setAttribute('aria-selected','true');
  }
  showEmptyStats();
}

// Helper: create a collapsible section element
// new: accepts opts = { individual: true } to add .individual class
function createSection(title, contentStr, opts = {}) {
  const section = document.createElement('section');
  section.className = 'section';
  if (opts.individual) section.classList.add('individual');

  const header = document.createElement('div');
  header.className = 'section-header';

  const toggle = document.createElement('button');
  toggle.className = 'section-toggle';
  toggle.setAttribute('aria-expanded', 'true');
  toggle.setAttribute('type', 'button');
  toggle.setAttribute('aria-label', `Toggle ${title}`);
  // visual content handled by CSS ::after

  const h = document.createElement('h3');
  h.textContent = title;

  header.appendChild(toggle);
  header.appendChild(h);

  const body = document.createElement('div');
  body.className = 'section-body';
  const pre = document.createElement('pre');
  pre.textContent = contentStr || '';
  body.appendChild(pre);

  section.appendChild(header);
  section.appendChild(body);

  return section;
}

// delegated toggle handler
out.addEventListener('click', (ev) => {
  const btn = ev.target.closest('.section-toggle');
  if (!btn) return;
  const section = btn.closest('.section');
  const expanded = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  section.classList.toggle('collapsed', expanded);
});

// Empty templates (now render DOM sections)
function showEmptyStats() {
  out.innerHTML = '';
  out.classList.remove('success','error');
  if (mode === 'compare') {
    // Comparison first
    out.appendChild(createSection('Comparison', 
`GCD: 
LCM: 
Common Divisors: 
Relatively Prime: 
Shared Prime Factors: `));
    out.appendChild(createSection('Arithmetic', 
`Sum: 
Product: 
Difference: 
Absolute Difference: 
Ratio (n1 / n2): 
Which is larger: 
Average: `));
    out.appendChild(createSection('Integer relations', `Integer relations: `));
    // then individuals (marked individual)
    out.appendChild(createSection('First Number', 
`Number: 
Binary: 
Hex: 
Square: 
Square Root: 
Is Even: 
Is Prime: 
Factors: `, { individual: true }));
    out.appendChild(createSection('Second Number', 
`Number: 
Binary: 
Hex: 
Square: 
Square Root: 
Is Even: 
Is Prime: 
Factors: `, { individual: true }));
  } else {
    out.appendChild(createSection('Number', 
`Number: 
Binary: 
Hex: 
Square: 
Square Root: 
Is Even: 
Is Prime: 
Factors: `, { individual: true }));
  }
}

// renderSingle: create individual section with larger style
function renderSingle(value) {
  try {
    if (value === '' || value == null) {
      showEmptyStats();
      return;
    }
    const text = analyzeNumberToString(Number(value));
    out.innerHTML = '';
    out.appendChild(createSection('Number', text, { individual: true }));
    out.classList.add('success');
    setTimeout(() => out.classList.remove('success'), 500);
  } catch (e) {
    out.innerHTML = '';
    out.appendChild(createSection('Error', 'Error: ' + e.message));
    out.classList.add('error');
    setTimeout(() => out.classList.remove('error'), 500);
  }
}

// renderCompare: append individual analyses with individual flag
function renderCompare(v1, v2) {
  try {
    if ((v1 === '' || v1 == null) && (v2 === '' || v2 == null)) {
      showEmptyStats();
      return;
    }
    if (v1 === '' || v1 == null || v2 === '' || v2 == null) {
      out.innerHTML = '';
      out.appendChild(createSection('Error', 'Please enter both numbers to compare.'));
      out.classList.add('error');
      setTimeout(() => out.classList.remove('error'), 500);
      return;
    }

    const n1 = safeNumber(v1);
    const n2 = safeNumber(v2);

    const text1 = analyzeNumberToString(n1).trim();
    const text2 = analyzeNumberToString(n2).trim();

    const i1 = Math.trunc(n1);
    const i2 = Math.trunc(n2);
    const g = gcd(n1, n2);
    const l = lcm(n1, n2);
    const divsG = getDivisors(g);
    const pf1 = primeFactors(i1);
    const pf2 = primeFactors(i2);
    const sharedPrime = pf1.filter(x => pf2.includes(x));
    const sum = n1 + n2;
    const product = n1 * n2;
    const diff = n1 - n2;
    const absDiff = Math.abs(diff);
    const ratio = (n2 === 0) ? '∞' : (n1 / n2);
    const larger = (n1 === n2) ? 'Equal' : (n1 > n2 ? 'First (n1) is larger' : 'Second (n2) is larger');
    const average = (n1 + n2) / 2;
    const isMultiple = (i2 !== 0 && i1 % i2 === 0) ? 'First is a multiple of Second' :
                       (i1 !== 0 && i2 % i1 === 0) ? 'Second is a multiple of First' : 'No direct integer multiple';
    const relativelyPrime = (g === 1) ? 'Yes' : 'No';
    const commonDivsText = divsG.length ? divsG.join(', ') : '-';

    out.innerHTML = '';

    // Comparison / arithmetic / relations sections first
    out.appendChild(createSection('Comparison',
`GCD (integers): ${g}
LCM (integers): ${l}
Common Divisors (of GCD): ${commonDivsText}
Relatively Prime: ${relativelyPrime}
Shared Prime Factors: ${formatArray(sharedPrime)}`));

    out.appendChild(createSection('Arithmetic',
`Sum: ${sum}
Product: ${product}
Difference (n1 - n2): ${diff}
Absolute Difference: ${absDiff}
Ratio (n1 / n2): ${ratio}
Which is larger: ${larger}
Average: ${average}`));

    out.appendChild(createSection('Integer relations', `${isMultiple}`));

    // Individual analyses at the bottom (larger)
    out.appendChild(createSection('First Number', text1, { individual: true }));
    out.appendChild(createSection('Second Number', text2, { individual: true }));

    out.classList.add('success');
    setTimeout(() => out.classList.remove('success'), 500);
  } catch (e) {
    out.innerHTML = '';
    out.appendChild(createSection('Error', 'Error: ' + e.message));
    out.classList.add('error');
    setTimeout(() => out.classList.remove('error'), 500);
  }
}

function handleAnalyze() {
  if (mode === 'compare') {
    renderCompare(input1.value, input2.value);
  } else {
    renderSingle(input1.value);
  }
}

// Tab handlers
tabSingle.addEventListener('click', () => setMode('single'));
tabCompare.addEventListener('click', () => setMode('compare'));

// Input Enter key
input1.addEventListener('keyup', e => { if (e.key === 'Enter') handleAnalyze(); });
input2.addEventListener('keyup', e => { if (e.key === 'Enter') handleAnalyze(); });
btn.addEventListener('click', handleAnalyze);

// Initial state
setMode('single');
input1.focus();
