# Priyanshi's Strategy Desk

Focused internal AltWealth web app for the workflow: **Discover News → Understand Brief → Generate Content Idea → Generate Draft → Save → Publish Manually**.

## Run

```bash
npm start
```

Open http://localhost:3000. The demo secure login accepts any non-empty email and password; production should replace this with password hashing, sessions and SSO.

## Included capabilities

- Three tabs only: News, Content Ideas and Saved.
- Responsive premium financial-services UI.
- Backend API built with Node.js.
- JSON demo datastore plus `schema.sql` relational production schema.
- News/search/filter endpoints, manual save endpoint, daily brief endpoint and AI-style draft generation using realistic AltWealth sample data.
- Duplicate-story model via `cluster_key` on stories.
- Source tracking, facts-used fields, confidence levels and AltWealth viewpoints.

## APIs and keys to add

Set these environment variables in production:

- `NEWS_API_KEY` for NewsAPI or a licensed market/news provider.
- `OPENAI_API_KEY` for AI summaries and content generation.
- `EMAIL_SMTP_HOST`, `EMAIL_SMTP_USER`, `EMAIL_SMTP_PASS` for email brief delivery.
- `DAILY_BRIEF_TO_EMAIL` for brief recipients.
- `SESSION_SECRET` for secure login sessions.

RSS feeds can be added without keys for RBI, SEBI, exchange, publisher and bond-market feeds where licensing permits ingestion.
