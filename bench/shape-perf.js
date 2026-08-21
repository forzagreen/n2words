/**
 * Conversion speed across three shapes: main, PR #428, and this branch.
 *
 * Byte size is only half the question — this shape moves work from build time
 * to run time. Regional behaviour that main hardcodes (the "and" flag) is a
 * live parameter here, and currency resolution now goes through resolveOptions
 * plus a guard. Both are branches a constant-folded build doesn't execute, so
 * they should be measured rather than assumed harmless.
 *
 *   node bench/shape-perf.js
 *
 * Uses the same tinybench settings as bench/index.js so numbers are comparable
 * to the per-language benchmarks already in the repo.
 */

import { Bench } from 'tinybench'
import { execSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const PR_REF = 'origin/feat/currency-matrix-bare-tags'

// Matches bench/index.js's default (non --full) profile.
const benchOptions = { time: 500, iterations: 10 }

// Values chosen to exercise different code paths: a small segment, a
// scale-word path, and a large multi-segment number.
const CARDINAL_VALUES = [42, 1234, 123456789]
const CURRENCY_VALUES = [42.5, 1234.99]

const tmp = mkdtempSync(join(tmpdir(), 'n2words-perf-'))
const worktrees = []

/**
 * @param {string} ref - Git ref to check out
 * @param {string} name - Directory name
 * @returns {string} Absolute worktree path
 */
function worktree(ref, name) {
  const path = join(tmp, name)
  execSync(`git worktree add -q --detach ${JSON.stringify(path)} ${ref}`, { stdio: 'pipe' })
  worktrees.push(path)
  return path
}

/**
 * Runs one task and returns ops/sec.
 * @param {string} name - Task label
 * @param {() => void} fn - Work to measure
 * @returns {Promise<number>} Operations per second
 */
async function measure(name, fn) {
  const bench = new Bench(benchOptions)
  bench.add(name, fn)
  await bench.run()
  return bench.tasks[0].result?.throughput?.mean ?? 0
}

/**
 * @param {number} value - Ops/sec
 * @returns {string} Human-readable throughput
 */
const fmt = value => (value >= 1e6 ? `${(value / 1e6).toFixed(2)}M` : `${(value / 1e3).toFixed(0)}K`)

/**
 * @param {number} ours - Our ops/sec
 * @param {number} base - Baseline ops/sec
 * @returns {string} Signed percentage difference
 */
const delta = (ours, base) => `${ours >= base ? '+' : ''}${((ours / base - 1) * 100).toFixed(1)}%`

try {
  const main = worktree('origin/main', 'main')
  const pr = worktree(PR_REF, 'pr428')

  // main and #428 both expose one module per locale; the branch splits by form.
  const mainMod = await import(join(main, 'src/en-US.js'))
  const prMod = await import(join(pr, 'src/en-US.js'))
  const ourCard = await import(resolve('src/en-US/toCardinal.js'))
  const ourCur = await import(resolve('src/en-US/toCurrency.js'))
  const ourOrd = await import(resolve('src/en-US/toOrdinal.js'))

  console.log('\nConversion speed — en-US defaults, ops/sec')
  console.log('(same tinybench settings as bench/index.js)\n')

  console.log('  toCardinal')
  for (const v of CARDINAL_VALUES) {
    const m = await measure('main', () => mainMod.toCardinal(v))
    const p = await measure('pr', () => prMod.toCardinal(v))
    const o = await measure('ours', () => ourCard.toCardinal(v))
    console.log(`    ${String(v).padEnd(11)} main ${fmt(m).padStart(7)}   #428 ${fmt(p).padStart(7)}`
      + `   branch ${fmt(o).padStart(7)}  ${delta(o, m).padStart(7)} vs main`)
  }

  console.log('\n  toOrdinal')
  for (const v of CARDINAL_VALUES) {
    const m = await measure('main', () => mainMod.toOrdinal(v))
    const p = await measure('pr', () => prMod.toOrdinal(v))
    const o = await measure('ours', () => ourOrd.toOrdinal(v))
    console.log(`    ${String(v).padEnd(11)} main ${fmt(m).padStart(7)}   #428 ${fmt(p).padStart(7)}`
      + `   branch ${fmt(o).padStart(7)}  ${delta(o, m).padStart(7)} vs main`)
  }

  console.log('\n  toCurrency (default currency)')
  for (const v of CURRENCY_VALUES) {
    const m = await measure('main', () => mainMod.toCurrency(v))
    const p = await measure('pr', () => prMod.toCurrency(v))
    const o = await measure('ours', () => ourCur.toCurrency(v))
    console.log(`    ${String(v).padEnd(11)} main ${fmt(m).padStart(7)}   #428 ${fmt(p).padStart(7)}`
      + `   branch ${fmt(o).padStart(7)}  ${delta(o, m).padStart(7)} vs main`)
  }

  // en-GB is the case that decides whether sharing an implementation costs
  // speed. It keeps its own file with the "and" baked in rather than passing
  // it as an option, so there is no options object to resolve per call — the
  // flag reaches the shared builder as a literal and folds away.
  const mainGB = await import(join(main, 'src/en-GB.js'))
  const prGB = await import(join(pr, 'src/en-GB.js'))
  const ourGB = await import(resolve('src/en-GB/toCardinal.js'))
  console.log('\n  en-GB cardinals — baked-in "and", no options on this path')
  for (const v of CARDINAL_VALUES) {
    const m = await measure('main', () => mainGB.toCardinal(v))
    const p = await measure('pr', () => prGB.toCardinal(v))
    const o = await measure('ours', () => ourGB.toCardinal(v))
    console.log(`    ${String(v).padEnd(11)} main ${fmt(m).padStart(7)}   #428 ${fmt(p).padStart(7)}`
      + `   branch ${fmt(o).padStart(7)}  ${delta(o, m).padStart(7)} vs main`)
  }
  console.log()
}
finally {
  for (const path of worktrees) {
    try {
      execSync(`git worktree remove --force ${JSON.stringify(path)}`, { stdio: 'pipe' })
    }
    catch { /* already gone */ }
  }
  rmSync(tmp, { recursive: true, force: true })
}
