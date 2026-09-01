import assert from 'node:assert/strict';
import test from 'node:test';
import Hero from '../src/models/Hero.js';
import Project from '../src/models/Project.js';

test('models enforce Phase 1 required fields', () => {
  assert.ok(new Hero({ name: 'Adnan', role: 'Developer', intro: 'Builds things.' }).validateSync() === undefined);
  assert.ok(new Project({ title: 'Portfolio' }).validateSync()?.errors.description);
});
