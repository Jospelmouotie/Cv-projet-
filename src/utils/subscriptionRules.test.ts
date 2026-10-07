import test from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_FREE_TEMPLATE_IDS, getTemplateConflictWarnings } from './subscriptionGates';
import { DEFAULT_PRICING_PLANS } from './usePricingSettings';
import { DEFAULT_ADMIN_PAID_MATRIX, getFreeStudioMenuIds, isStudioMenuPaidByAdmin } from './adminPaidMatrix';
import { detectPaidFeaturesInCV } from './paidUsageDetector';


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

test('exactly five studio menus remain free by default and the rest are paid', () => {
  const freeIds = getFreeStudioMenuIds();

  assert.deepEqual(freeIds, ['template', 'timeline', 'sectionHeaders', 'footer', 'footerContact']);
  assert.equal(isStudioMenuPaidByAdmin('template'), false);
  assert.equal(isStudioMenuPaidByAdmin('timeline'), false);
  assert.equal(isStudioMenuPaidByAdmin('sectionHeaders'), false);
  assert.equal(isStudioMenuPaidByAdmin('footer'), false);
  assert.equal(isStudioMenuPaidByAdmin('footerContact'), false);

  assert.equal(isStudioMenuPaidByAdmin('sidebar'), true);
  assert.equal(isStudioMenuPaidByAdmin('header'), true);
  assert.equal(isStudioMenuPaidByAdmin('typography'), true);
  assert.equal(isStudioMenuPaidByAdmin('titlesCase'), true);
  assert.equal(isStudioMenuPaidByAdmin('background'), true);
  assert.equal(isStudioMenuPaidByAdmin('photo'), true);
  assert.equal(isStudioMenuPaidByAdmin('contactBadges'), true);
  assert.equal(isStudioMenuPaidByAdmin('bullets'), true);
  assert.equal(isStudioMenuPaidByAdmin('shadows'), true);
  assert.equal(isStudioMenuPaidByAdmin('pageCalibration'), true);
  assert.equal(isStudioMenuPaidByAdmin('experiences'), true);
  assert.equal(isStudioMenuPaidByAdmin('formations'), true);
  assert.equal(isStudioMenuPaidByAdmin('skills'), true);
  assert.equal(isStudioMenuPaidByAdmin('individualSection'), true);
});

test('export blocker catches premium studio customizations for titlesCase and pageCalibration', () => {
  const cv = {
    id: 'cv-test',
    utilisateurId: 'u-1',
    titre: 'CV Test',
    templateId: 'classic-1',
    langue: 'fr',
    couleurAccent: '#111827',
    police: 'Inter',
    nombreColonnes: 2,
    statutPaiement: 'NON_PAYE',
    sections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    casseTitresSection: 'capitalize',
    alignementTitreSection: 'center',
    margeGlobalePage: 24,
    statutPaiement: 'NON_PAYE'
  } as any;

  const usages = detectPaidFeaturesInCV(cv, 'freemium');
  const menuIds = usages.map((usage) => usage.id);

  assert.ok(menuIds.includes('titles_case_paid') || menuIds.includes('page_calibration_paid'));
});
