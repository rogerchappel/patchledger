import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertRegistryMetadata,
  assertTagMatchesPackage,
  exactVersionPublished,
  versionFromTag,
} from './release-guard.mjs';

test('parses a release tag and rejects malformed tags', () => {
  assert.equal(versionFromTag('v1.2.3'), '1.2.3');
  assert.equal(versionFromTag('v1.2.3-rc.1'), '1.2.3-rc.1');
  assert.throws(() => versionFromTag('1.2.3'), /must be v<semver>/);
  assert.throws(() => versionFromTag('v1.2'), /must be v<semver>/);
});

test('requires the tag to exactly match package.json', () => {
  assert.equal(assertTagMatchesPackage('v1.2.3', '1.2.3'), '1.2.3');
  assert.throws(() => assertTagMatchesPackage('v1.2.4', '1.2.3'), /does not match/);
});

test('only reports the requested exact version as published', () => {
  assert.equal(exactVersionPublished('1.2.3', '1.2.3'), true);
  assert.equal(exactVersionPublished('1.2.3', '1.2.4'), false);
  assert.equal(exactVersionPublished('1.2.3', undefined), false);
});

test('verifies registry version and artifact integrity', () => {
  const expected = { version: '1.2.3', integrity: 'sha512-example' };
  assert.doesNotThrow(() => assertRegistryMetadata(expected, expected));
  assert.throws(() => assertRegistryMetadata(expected, { ...expected, version: '1.2.4' }), /expected 1.2.3/);
  assert.throws(() => assertRegistryMetadata(expected, { ...expected, integrity: undefined }), /missing/);
  assert.throws(() => assertRegistryMetadata(expected, { ...expected, integrity: 'sha512-other' }), /does not match/);
});
