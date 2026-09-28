// Run System tests against a candidate Store version without moving the live pin.
//
//   node test/candidate/run-with-candidate-store.mjs --store-root <clean Store checkout> -- <test files...>
//
// The candidate is the Store checkout's own HEAD. This copies apps/stb to a temporary directory, rewrites
// only that copy's STORE_PIN (shared/contracts.mjs) and storePin (public-build/stb-store-runtime.json) to the
// candidate, and runs the named test files there with STB_STORE_ZERO_ROOT set. The repository's live pin
// files are never written. Moving the live pin is a separate, owner-approved change.
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = fileURLToPath(new URL('../../', import.meta.url));
const args = process.argv.slice(2);
const split = args.indexOf('--');
const opts = split === -1 ? args : args.slice(0, split);
const files = split === -1 ? [] : args.slice(split + 1);
const rootIndex = opts.indexOf('--store-root');
const storeRoot = rootIndex === -1 ? null : path.resolve(opts[rootIndex + 1]);
if (!storeRoot || !files.length) {
  console.error('usage: run-with-candidate-store.mjs --store-root <clean Store checkout> -- <test files...>');
  process.exit(2);
}

const candidate = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: storeRoot, encoding: 'utf8' }).trim();
if (!/^[0-9a-f]{40}$/.test(candidate)) throw new Error('candidate Store HEAD is not a full commit SHA');
const dirty = execFileSync('git', ['status', '--porcelain'], { cwd: storeRoot, encoding: 'utf8' }).trim();
if (dirty) throw new Error('candidate Store checkout is dirty');

const contractsPath = path.join(APP, 'shared', 'contracts.mjs');
const livePin = /export const STORE_PIN = '([0-9a-f]{40})';/.exec(fs.readFileSync(contractsPath, 'utf8'))?.[1];
if (!livePin) throw new Error('could not read the live STORE_PIN');

const work = fs.mkdtempSync(path.join(os.tmpdir(), 'stb-candidate-'));
const copy = path.join(work, 'stb');
fs.cpSync(APP, copy, {
  recursive: true,
  filter: (src) => !src.includes(`${path.sep}node_modules`) && !src.includes(`${path.sep}test-results`),
});
fs.symlinkSync(path.join(APP, 'node_modules'), path.join(copy, 'node_modules'), 'dir');

const copyContracts = path.join(copy, 'shared', 'contracts.mjs');
const contracts = fs.readFileSync(copyContracts, 'utf8');
fs.writeFileSync(copyContracts, contracts.replace(`export const STORE_PIN = '${livePin}';`, `export const STORE_PIN = '${candidate}';`));
const runtimePath = path.join(copy, 'public-build', 'stb-store-runtime.json');
const runtime = JSON.parse(fs.readFileSync(runtimePath, 'utf8'));
runtime.storePin = candidate;
fs.writeFileSync(runtimePath, JSON.stringify(runtime, null, 2) + '\n');

console.log(`Live pin (unchanged in the repository): ${livePin}`);
console.log(`Candidate Store under test:             ${candidate}`);
const result = spawnSync(process.execPath, ['--test', '--test-concurrency=1', ...files], {
  cwd: copy,
  stdio: 'inherit',
  env: { ...process.env, STB_STORE_ZERO_ROOT: storeRoot },
});
fs.rmSync(work, { recursive: true, force: true });
process.exit(result.status ?? 1);
