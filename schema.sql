-- Relational schema for production deployment (PostgreSQL or SQLite-compatible with minor syntax changes).
CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TIMESTAMP NOT NULL);
CREATE TABLE sources (id TEXT PRIMARY KEY, name TEXT NOT NULL, url TEXT NOT NULL, source_type TEXT NOT NULL);
CREATE TABLE stories (id TEXT PRIMARY KEY, cluster_key TEXT NOT NULL, headline TEXT NOT NULL, source_id TEXT REFERENCES sources(id), published_at TIMESTAMP NOT NULL, category TEXT NOT NULL, region TEXT, summary TEXT NOT NULL, relevance_score INTEGER NOT NULL, product TEXT, audience TEXT, url TEXT NOT NULL);
CREATE TABLE story_facts (id TEXT PRIMARY KEY, story_id TEXT REFERENCES stories(id), fact TEXT NOT NULL);
CREATE TABLE content_ideas (id TEXT PRIMARY KEY, story_id TEXT REFERENCES stories(id), channel TEXT NOT NULL, title TEXT NOT NULL, ai_interpretation TEXT NOT NULL, altwealth_viewpoint TEXT NOT NULL, confidence_level TEXT NOT NULL, strength_score INTEGER NOT NULL, source_confidence_score INTEGER NOT NULL);
CREATE TABLE saved_items (id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), item_type TEXT NOT NULL, item_id TEXT NOT NULL, folder TEXT NOT NULL, notes TEXT, tags TEXT, saved_at TIMESTAMP NOT NULL);
CREATE TABLE daily_briefs (id TEXT PRIMARY KEY, scheduled_for TIMESTAMP NOT NULL, timezone TEXT NOT NULL, payload_json TEXT NOT NULL, email_status TEXT NOT NULL);
