/**
 * Estimate urgency from the message itself. The score is deliberately
 * independent of the user's local time, so the same message gets the same
 * result whenever it is analyzed.
 */
export function calculateUrgency(message = '') {
  const text = message.trim().toLowerCase()
  if (!text) return 'Low'

  const criticalPatterns = [
    /\b(outage|production down|server down|database (?:is )?down|connection lost)\b/,
    /\b(can't|cannot|unable to) (?:access|log in|process|receive|send)\b/,
    /\b(all|every) (?:users?|customers?|accounts?)\b.*\b(affected|blocked|unable)\b/,
    /\b(security breach|data leak|data loss)\b/,
  ]
  if (criticalPatterns.some((pattern) => pattern.test(text))) return 'High'

  const positivePatterns = [
    /\b(thank you|thanks|appreciate|happy|love|great|excellent|wonderful)\b/,
    /\b(feature request|would love|would be nice|suggestion)\b/,
  ]
  const hasPositiveSignal = positivePatterns.some((pattern) => pattern.test(text))
  const hasProblemSignal = /\b(error|broken|bug|failed|failure|issue|problem|not working|can't|cannot|unable|urgent|asap|deadline)\b/.test(text)
  if (hasPositiveSignal && !hasProblemSignal) return 'Low'

  let score = 0
  if (/\b(urgent|asap|immediately|right away|critical|emergency)\b/.test(text)) score += 3
  if (/\b(error|broken|bug|failed|failure|issue|problem|not working|can't|cannot|unable)\b/.test(text)) score += 2
  if (/\b(payment|billing|charge|refund|subscription)\b/.test(text)) score += 1
  if (/\b(thank you|thanks|appreciate|happy|love|great|excellent|wonderful)\b/.test(text)) score -= 2
  if (/\b(feature request|would love|would be nice|suggestion)\b/.test(text)) score -= 1

  if (score >= 4) return 'High'
  if (score <= 0) return 'Low'
  return 'Medium'
}
