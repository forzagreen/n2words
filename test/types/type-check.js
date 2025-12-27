#!/usr/bin/env node

/**
 * TypeScript type checking wrapper
 * Runs tsc and filters output to only show errors in lib/n2words.js
 */

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// Run TypeScript compiler (cross-platform compatible)
const isWindows = process.platform === 'win32'
const tsc = spawn(isWindows ? 'cmd' : 'npx',
  isWindows
    ? ['/c', 'npx', 'tsc', '--noEmit', '--project', 'test/types/tsconfig.json']
    : ['tsc', '--noEmit', '--project', 'test/types/tsconfig.json'],
  {
    cwd: projectRoot
  }
)

let output = ''
let hasErrors = false

tsc.stdout.on('data', (data) => {
  output += data.toString()
})

tsc.stderr.on('data', (data) => {
  output += data.toString()
})

tsc.on('close', (code) => {
  if (code === 0) {
    console.log('✓ Type checking passed')
    process.exit(0)
  }

  // Split output into lines and filter for lib/n2words.js errors only
  const lines = output.split('\n')
  const n2wordsErrors = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // Match lines that start with lib/n2words.js (use platform-agnostic path separator)
    if (line.match(/lib[/\\]n2words\.js\(/)) {
      n2wordsErrors.push(line)
      hasErrors = true
    }
  }

  if (hasErrors) {
    console.error('✗ Type errors found in lib/n2words.js:\n')
    n2wordsErrors.forEach(error => console.error(error))
    process.exit(1)
  } else {
    console.log('✓ No type errors in lib/n2words.js')
    console.log('  (Other files have errors but are excluded from this check)')
    process.exit(0)
  }
})
