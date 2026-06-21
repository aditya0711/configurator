import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('app exposes the required three tabs and workflow only', async () => {
  const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  assert.match(html, /News/);
  assert.match(html, /Content Ideas/);
  assert.match(html, /Saved/);
  assert.match(html, /Discover News → Understand Brief → Generate Content Idea → Generate Draft → Save → Publish Manually/);
});

test('production schema contains source tracking and saved folders primitives', async () => {
  const schema = await readFile(new URL('../schema.sql', import.meta.url), 'utf8');
  assert.match(schema, /CREATE TABLE stories/);
  assert.match(schema, /cluster_key/);
  assert.match(schema, /CREATE TABLE saved_items/);
  assert.match(schema, /CREATE TABLE daily_briefs/);
});
