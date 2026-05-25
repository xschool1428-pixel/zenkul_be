import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parsePagination,
  buildPaginationMeta,
} from '../src/utils/pagination.js';

test('parsePagination defaults', () => {
  const { page, limit, skip } = parsePagination({});
  assert.equal(page, 1);
  assert.equal(limit, 20);
  assert.equal(skip, 0);
});

test('parsePagination respects max limit', () => {
  const { limit } = parsePagination({ limit: '500' }, { maxLimit: 100 });
  assert.equal(limit, 100);
});

test('buildPaginationMeta calculates pages', () => {
  const meta = buildPaginationMeta({ page: 2, limit: 10, total: 25 });
  assert.equal(meta.totalPages, 3);
});
