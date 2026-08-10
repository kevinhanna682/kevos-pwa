// ============================================================
// KEVOS — frontend logic
// This file does 3 things:
//   1. Keeps the clock in the top-right ticking
//   2. Handles you typing + sending a message
//   3. Calls the backend (once it exists) and shows the reply
// ============================================================

// ---- 1. Live clock ----
function tickClock() {
  const el = document.getElementById('clock');
  const now = new Date();
  el.textContent = now.toLocaleTimeString('en-US', { hour12: false });
}
tickClock();
setInterval(tickClock, 1000);

// ---- 2. Chat elements ----
const feed = document.getElementById('feed');
const composer = document.getElementById('composer');
const input = document.getElementById('input');

// Auto-grow the textarea as you type
input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 120) + 'px';
});

// Enter sends, Shift+Enter makes a new line
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    composer.requestSubmit();
  }
});

function addMessage(role, text) {
  const wrap = document.createElement('div');
  wrap.className = `msg msg--${role}`;

  const meta = document.createElement('div');
  meta.className = 'msg__meta';
  meta.textContent = role === 'user' ? 'YOU' : role === 'kevos' ? 'KEVOS' : 'SYSTEM';

  const body = document.createElement('div');
  body.className = 'msg__body';
  body.textContent = text;

  wrap.appendChild(meta);
  wrap.appendChild(body);
  feed.appendChild(wrap);
  feed.scrollTop = feed.scrollHeight;
}

// ---- 3. Backend connection ----
// IMPORTANT: This is the ONE line you'll change later, once your
// Cloudflare Worker (KEVOS's brain) is deployed. Right now it's empty,
// so KEVOS just echoes a placeholder reply instead of really thinking.
const KEVOS_BACKEND_URL = ''; // <-- paste your Cloudflare Worker URL here later

async function sendToKevos(message) {
  if (!KEVOS_BACKEND_URL) {
    return "I'm not wired to a brain yet — KEVOS_BACKEND_URL is empty in app.js. Once the Cloudflare Worker is deployed, replies will come from me for real.";
  }

  try {
    const res = await fetch(KEVOS_BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    const data = await res.json();
    return data.reply || '(empty response from backend)';
  } catch (err) {
    return `Connection failed: ${err.message}`;
  }
}

composer.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  addMessage('user', text);
  input.value = '';
  input.style.height = 'auto';

  addMessage('system', 'thinking...');
  const thinkingNode = feed.lastElementChild;

  const reply = await sendToKevos(text);
  thinkingNode.remove();
  addMessage('kevos', reply);
});

// ---- Register the service worker (for offline support) ----
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // Silent fail is fine — app still works online without it
    });
  });
}
