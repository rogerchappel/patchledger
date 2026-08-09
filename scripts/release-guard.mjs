#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

export function versionFromTag(tag) {
  const match = /^v(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/.exec(tag);
  if (!match) throw new Error(`release tag must be v<semver>; received ${tag}`);
  return match[1];
}

export function assertTagMatchesPackage(tag, packageVersion) {
  const version = versionFromTag(tag);
  if (version !== packageVersion) {
    throw new Error(`tag ${tag} does not match package.json version ${packageVersion}`);
  }
  return version;
}

export function exactVersionPublished(requestedVersion, registryVersion) {
  return registryVersion === requestedVersion;
}

export function assertRegistryMetadata(expected, actual) {
  if (actual.version !== expected.version) {
    throw new Error(`registry returned version ${actual.version ?? '<missing>'}; expected ${expected.version}`);
  }
  if (!actual.integrity) throw new Error('registry metadata is missing dist.integrity');
  if (expected.integrity && actual.integrity !== expected.integrity) {
    throw new Error(`registry integrity ${actual.integrity} does not match packed artifact ${expected.integrity}`);
  }
}

async function main([command, ...args]) {
  if (command === 'validate-tag') {
    const manifest = JSON.parse(await readFile(args[1], 'utf8'));
    process.stdout.write(`${assertTagMatchesPackage(args[0], manifest.version)}\n`);
    return;
  }
  if (command === 'is-published') {
    process.stdout.write(`${exactVersionPublished(args[0], args[1])}\n`);
    return;
  }
  if (command === 'verify-registry') {
    const packed = JSON.parse(await readFile(args[1], 'utf8'))[0];
    const registry = JSON.parse(await readFile(args[2], 'utf8'));
    assertRegistryMetadata({ version: args[0], integrity: packed.integrity }, {
      version: registry.version,
      integrity: registry.dist?.integrity,
    });
    return;
  }
  throw new Error('usage: release-guard.mjs <validate-tag|is-published|verify-registry> ...');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
