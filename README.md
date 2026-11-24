# Relay AI Customer Triage

Small-business support teams using Relay AI need a reliable first pass over growing customer inboxes. Manual triage delays answers and can bury outages or failed payments among routine questions, making it harder to protect customer trust and handle more volume with current staffing.

Relay AI Customer Triage turns an incoming message into a category, an urgency level, and a recommended next step. It prioritizes clear outage signals, routes mixed billing and technical reports for human review, and sends feature requests to the product team.

## What the app does

- Classifies messages as a billing issue, technical problem, general inquiry, feature request, or unknown.
- Scores urgency using repeatable signals from the message, independent of the time of day.
- Recommends a category-specific action and highlights high-urgency reports for prompt human review.
- Keeps a local history of analyzed messages and shows basic triage analytics.

## How it works

1. Paste a customer message into the Analyze screen.
2. The app asks Groq's Llama model for a category and short explanation using a constrained JSON response.
3. If the message contains both billing and technical signals, or the model is unavailable, a deterministic fallback routes it to a supported category or human review.
4. Rule-based urgency scoring and category-specific templates produce the next-step recommendation.
5. The result is saved in browser `localStorage` for the History and Dashboard screens.

## Run locally

Requirements: Node.js 16 or newer and npm.

```bash
git clone https://github.com/Kamal-Mohamed10/relay-ai-customer-triage.git
cd relay-ai-customer-triage
npm install
cp .env.example .env.local
```

Add a Groq API key to `.env.local`:

```text
VITE_GROQ_API_KEY=your-key
```

Start the development server:

```bash
npm run dev
```

## Example messages

- Database connection lost → technical problem, high urgency.
- Thank you so much! Your team has been incredibly helpful. → low urgency feedback.
- Could you add an export to CSV feature? → feature request routed to product review.
- My payment failed and now I can't access the dashboard. → human review for mixed billing and technical signals.

## Limitations and next steps

The urgency rules and fallback classifier are starting points and should be evaluated against a labeled set of real support messages. The demo stores history only in the current browser. The Groq key is used in a browser client for local development, so this setup should not be deployed to production; production use needs a server-side API and secure key storage.
