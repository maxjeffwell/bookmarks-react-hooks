// Run with: npm test (node --test). No database needed: postgres() only
// connects on the first query.
import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.DATABASE_URL ??= 'postgres://test:test@localhost:5432/test';
const { default: sql } = await import('./sql.js');

test('undefined query parameters are sent as NULL (Neon-driver semantics, needed by the COALESCE partial updates)', () => {
  // postgres.js rejects undefined with UNDEFINED_VALUE unless transform.undefined is set.
  assert.equal(sql.options.transform.undefined, null);
});
