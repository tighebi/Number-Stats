export function analyzeNumber(numInput) {
  const raw = String(numInput).trim();
  const num = Number(raw);
  if (raw === '') throw new Error('No input');
  if (Number.isNaN(num)) throw new Error('Invalid number');

  function isInteger(n) { return Number.isInteger(n); }
  function sign(n) { if (n === 0) return 'zero'; return n > 0 ? 'positive' : 'negative'; }
  function parity(n) { if (!isInteger(n)) return 'N/A'; return Math.abs(n) % 2 === 0 ? 'even' : 'odd'; }
  function factors(n) { if (!isInteger(n)) return null; const m = Math.abs(n); if (m === 0) return null; const res = new Set(); for (let i = 1; i <= Math.floor(Math.sqrt(m)); i++) { if (m % i === 0) { res.add(i); res.add(m / i); } } return Array.from(res).sort((a,b)=>a-b); }
  function primeFactors(n) { if (!isInteger(n)) return null; let m = Math.abs(n); if (m < 2) return []; const res=[]; for (let p=2;p*p<=m;p++){ while(m%p===0){ res.push(p); m/=p; } } if(m>1) res.push(m); return res; }
  function isPrime(n){ if(!isInteger(n)) return false; const m = Math.abs(n); if(m<2) return false; if(m===2||m===3) return true; if(m%2===0) return false; for(let i=3;i*i<=m;i+=2) if(m%i===0) return false; return true; }
  function sumOfProperDivisors(n){ if(!isInteger(n)) return null; const m=Math.abs(n); if(m<=1) return 0; let sum=1; for(let i=2;i<=Math.floor(Math.sqrt(m));i++){ if(m%i===0){ sum+=i; const j=m/i; if(j!==i) sum+=j; } } return sum; }
  function classificationByDivisors(n){ if(!isInteger(n)) return 'N/A'; const m=Math.abs(n); if(m<=1) return 'N/A'; const sod=sumOfProperDivisors(n); if(sod===m) return 'perfect'; if(sod>m) return 'abundant'; return 'deficient'; }
  function digitStats(n){ const s=Math.abs(n).toString(); const digits=s.replace('.',''); const counts={}; for(const ch of digits) counts[ch]=(counts[ch]||0)+1; const sum=digits.split('').reduce((a,d)=>a+Number(d),0); return {digits:digits.split(''),counts,sum,length:digits.length}; }

  return {
    raw, num,
    isInteger: isInteger(num),
    sign: sign(num),
    parity: parity(num),
    isPrime: isPrime(num),
    factors: factors(num),
    primeFactors: primeFactors(num),
    classificationByDivisors: classificationByDivisors(num),
    digitStats: digitStats(num),
  };
}

export function analyzeNumberToString(input){
  const r = analyzeNumber(input);
  const lines = [];
  lines.push(`Input: ${r.raw}`);
  lines.push(`Number: ${r.num}`);
  lines.push(`Type: ${r.isInteger? 'Integer' : 'Float'}`);
  lines.push(`Sign: ${r.sign}`);
  lines.push(`Parity: ${r.parity}`);
  if(r.isInteger) lines.push(`Prime: ${r.isPrime? 'yes':'no'}`);
  lines.push(`Factors: ${r.factors? r.factors.join(', ') : 'N/A'}`);
  lines.push(`Prime factors: ${r.primeFactors? r.primeFactors.join(', ') : 'N/A'}`);
  lines.push(`Divisor classification: ${r.classificationByDivisors}`);
  lines.push(`Digit count (excluding decimal point): ${r.digitStats.length}`);
  lines.push(`Digit sum: ${r.digitStats.sum}`);
  return lines.join('\n');
}
