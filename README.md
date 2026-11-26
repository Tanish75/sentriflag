# SentriFlag

**Real-Time AI Agent Guardrail & Circuit Breaker Experimenter**

SentriFlag lets you run live A/B experiments on AI agent security policies — controlled entirely by Flagsmith feature flags. Fire jailbreak attacks, prompt injections, and PII extraction attempts at two agent variants simultaneously, and watch how different guardrail levels (controlled by Flagsmith remote config) handle them. Flip the emergency kill switch in Flagsmith and both agents go offline instantly — no redeployment.

> Built for the WeMakeDevs × Flagsmith "Toggle Wars" Hackathon

---

## Why Flagsmith is Core (Not Cosmetic)

If you remove Flagsmith from this app:
- Guardrail levels revert to hardcoded defaults — the A/B experiment is gone
- The emergency kill switch stops working entirely
- Real-time flag value display on the Flag Dashboard breaks
- Model name and sensitivity settings become static

Flagsmith is the **control plane**. It is architecturally required.

---

## Features

| Feature | Description |
|---|---|
| 🛡️ A/B Guardrail Experiment | Two agent variants run different security policies side-by-side |
| 🔴 Emergency Kill Switch | `agent_emergency_shutdown` boolean flag takes both agents offline instantly |
| ⚡ 5 Attack Presets | Jailbreak, Prompt Injection, System Prompt Reveal, PII Extraction, SQL Injection |
| 📊 Live Metrics | Block rate, avg latency, safety score per variant — updates in real time |
| 🏳️ Flag Dashboard | See all Flagsmith flags and their live values, polling every 3 seconds |
| 🎛️ Remote Config | Guardrail level, model name, and sensitivity all controlled via Flagsmith values |

---

## Flagsmith Flags

| Flag Key | Type | Default | Description |
|---|---|---|---|
| `agent_emergency_shutdown` | Boolean | `false` | Kill switch — takes all agents offline |
| `variant_a_guardrail` | Remote Config | `permissive` | Security policy for Variant A |
| `variant_b_guardrail` | Remote Config | `zero_trust` | Security policy for Variant B |
| `active_model` | Remote Config | `gpt-4o-mini` | AI model name shown in panels |
| `jailbreak_sensitivity` | Remote Config | `0.7` | Jailbreak detection threshold (0.0–1.0) |

### Guardrail Levels

| Level | Behavior |
|---|---|
| `permissive` | Only blocks if 3+ threat types detected simultaneously |
| `moderate` | Blocks if any 1 threat type is detected |
| `zero_trust` | Blocks any threat, any prompt >600 chars, any special chars |

---

## Tech Stack

- **React 18** + Vite + Tailwind CSS
- **Flagsmith JS SDK** (`flagsmith` npm package) — client-side, real-time flag evaluation
- Framer Motion, Lucide React, React Router DOM
- No backend — all Flagsmith calls are client-side SDK

---

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/Tanish75/sentriflag.git
cd sentriflag/frontend
npm install
```

### 2. Configure Flagsmith

Open `src/lib/flagsmithClient.js` and set your environment key:

```js
const ENVIRONMENT_KEY = "your-flagsmith-environment-key";
```

### 3. Create Flags in Flagsmith Dashboard

Go to [app.flagsmith.com](https://app.flagsmith.com) → Your Project → Features → Create Feature:

1. `agent_emergency_shutdown` → Toggle (Boolean), default OFF
2. `variant_a_guardrail` → Feature + Value: `permissive`
3. `variant_b_guardrail` → Feature + Value: `zero_trust`
4. `active_model` → Feature + Value: `gpt-4o-mini`
5. `jailbreak_sensitivity` → Feature + Value: `0.7`

### 4. Run

```bash
npm run dev
```

Open `http://localhost:3000`

---

## Demo Walkthrough

1. Go to **Arena** — two agent panels side by side
2. Click **DAN Jailbreak** attack button — observe different responses based on guardrail level
3. Open Flagsmith → change `variant_a_guardrail` from `permissive` to `zero_trust` → go back to Arena → same attack is now blocked
4. Toggle `agent_emergency_shutdown` to ON → both agents go offline instantly
5. Visit **Flag Dashboard** — see all live flag values updating in real time

---

## Project Structure

```
frontend/
├── src/
│   ├── lib/
│   │   ├── flagsmithClient.js   # Flagsmith SDK init + helpers
│   │   ├── guardrails.js        # Threat detection engine
│   │   └── mockAI.js            # Simulated AI response engine
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── KillSwitchBanner.jsx
│   │   ├── GuardrailBadge.jsx
│   │   ├── AgentPanel.jsx
│   │   ├── MetricsPanel.jsx
│   │   └── AttackButtons.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Arena.jsx
│   │   └── FlagDashboard.jsx
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## License

MIT
