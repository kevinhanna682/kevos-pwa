# KEVOS

**Kevin's Executive Virtual Operations System** — a general-purpose AI subagent (business, code, research), modeled after JARVIS.

## How this project is structured

- **KEVOS** (this repo) — runs on its own GitHub + Cloudflare account. Does the actual work.
- **JARVIS** — Jay's assistant. Has edit access to KEVOS's code and supervises it. Runs separately.
- KEVOS and JARVIS talk to each other over **Telegram**.

KEVOS does not edit its own code. Only JARVIS can.

## What's in this folder right now

| File | What it does |
|---|---|
| `index.html` | The screen you see — the HUD |
| `style.css` | The black & yellow visual look |
| `app.js` | Handles typing, sending, and (later) talking to KEVOS's brain |
| `manifest.json` | Makes it installable as an app on phone/desktop |
| `sw.js` | Lets it open with no internet (offline shell only) |
| `icons/` | The KEVOS logo |

Right now this is the **shell only** — the face of KEVOS. It doesn't think yet, because it isn't connected to a backend. That's the next build step.

## Status

- [x] Frontend shell (this repo)
- [ ] Backend brain (Cloudflare Worker that calls the Anthropic API)
- [ ] Telegram bot connection
- [ ] JARVIS ↔ KEVOS communication channel
- [ ] Deploy to Cloudflare Pages

## Non-technical setup (for Kevin)

1. Create this repo on GitHub as `kevos-pwa` (public, with a README — you can replace this one).
2. Upload all these files into it.
3. Connect the repo to Cloudflare Pages (point-and-click, no commands needed) to get it live on the internet.
4. Come back for the next step: building the backend "brain."
