## Agentic Email Desk

Autonomous inbox assistant that monitors Gmail, drafts AI replies, and safely auto-responds to routine messages. Built with Next.js App Router, serverless API routes, Gmail API, and OpenAI’s Responses API.

### Features
- Live inbox monitor with prioritisation heuristics (high/normal/low importance).
- One-click AI reply drafts with optional Gmail draft creation.
- Automated responder that evaluates safety & confidence before sending.
- Dry-run mode to file drafts without sending.
- Detailed automation summaries and activity log.

### Prerequisites
1. Google Cloud project with Gmail API enabled.
2. OAuth2 client (web application) with redirect URI:
   `https://developers.google.com/oauthplayground`
3. Generate a refresh token via OAuth Playground (scope:
   `https://www.googleapis.com/auth/gmail.modify`).
4. OpenAI API key with access to the configured model (default `gpt-4.1-mini`).

### Configuration
Create `.env.local` at the project root:
```bash
cp .env.local.example .env.local
```
Then fill in:
```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_REDIRECT_URI=https://developers.google.com/oauthplayground
GMAIL_USER_EMAIL=you@example.com
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
BASIC_REPLY_CONFIDENCE=0.7
```

### Development
Install dependencies and start the dev server:
```bash
npm install
npm run dev
```
Visit `http://localhost:3000`.

### Automation Notes
- Auto-responses only trigger for unread inbox messages.
- The LLM returns a confidence score; replies are sent when `confidence >= BASIC_REPLY_CONFIDENCE`.
- Dry-run creates drafts instead of sending emails, useful for auditing.

### Deployment
Deploy to Vercel with the required environment variables:
```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-email-agent
```
Remember to set the same environment variables in the Vercel project settings.
