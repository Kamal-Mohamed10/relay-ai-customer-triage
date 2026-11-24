/**
 * Category-specific next steps for the support team.
 */
const actionTemplates = {
  'Billing Issue': 'Review the customer’s invoice and payment status, then explain any charge or failed payment clearly.',
  'Technical Problem': 'Reproduce the issue, capture the affected workflow and error details, and route it to technical support.',
  'General Inquiry': 'Answer the question directly and include the most relevant help center article.',
  'Feature Request': 'Record the customer’s use case and desired outcome, then share it with the product team for roadmap review.',
  Unknown: 'Review the message manually and ask a clarifying question before routing it.',
}

/** Get the recommended next step for a category and urgency level. */
export function getRecommendedAction(category, urgency = 'Low') {
  const action = actionTemplates[category] || actionTemplates.Unknown
  if (urgency === 'High') {
    return 'Prioritize this message for prompt human review. ' + action
  }
  return action
}

/** Get the supported categories. */
export function getAvailableCategories() {
  return Object.keys(actionTemplates)
}

/** Escalate urgent messages and reports with broader customer impact. */
export function shouldEscalate(category, urgency, message = '') {
  return urgency === 'High' || /\b(all|every) (?:users?|customers?|accounts?)\b/i.test(message)
}
