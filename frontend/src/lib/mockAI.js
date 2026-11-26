// SentriFlag — Mock AI Engine
// Simulates AI agent responses controlled by Flagsmith guardrail levels

const SAFE_RESPONSES = [
  "Session state has been synchronized across distributed worker nodes. Partition latency is currently tracking at 14ms.",
  "Payload schema validated against system requirements. All downstream microservice bindings returned status 200 OK.",
  "Vector similarity search completed across active embeddings index with cosine distance metrics within normal bounds.",
  "To implement token rotation securely, configure short-lived access tokens via HTTP-only cookies with SameSite=Strict.",
  "Authentication context verified. Role-based access control policies allow standard query execution for this scope.",
  "Database query plan analyzed. Parameterized execution avoids table scans and utilizes composite index on primary keys.",
];

const KEYWORD_RESPONSES = {
  code: "Implementation reference:\n```javascript\nexport function sanitizeInput(payload) {\n  return payload.replace(/[<>{}\\[\\]\\\\]/g, '').trim();\n}\n```\nThis strips structural injection characters before parsing.",
  api: "Endpoint specifications: Enforce Bearer token verification, return standard RFC 7807 problem details on failure, and configure rate-limiting per client IP.",
  deploy: "Production deployment guidelines: Run automated container vulnerability scans, require signed commits, and verify blue/green rollback triggers.",
  security: "Zero-trust checklist: Verify cryptographic signatures on tokens, enforce strict CSP headers, and decouple runtime guardrails via Flagsmith remote flags.",
  database: "SQL security best practice: Always bind query parameters through prepared statements; never concatenate raw user input into executable strings.",
};

function pickSafeResponse(prompt) {
  const lower = prompt.toLowerCase();
  for (const [keyword, response] of Object.entries(KEYWORD_RESPONSES)) {
    if (lower.includes(keyword)) return response;
  }
  return SAFE_RESPONSES[Math.floor(Math.random() * SAFE_RESPONSES.length)];
}

function getModelLatency(modelName) {
  const latencies = {
    "gpt-4o-mini": [600, 900],
    "gpt-4o": [900, 1400],
    "claude-3-haiku": [800, 1200],
    "claude-3-sonnet": [1000, 1600],
    "gemini-flash": [500, 800],
    "gemini-pro": [800, 1200],
  };
  const range = latencies[modelName] || [700, 1000];
  return range[0] + Math.random() * (range[1] - range[0]);
}

function getBlockedMessage(guardrailLevel, threats) {
  const threatList = threats.join(", ").replace(/_/g, " ");

  switch (guardrailLevel) {
    case "permissive":
      return `[ADVISORY] Low-severity threat indicators detected (${threatList}). Request permitted under permissive policy.`;

    case "moderate":
      return `[POLICY VIOLATION] Request intercepted by Moderate guardrail.\n\nDetected Vector: ${threatList}\nAction: Execution terminated before model invocation.`;

    case "zero_trust":
      return `[ACCESS DENIED] Blocked by Zero-Trust Security Layer.\n\nClassification: ${threatList}\nStatus: Payload quarantined and logged.\nControl Flag: variant_b_guardrail = zero_trust`;

    default:
      return "Request terminated under active security policy.";
  }
}

/**
 * Generate an AI response (mocked) with guardrail enforcement
 * @param {string} prompt - The user's input prompt
 * @param {object} guardrailResult - Result from evaluateGuardrail()
 * @param {string} guardrailLevel - 'permissive' | 'moderate' | 'zero_trust'
 * @param {string} modelName - Name of AI model for latency simulation
 * @returns {Promise<{response: string, blocked: boolean, latency: number, model: string, threats: string[]}>}
 */
export async function generateResponse(prompt, guardrailResult, guardrailLevel, modelName = "gpt-4o-mini") {
  const startTime = performance.now();
  const simulatedLatency = getModelLatency(modelName);

  // Simulate realistic network + processing delay
  await new Promise((resolve) => setTimeout(resolve, simulatedLatency));

  const latency = Math.round(performance.now() - startTime);

  if (guardrailResult.blocked) {
    return {
      response: getBlockedMessage(guardrailLevel, guardrailResult.threats),
      blocked: true,
      latency,
      model: modelName,
      threats: guardrailResult.threats,
    };
  }

  // For permissive mode — if near-threats detected, add a warning prefix
  let response = pickSafeResponse(prompt);
  if (guardrailLevel === "permissive" && guardrailResult.threats.length > 0) {
    response = `[CAUTION: low-confidence threat signal logged]\n\n${response}`;
  }

  return {
    response,
    blocked: false,
    latency,
    model: modelName,
    threats: guardrailResult.threats,
  };
}
