// SentriFlag — Mock AI Engine
// Simulates AI agent responses controlled by Flagsmith guardrail levels

const SAFE_RESPONSES = [
  "Sure! Here's a helpful summary of that topic. The key points to consider are clarity, structure, and actionable insights.",
  "Great question. Based on best practices, the recommended approach involves breaking the problem into smaller components and addressing each systematically.",
  "I can help with that. The most effective strategy here is to first define your goals, then map out the steps, and iterate based on feedback.",
  "Absolutely. This is a well-studied area. The consensus approach involves a combination of documentation, testing, and continuous monitoring.",
  "Here's what I found on that: the standard pattern is to validate inputs, process with a defined pipeline, and return structured output.",
  "That's a solid use case. The recommended implementation follows a three-layer architecture: input validation, processing logic, and output formatting.",
];

const KEYWORD_RESPONSES = {
  code: "Here's a code snippet to get you started:\n```\nfunction process(input) {\n  return input.trim().toLowerCase();\n}\n```\nThis handles basic input normalization.",
  api: "To interact with an API: use fetch() with proper headers, handle errors with try/catch, and always validate the response schema.",
  deploy: "Deployment best practices: containerize with Docker, use CI/CD pipelines, enable health checks, and always have a rollback strategy.",
  security: "Security fundamentals: validate all inputs, use HTTPS, implement rate limiting, rotate credentials regularly, and audit logs.",
  database: "For database operations: use parameterized queries to prevent injection, implement connection pooling, and always have backup strategies.",
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
      return `⚠️ Proceeding with caution — potential concerns detected (${threatList}). Response may be incomplete for safety.`;

    case "moderate":
      return `🛡️ Request flagged by guardrail policy.\n\nDetected threat vector: **${threatList}**\n\nThis request was blocked by the Moderate security policy. Modify your prompt and retry.`;

    case "zero_trust":
      return `🔴 BLOCKED — Zero-Trust Security Layer\n\nThreat Classification: ${threatList}\n\nAll requests matching threat patterns are automatically rejected under Zero-Trust policy. This incident has been logged.\n\n[Flagsmith flag: variant_b_guardrail = zero_trust]`;

    default:
      return "Request could not be processed due to security policy.";
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
    response = `⚠️ [Caution: low-confidence signals detected]\n\n${response}`;
  }

  return {
    response,
    blocked: false,
    latency,
    model: modelName,
    threats: guardrailResult.threats,
  };
}
