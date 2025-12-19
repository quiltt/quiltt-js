const { spawn } = require('node:child_process')

// Determine which test command to run based on CI environment and platform
const isCI = process.env.CI === 'true' || process.env.CI === '1'
const platform = process.env.PLATFORM || 'ios'

const testCommand = isCI ? `test:${platform}:run:ci` : `test:${platform}:run`

console.log(`Running ${testCommand}...`)

// Run the appropriate test command
const testProcess = spawn('pnpm', ['run', testCommand], {
  stdio: 'inherit',
  shell: true,
})

testProcess.on('exit', (code) => {
  process.exit(code)
})

testProcess.on('error', (error) => {
  console.error('Failed to start test process:', error)
  process.exit(1)
})
