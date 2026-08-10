// ============================================================
// KEVOS — HUD logic
// Sections:
//   1. Particle sphere animation (the centerpiece visual)
//   2. Clock + session timer
//   3. Log feed (system / user / error lines)
//   4. Composer (typing + sending a command)
//   5. Backend connection (placeholder until Cloudflare Worker exists)
// ============================================================

// ---- 1. Particle sphere ----
const canvas = document.getElementById('sphere');
const ctx = canvas.getContext('2d');
let particles = [];
let rotation = 0;

function resizeCanvas() {
  canvas.width = canvas.offsetWidth * devicePixelRatio;
  canvas.height = canvas.offsetHeight * devicePixelRatio;
}

function buildParticles(count = 420) {
  particles = [];
  for (let i = 0; i < count; i++) {
    // Distribute points roughly evenly over a sphere surface
    const phi = Math.acos(-1 + (2 * i) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;
    particles.push({ phi, theta, size: Math.random() * 1.8 + 0.6 });
  }
}

function drawSphere() {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(w, h) * 0.32;

  rotation += 0.0022;

  for (const p of particles) {
    const theta = p.theta + rotation;
    const x = radius * Math.sin(p.phi) * Math.cos(theta);
    const y = radius * Math.cos(p.phi);
    const z = radius * Math.sin(p.phi) * Math.sin(theta);

    // simple perspective
    const scale = (z + radius * 1.6) / (radius * 2.6);
    const sx = cx + x * scale;
    const sy = cy + y * scale;
    const alpha = 0.25 + scale * 0.6;

    ctx.beginPath();
    ctx.arc(sx, sy, p.size * scale * devicePixelRatio, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(245, 196, 0, ${alpha.toFixed(2)})`;
    ctx.fill();
  }

  requestAnimationFrame(drawSphere);
}

resizeCanvas();
buildParticles();
window.addEventListener('resize', resizeCanvas);
requestAnimationFrame(drawSphere);

// ---- 2. Clock + session timer ----
const sessionStart = Date.now();

function pad(n) { return String(n).padStart(2, '0'); }

function tick() {
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleTimeString('en-US', { hour12: false });

  const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
  const hrs = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;
  document.getElementById('sessionTime').textContent = `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}
tick();
setInterval(tick, 1000);

// ---- 3. Log feed ----
const feed = document.getElementById('feed');

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

function logLine(kind, text) {
  const wrap = document.createElement('div');
  wrap.className = `logline logline--${kind}`;

  const meta = document.createElement('span');
  meta.className = 'logline__meta';
  const label = kind === 'user' ? 'KEVIN' : kind === 'error' ? 'ERROR' : 'SYSTEM';
  meta.textContent = `${label} // ${nowTime()}`;

  const body = document.createElement('span');
  body.className = 'logline__body';
  body.textContent = text;

  wrap.appendChild(meta);
  wrap.appendChild(body);
  feed.appendChild(wrap);
  feed.scrollTop = feed.scrollHeight;
  return wrap;
}

document.getElementById('resetBtn').addEventListener('click', () => {
  feed.innerHTML = '';
  logLine('system', 'Log cleared.');
});

// ---- 5. Backend connection ----
// This is the ONE line to change once the Cloudflare Worker (KEVOS's
// brain) is deployed. Right now it's empty, so KEVOS just logs an
// honest "not connected" message instead of pretending to think.
const KEVOS_BACKEND_URL = 'https://kevos-backend.margohanna333.workers.dev/';

async function sendToKevos(message) {
  if (!KEVOS_BACKEND_URL) {
    return { ok: false, text: 'No backend connected. KEVOS_BACKEND_URL is empty in app.js.' };
  }
  try {
    const res = await fetch(KEVOS_BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    const data = await res.json();
    return { ok: true, text: data.reply || '(empty response from backend)' };
  } catch (err) {
    return { ok: false, text: `Connection failed: ${err.message}` };
  }
}

// ---- 4. Composer ----
const composer = document.getElementById('composer');
const input = document.getElementById('input');
const linkState = document.getElementById('linkState');

composer.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  logLine('user', text);
  input.value = '';

  const result = await sendToKevos(text);
  logLine(result.ok ? 'system' : 'error', result.text);
});

// Reflect backend state in the top bar on load
if (KEVOS_BACKEND_URL) {
  linkState.textContent = 'LINK ACTIVE';
  linkState.className = 'linked';
} else {
  linkState.textContent = 'LINK PENDING';
  linkState.className = 'pending';
}
