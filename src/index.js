#!/usr/bin/env node
const os = require('os');

function parseInput(argv) {
  // Accept number as first arg, or prompt
  if (argv.length < 3) return null;
  const raw = argv[2];
  const num = Number(raw);
  if (Number.isNaN(num)) return { error: `Invalid number: ${raw}` };
  return { raw, num };
}

function isInteger(n) {
  return Number.isInteger(n);
}

function sign(n) {
  if (n === 0) return 'zero';
  return n > 0 ? 'positive' : 'negative';
}

function parity(n) {
  if (!isInteger(n)) return 'N/A';
  return Math.abs(n) % 2 === 0 ? 'even' : 'odd';
}

function factors(n) {
  if (!isInteger(n)) return null;
  const m = Math.abs(n);
  if (m === 0) return null;
  const res = new Set();
  for (let i = 1; i <= Math.floor(Math.sqrt(m)); i++) {
    if (m % i === 0) {
      res.add(i);
      res.add(m / i);
    }
  }
  return Array.from(res).sort((a, b) => a - b);
}

function primeFactors(n) {
  if (!isInteger(n)) return null;
  let m = Math.abs(n);
  if (m < 2) return [];
  const res = [];
  for (let p = 2; p * p <= m; p++) {
    while (m % p === 0) {
      res.push(p);
      m = m / p;
    }
  }
  if (m > 1) res.push(m);
  return res;
}

function isPrime(n) {
  if (!isInteger(n)) return false;
  const m = Math.abs(n);
  if (m < 2) return false;
  if (m === 2 || m === 3) return true;
  if (m % 2 === 0) return false;
  for (let i = 3; i * i <= m; i += 2) {
    if (m % i === 0) return false;
  }
  return true;
}

function sumOfProperDivisors(n) {
  if (!isInteger(n)) return null;
  const m = Math.abs(n);
  if (m <= 1) return 0;
  let sum = 1;
  for (let i = 2; i <= Math.floor(Math.sqrt(m)); i++) {
    if (m % i === 0) {
      sum += i;
      const j = m / i;
      if (j !== i) sum += j;
    }
  }
  return sum;
}

function classificationByDivisors(n) {
  if (!isInteger(n)) return 'N/A';
  const m = Math.abs(n);
  if (m <= 1) return 'N/A';
  const sod = sumOfProperDivisors(n);
  if (sod === m) return 'perfect';
  if (sod > m) return 'abundant';
  return 'deficient';
}

function digitStats(n) {
  const s = Math.abs(n).toString();
  const digits = s.replace('.', '');
  const counts = {};
  for (const ch of digits) counts[ch] = (counts[ch] || 0) + 1;
  const sum = digits.split('').reduce((acc, d) => acc + Number(d), 0);
  return { digits: digits.split(''), counts, sum, length: digits.length };
}

function humanList(arr) {
  if (!arr) return 'N/A';
  if (arr.length === 0) return 'none';
  return arr.join(', ');
}

function printStats({ raw, num }) {
  console.log(`Input: ${raw}`);
  console.log(`Number: ${num}`);
  console.log('---');
  console.log(`Type: ${isInteger(num) ? 'Integer' : 'Float'}`);
  console.log(`Sign: ${sign(num)}`);
  console.log(`Parity: ${parity(num)}`);
  if (isInteger(num)) console.log(`Prime: ${isPrime(num) ? 'yes' : 'no'}`);
  console.log(`Factors: ${humanList(factors(num))}`);
  console.log(`Prime factors: ${humanList(primeFactors(num))}`);
  console.log(`Divisor classification: ${classificationByDivisors(num)}`);
  const ds = digitStats(num);
  console.log(`Digit count (excluding decimal point): ${ds.length}`);
  console.log(`Digit sum: ${ds.sum}`);
  console.log('---');
  console.log(`Platform: ${os.platform()} ${os.arch()}`);
}

function main() {
  const parsed = parseInput(process.argv);
  if (!parsed) {
    console.log('Usage: node src/index.js <number>');
    console.log('Or: npm run dev -- <number>');
    return;
  }
  if (parsed.error) {
    console.error(parsed.error);
    return;
  }
  printStats(parsed);
}

if (require.main === module) main();
