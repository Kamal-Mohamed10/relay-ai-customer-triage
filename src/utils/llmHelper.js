import Groq from 'groq-sdk'

/**
 * LLM-assisted categorization with a strict response contract and a
 * deterministic fallback for ambiguous or offline cases.
 */
const apiKey = import.meta.env?.VITE_GROQ_API_KEY
const groq = apiKey
  ? new Groq({ apiKey, dangerouslyAllowBrowser: true })
  : null

const categories = [
  'Billing Issue',
  'Technical Problem',
  'General Inquiry',
  'Feature Request',
  'Unknown',
]

function detectCategory(message) {
  const text = message.toLowerCase()
  const billing = /\b(bill|billing|payment|charge|invoice|credit card|subscription|refund)\b/.test(text)
  const technical = /\b(bug|error|broken|not working|crash|server|database|dashboard|loading|access|technical|failed)\b/.test(text)

  // If two teams may need to act, route for human review instead of guessing.
  if (billing && technical) {
    return {
      category: 'Unknown',
      reasoning: 'This message includes both a billing concern and a technical access or reliability issue. Review it manually or ask which issue should be addressed first.',
    }
  }
  if (billing) return { category: 'Billing Issue', reasoning: 'The message mentions a payment, charge, invoice, subscription, or refund concern.' }
  if (technical) return { category: 'Technical Problem', reasoning: 'The message describes a product error, access issue, failure, or other technical problem.' }
  if (/\b(feature|add|improve|suggestion|would love|would be nice|enhancement)\b/.test(text)) {
    return { category: 'Feature Request', reasoning: 'The customer is asking for a product capability or improvement.' }
  }
  if (/\?|\b(how|what|when|where|can i|business hours)\b/.test(text)) {
    return { category: 'General Inquiry', reasoning: 'The customer is asking for information without describing a product failure.' }
  }
  return { category: 'Unknown', reasoning: 'The message does not contain enough detail for a reliable automatic category. Review it manually.' }
}

function readModelResponse(content, message) {
  try {
    const parsed = JSON.parse(content)
    if (categories.includes(parsed.category) && typeof parsed.reasoning === 'string') {
      return { category: parsed.category, reasoning: parsed.reasoning }
    }
  } catch {
    // Treat malformed output like any other model failure and use the fallback.
  }
  return detectCategory(message)
}

export async function categorizeMessage(message) {
  const text = message.trim()
  const hasBilling = /\b(bill|billing|payment|charge|invoice|credit card|subscription|refund)\b/i.test(text)
  const hasTechnical = /\b(bug|error|broken|not working|crash|server|database|dashboard|loading|access|technical|failed)\b/i.test(text)

  // Resolve known multi-domain ambiguity consistently before asking a model.
  if (hasBilling && hasTechnical) return detectCategory(text)
  if (!groq) return detectCategory(text)

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Classify customer support messages. Choose exactly one of: ' + categories.join(', ') + '. If the message is too vague, choose Unknown. Return only valid JSON with string fields "category" and "reasoning".',
        },
        { role: 'user', content: text },
      ],
      temperature: 0,
      response_format: { type: 'json_object' },
    })
    return readModelResponse(response.choices[0].message.content || '', text)
  } catch (error) {
    console.warn('Groq API failed, using deterministic categorization:', error.message)
    return detectCategory(text)
  }
}
