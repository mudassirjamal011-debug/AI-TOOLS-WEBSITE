import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

import { hashText, hashFile, HASH_ALGORITHMS, toHex } from '../lib/hash.ts';

test('hashText matches Node crypto for every supported algorithm', async () => {
  const samples = ['', 'hello world', 'héllo ✓ — 日本語', 'a'.repeat(1000)];

  for (const algorithm of HASH_ALGORITHMS) {
    const nodeName = algorithm.toLowerCase().replace('-', ''); // SHA-256 -> sha256
    for (const sample of samples) {
      const { hex, base64 } = await hashText(sample, algorithm);
      const expected = createHash(nodeName).update(sample, 'utf8').digest('hex');
      assert.equal(hex, expected, `${algorithm} mismatch for ${JSON.stringify(sample.slice(0, 12))}`);
      assert.equal(Buffer.from(base64, 'base64').toString('hex'), expected);
    }
  }
});

test('hashText applies the salt before hashing', async () => {
  const plain = await hashText('secret', 'SHA-256');
  const salted = await hashText('secret', 'SHA-256', 'pepper');
  const expected = createHash('sha256').update('peppersecret', 'utf8').digest('hex');
  assert.notEqual(plain.hex, salted.hex);
  assert.equal(salted.hex, expected);
});

test('hashFile produces the same digest as hashing the bytes directly', async () => {
  const payload = Buffer.from('ToolNova AI checksum test payload');
  const file = new File([payload], 'payload.bin', { type: 'application/octet-stream' });

  const progress = [];
  const results = await hashFile(file, ['SHA-1', 'SHA-256', 'SHA-512'], (percent) =>
    progress.push(percent)
  );

  assert.equal(results['SHA-256'].hex, createHash('sha256').update(payload).digest('hex'));
  assert.equal(results['SHA-1'].hex, createHash('sha1').update(payload).digest('hex'));
  assert.equal(results['SHA-512'].hex, createHash('sha512').update(payload).digest('hex'));
  assert.ok(progress.length >= 3, 'progress callbacks fire');
  assert.ok(progress[progress.length - 1] >= 99);
});

test('toHex formats bytes as lowercase hex', () => {
  assert.equal(toHex(new Uint8Array([0, 15, 255]).buffer), '000fff');
});
