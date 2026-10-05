import test from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_FREE_TEMPLATE_IDS, getTemplateConflictWarnings } from './subscriptionGates';
import { DEFAULT_PRICING_PLANS } from './usePricingSettings';
import { DEFAULT_ADMIN_PAID_MATRIX } from './adminPaidMatrix';


test('only two default packs are exposed: decouverte and premium', () => {
  const codes = DEFAULT_PRICING_PLANS.map((plan) => plan.code);
  assert.deepEqual(codes, ['decouverte', 'premium']);
});

test('only admin-created templates are free by default', () => {
  assert.equal(DEFAULT_FREE_TEMPLATE_IDS.length, 0);
});

test('template conflict detection warns when a free template uses a paid element', () => {
  const warnings = getTemplateConflictWarnings('sc-02-luxe-gold', ['sc-02-luxe-gold']);
  assert.ok(Array.isArray(warnings));
});

test('all built-in templates are paid by default', () => {
  const builtInPaid = DEFAULT_ADMIN_PAID_MATRIX.paidTemplates;
  assert.ok(builtInPaid.length > 0);
  assert.ok(builtInPaid.length >= 20);
  assert.ok(builtInPaid.includes('sc-02-luxe-gold'));
  assert.ok(builtInPaid.includes('tc-35-solar'));
});
