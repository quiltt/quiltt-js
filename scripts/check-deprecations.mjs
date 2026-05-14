#!/usr/bin/env node

/**
 * check-deprecations.mjs
 *
 * Scans .changeset/*.md files for major version bumps. If any are found,
 * scans the source tree for leftover @deprecated tags and deprecation
 * console warnings, then reports them and exits non-zero.
 *
 * Usage:
 *   node scripts/check-deprecations.mjs
 */

import { createReadStream } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CHANGESET_DIR = join(ROOT, '.changeset')
const PACKAGES_DIR = join(ROOT, 'packages')

// ---------------------------------------------------------------------------
// Changeset parsing
// ---------------------------------------------------------------------------

/**
 * Parse the YAML frontmatter from a changeset .md file.
 * Returns an array of package bump entries: [{ package: string, bump: string }]
 */
async function parseChangesetFile(filePath) {
  const content = await readFile(filePath, 'utf-8')
  const lines = content.split('\n')

  // Changeset frontmatter is between the first pair of --- markers
  if (lines[0]?.trim() !== '---') return []

  const frontmatterLines = []
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') break
    frontmatterLines.push(lines[i])
  }

  const entries = []
  for (const line of frontmatterLines) {
    // Format: "@quiltt/core": major   OR   "@quiltt/core": "major"
    const match = line.match(/^"(@quiltt\/[^"]+)":\s*"?(\w+)"?/)
    if (match) {
      entries.push({ package: match[1], bump: match[2] })
    }
  }

  return entries
}

/**
 * Return true if any changeset in .changeset/ declares a major bump.
 */
async function hasMajorBump() {
  let files
  try {
    files = await readdir(CHANGESET_DIR)
  } catch {
    return false
  }

  const changesetFiles = files.filter((f) => f.endsWith('.md') && f !== 'README.md')

  for (const file of changesetFiles) {
    const entries = await parseChangesetFile(join(CHANGESET_DIR, file))
    if (entries.some((e) => e.bump === 'major')) {
      return true
    }
  }

  return false
}

// ---------------------------------------------------------------------------
// Source scanning
// ---------------------------------------------------------------------------

/**
 * Check if a line is inside a JSDoc block comment (/** ... *​/)
 * Very simple state-machine: track whether we're inside /**, end at *​/
 */
function isInsideJSDocBlock(lines, lineIndex) {
  let inBlock = false
  for (let i = 0; i <= lineIndex; i++) {
    const trimmed = lines[i].trim()
    if (inBlock) {
      if (trimmed.endsWith('*/')) inBlock = false
    } else if (trimmed.startsWith('/**') && !trimmed.startsWith('/**/')) {
      inBlock = true
    }
  }
  return inBlock || lines[lineIndex].trim().startsWith('/**')
}

/**
 * Scan a single file for deprecation indicators.
 * Returns an array of findings: [{ line, content }]
 */
async function scanSourceFile(filePath) {
  const findings = []

  const rl = createInterface({
    input: createReadStream(filePath),
    crlfDelay: Infinity,
  })

  const lines = []
  for await (const line of rl) {
    lines.push(line)
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    const trimmed = rawLine.trim()
    const lineNum = i + 1

    // 1) @deprecated inside a JSDoc comment
    if (trimmed.includes('@deprecated') && isInsideJSDocBlock(lines, i)) {
      findings.push({ line: lineNum, content: rawLine, type: 'jsdoc' })
      continue
    }

    // 2) console.warn with deprecation wording
    const lower = trimmed.toLowerCase()
    if (
      lower.includes('console.warn(') &&
      (lower.includes('deprecated') || lower.includes('deprecation'))
    ) {
      findings.push({ line: lineNum, content: rawLine, type: 'console-warn' })
    }
  }

  return findings
}

/**
 * Walk packages/ directories. Uses simple recursive descent,
 * skipping build artifact directories.
 */
async function* walkSourceFiles(dir) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      // Skip node_modules, dist, .next, etc.
      if (['node_modules', 'dist', '.next', 'coverage', '__snapshots__'].includes(entry.name)) {
        continue
      }
      yield* walkSourceFiles(fullPath)
    } else if (/\.(ts|tsx|vue)$/.test(entry.name)) {
      yield fullPath
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(':: Check: Scanning .changeset/ for major version bumps...')
  const major = await hasMajorBump()

  if (!major) {
    console.log(':: No major bumps detected. Skipping deprecation audit.')
    process.exit(0)
  }

  console.log(':: Major bump detected! Auditing for leftover deprecations...\n')

  const allFindings = []

  for await (const filePath of walkSourceFiles(PACKAGES_DIR)) {
    const relativePath = filePath.replace(ROOT, '').replace(/^\//, '')
    const findings = await scanSourceFile(filePath)
    for (const f of findings) {
      allFindings.push({ file: relativePath, ...f })
    }
  }

  if (allFindings.length === 0) {
    console.log(':: No leftover deprecations found. Clean major bump!')
    process.exit(0)
  }

  // Report findings
  console.log(
    `:: Found ${allFindings.length} deprecation(s) that must be resolved before a major release:\n`
  )

  for (const { file, line, content, type } of allFindings) {
    const tag = type === 'jsdoc' ? '@deprecated' : 'console.warn'
    console.log(`  ${file}:${line}  [${tag}]`)
    console.log(`    ${content.trim()}`)
    console.log()
  }

  console.log(':: Remove all deprecated code before cutting a major version.')
  console.log(
    ':: If a deprecation must remain, remove it from this major changeset and defer to a future major.'
  )

  process.exit(1)
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
