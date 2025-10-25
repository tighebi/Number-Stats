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
  // show explicit text rather than relying on CSS ::after
  toggle.textContent = '-';

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
  // toggle aria state
  btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  // toggle visible text
  btn.textContent = expanded ? '+' : '-';
  section.classList.toggle('collapsed', expanded);
});

// Empty templates (now render DOM sections)
// Updated so labels match what analyze/render functions produce
function showEmptyStats() {
  out.innerHTML = '';
  out.classList.remove('success','error');
  if (mode === 'compare') {
    // Comparison first (labels match renderCompare)
    out.appendChild(createSection('Comparison', 
`GCD (integers): 
LCM (integers): 
Common Divisors (of GCD): 
Relatively Prime: 
Shared Prime Factors: `));
    out.appendChild(createSection('Arithmetic', 
`Sum: 
Product: 
Difference (n1 - n2): 
Absolute Difference: 
Ratio (n1 / n2): 
Which is larger: 
Average: `));
    out.appendChild(createSection('Integer relations', `No direct integer multiple`));
    // then individuals (labels match analyzeNumberToString output)
    const individualTemplate = 
`Input: 
Number: 
Type: 
Sign: 
Parity: 
Prime: 
Factors: 
Prime factors: 
Divisor classification: 
Digit count (excluding decimal point): 
Digit sum: `;
    out.appendChild(createSection('First Number', individualTemplate, { individual: true }));
    out.appendChild(createSection('Second Number', individualTemplate, { individual: true }));
  } else {
    // Single mode: labels match analyzeNumberToString
    out.appendChild(createSection('Number', 
`Input: 
Number: 
Type: 
Sign: 
Parity: 
Prime: 
Factors: 
Prime factors: 
Divisor classification: 
Digit count (excluding decimal point): 
Digit sum: `, { individual: true }));
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

// --- ADDED helpers (fixes errors in compare mode) ---
function safeNumber(v) {
  const n = Number(v);
  if (Number.isNaN(n)) throw new Error('Invalid number');
  return n;
}

function gcd(a, b) {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  if (x === 0) return y;
  if (y === 0) return x;
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

function lcm(a, b) {
  const x = Math.abs(Math.trunc(a));
  const y = Math.abs(Math.trunc(b));
  if (x === 0 || y === 0) return 0;
  return Math.abs((x / gcd(x, y)) * y);
}

function getDivisors(n) {
  const m = Math.abs(Math.trunc(n));
  if (m === 0) return [];
  const divs = new Set();
  for (let i = 1; i <= Math.floor(Math.sqrt(m)); i++) {
    if (m % i === 0) {
      divs.add(i);
      divs.add(m / i);
    }
  }
  return Array.from(divs).sort((a,b)=>a-b);
}

function primeFactors(n) {
  let m = Math.abs(Math.trunc(n));
  if (m < 2) return [];
  const res = [];
  for (let p = 2; p * p <= m; p++) {
    while (m % p === 0) {
      res.push(p);
      m = Math.trunc(m / p);
    }
  }
  if (m > 1) res.push(m);
  return Array.from(new Set(res));
}

function formatArray(arr) {
  if (!arr || arr.length === 0) return '-';
  return arr.join(', ');
}
// --- END added helpers ---

// renderCompare: append individual analyses with individual flag
function renderCompare(v1, v2) {
  try {
    // Clear any previous states
    out.innerHTML = '';
    out.classList.remove('success', 'error');

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

    // Get individual analyses first to catch any potential errors
    const text1 = analyzeNumberToString(n1);
    const text2 = analyzeNumberToString(n2);

    // integer-based comparisons (use integer truncation)
    const i1 = Math.trunc(n1);
    const i2 = Math.trunc(n2);
    const g = gcd(i1, i2);
    const l = lcm(i1, i2);
    const divsG = getDivisors(g);
    const pf1 = primeFactors(i1);
    const pf2 = primeFactors(i2);
    const sharedPrime = pf1.filter(x => pf2.includes(x));
    
    // Compute remaining stats
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

    // Render sections
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

    out.appendChild(createSection('Integer relations', isMultiple));

    // Individual analyses at the bottom
    out.appendChild(createSection('First Number', text1.trim(), { individual: true }));
    out.appendChild(createSection('Second Number', text2.trim(), { individual: true }));

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

/* Interactive background: particles + cursor interaction (random wander + repulsion) */
function initInteractiveBackground() {
  const canvas = document.getElementById('interactiveBg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const particles = [];
  // scale particle count with viewport area (kept modest)
  const PARTICLE_COUNT = Math.max(40, Math.round(Math.min(240, (w * h) / 80000)));
  const rand = (a, b) => a + Math.random() * (b - a);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: rand(-0.8, 0.8),  // doubled initial velocity
      vy: rand(-0.8, 0.8),  // doubled initial velocity
      size: rand(1.5, 3.5),
      hue: rand(170, 300),
      life: Infinity,
      jitter: Math.random() * 1000
    });
  }

  const mouse = { x: null, y: null, moved: false };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.moved = true;
  });

  document.addEventListener('mouseleave', () => {
    mouse.moved = false;
    mouse.x = null;
    mouse.y = null;
  });

  // Click bursts remain the same
  document.addEventListener('click', (e) => {
    const cx = e.clientX, cy = e.clientY;
    for (let i = 0; i < 24; i++) {
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos((i / 24) * Math.PI * 2) * rand(1, 4) + rand(-0.5, 0.5),
        vy: Math.sin((i / 24) * Math.PI * 2) * rand(1, 4) + rand(-0.5, 0.5),
        size: rand(2.5, 5.5),
        hue: rand(160, 320),
        life: 80 + Math.floor(rand(0, 60)),
        jitter: Math.random() * 1000
      });
    }
  }, { passive: true });

  let t = 0;
  function step() {
    t += 0.016;
    ctx.fillStyle = 'rgba(0,0,0,0.14)';  // slightly less trail
    ctx.fillRect(0, 0, w, h);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      // increased random movement
      const jitterForce = 0.12;  // doubled
      p.vx += (Math.cos((t + p.jitter) * 0.8) * 0.5) * jitterForce;
      p.vy += (Math.sin((t + p.jitter) * 1.0) * 0.5) * jitterForce;

      // stronger magnetic-like repulsion
      if (mouse.x != null && mouse.moved) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist2 = dx * dx + dy * dy + 0.001;
        // much stronger force at close range
        const force = Math.min(8.0, 250000 / (dist2 + 400));
        const invDist = 1 / Math.sqrt(dist2);
        // increased base repulsion strength
        const fx = (dx * invDist) * force * 0.006;
        const fy = (dy * invDist) * force * 0.006;
        p.vx += fx;
        p.vy += fy;
      }

      // increased random jitter
      p.vx += rand(-0.02, 0.02);
      p.vy += rand(-0.02, 0.02);

      // less dampening for more energetic movement
      p.vx *= 0.975;
      p.vy *= 0.975;

      // move
      p.x += p.vx;
      p.y += p.vy;

      // gentle wrap
      if (p.x < -40) p.x = w + 40;
      if (p.x > w + 40) p.x = -40;
      if (p.y < -40) p.y = h + 40;
      if (p.y > h + 40) p.y = -40;

      // life decay for click particles
      if (p.life !== Infinity) {
        p.life--;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
      }

      // draw glow
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 8);
      g.addColorStop(0, `hsla(${p.hue},100%,70%,0.85)`);
      g.addColorStop(0.2, `hsla(${p.hue},100%,65%,0.45)`);
      g.addColorStop(0.7, `hsla(${p.hue},100%,55%,0.06)`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 8, 0, Math.PI * 2);
      ctx.fill();

      // core
      ctx.fillStyle = `hsla(${p.hue},100%,70%,0.95)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // if mouse moved recently, set a short timeout to mark idle (reduce repulsion)
    if (mouse.moved) {
      clearTimeout(window._interactiveMouseTimer);
      window._interactiveMouseTimer = setTimeout(() => { mouse.moved = false; }, 160);
    }

    // limit particle count
    if (particles.length > 800) {
      particles.splice(0, particles.length - 800);
    }

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// initialize interactive background after DOM ready (module runs at end so DOM exists)
initInteractiveBackground();
