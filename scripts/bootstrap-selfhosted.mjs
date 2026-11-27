#!/usr/bin/env node
/**
 * Zero-config bootstrapper for Self-Hosted Flagsmith + SentriFlag.
 * Waits for Flagsmith health, creates/logs into an admin account, provisions
 * the SentriFlag project and all 5 AI guardrail flags, and writes frontend/.env.local.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = (process.env.FLAGSMITH_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');
const HEALTH_URL = `${BASE_URL.replace(/\/api\/v1$/, '')}/health/`;
const EMAIL = process.env.FLAGSMITH_ADMIN_EMAIL || 'admin@sentriflag.local';
const PASSWORD = process.env.FLAGSMITH_ADMIN_PASSWORD || 'SentriFlag!2026';

const FLAGS = [
  { name: 'agent_emergency_shutdown', type: 'STANDARD', default_enabled: false, initial_value: null, description: 'Global circuit breaker that halts all AI agents' },
  { name: 'variant_a_guardrail', type: 'STANDARD', default_enabled: true, initial_value: 'permissive', description: 'Guardrail policy for Variant A (permissive | moderate | zero_trust)' },
  { name: 'variant_b_guardrail', type: 'STANDARD', default_enabled: true, initial_value: 'zero_trust', description: 'Guardrail policy for Variant B (permissive | moderate | zero_trust)' },
  { name: 'active_model', type: 'STANDARD', default_enabled: true, initial_value: 'gpt-4o-mini', description: 'Active LLM model identifier' },
  { name: 'jailbreak_sensitivity', type: 'STANDARD', default_enabled: true, initial_value: '0.7', description: 'Jailbreak detection threshold (0.0 - 1.0)' },
];

async function waitForHealth(retries = 24, delayMs = 2500) {
  for (let i = 1; i <= retries; i++) {
    try {
      const res = await fetch(HEALTH_URL);
      if (res.ok) return;
    } catch { /* retry */ }
    console.log(`Waiting for Flagsmith at ${HEALTH_URL} (${i}/${retries})...`);
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error(`Flagsmith did not become healthy at ${HEALTH_URL}`);
}

async function api(endpoint, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Token ${token}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) throw new Error(`${res.status} ${endpoint}: ${JSON.stringify(data)}`);
  return data;
}

const listify = (data) => (Array.isArray(data) ? data : data?.results || []);

async function main() {
  await waitForHealth();
  console.log(`Connected to self-hosted Flagsmith at ${BASE_URL}`);

  try {
    await api('/auth/users/', {
      method: 'POST',
      body: JSON.stringify({ email: EMAIL, password: PASSWORD, first_name: 'SentriFlag', last_name: 'Admin' }),
    });
    console.log('Created admin user:', EMAIL);
  } catch {
    console.log('Admin user already exists, logging in:', EMAIL);
  }

  const auth = await api('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const token = auth.key;
  if (!token) throw new Error('Login succeeded but no API token returned');

  const orgs = listify(await api('/organisations/', {}, token));
  const org = orgs[0] || await api('/organisations/', { method: 'POST', body: JSON.stringify({ name: 'SentriFlag Org' }) }, token);

  const projects = listify(await api(`/projects/?organisation=${org.id}`, {}, token));
  const project = projects.find((p) => p.name === 'SentriFlag')
    || await api('/projects/', { method: 'POST', body: JSON.stringify({ name: 'SentriFlag', organisation: org.id }) }, token);

  const envs = listify(await api(`/environments/?project=${project.id}`, {}, token));
  const env = envs[0];
  if (!env) throw new Error('No environment found for SentriFlag project');
  console.log(`Project "${project.name}" | Environment "${env.name}" (${env.api_key})`);

  const existing = listify(await api(`/projects/${project.id}/features/`, {}, token));
  const existingNames = new Set(existing.map((f) => f.name));

  for (const flag of FLAGS) {
    if (existingNames.has(flag.name)) {
      console.log(`  [skip] ${flag.name} already exists`);
      continue;
    }
    await api(`/projects/${project.id}/features/`, { method: 'POST', body: JSON.stringify(flag) }, token);
    console.log(`  [created] ${flag.name} = ${flag.initial_value ?? flag.default_enabled}`);
  }

  const envPath = path.resolve(__dirname, '..', 'frontend', '.env.local');
  fs.writeFileSync(envPath, `VITE_FLAGSMITH_ENV_KEY=${env.api_key}\nVITE_FLAGSMITH_API_URL=${BASE_URL}/\n`);
  console.log(`\nWrote ${envPath}`);
  console.log('Ready! Start the UI with "cd frontend && npm run dev" or "docker compose up -d --build sentriflag-ui".');
}

main().catch((err) => {
  console.error('Bootstrap failed:', err.message);
  process.exit(1);
});
