const { spawn } = require('node:child_process')
const http = require('node:http')

// Configuration object to keep all settings in one place
const CONFIG = {
  server: {
    host: 'localhost',
    port: 8081,
    timeout: 2000,
  },
  retry: {
    maxAttempts: 20,
    interval: 5000, // 5 seconds
    bufferTime: 5000, // 5 seconds extra buffer
  },
  expo: {
    command: 'expo',
    args: ['start', '--no-dev', '--max-workers', '1'],
    env: { ...process.env, CI: '1' },
  },
}

// Separate server check logic
const checkServerReady = () => {
  return new Promise((resolve) => {
    const request = http.get(CONFIG.server, (res) => {
      console.log(`STATUS: ${res.statusCode}`)
      resolve({
        isReady: res.statusCode === 200,
        statusCode: res.statusCode,
      })
    })

    request.on('error', (error) => {
      console.error('Error checking server status:', error)
      resolve({ isReady: false, error })
    })

    request.on('timeout', () => {
      request.destroy()
      resolve({ isReady: false, error: new Error('Request timeout') })
    })
  })
}

// Separate process management
class ExpoServer {
  constructor() {
    this.process = spawn(CONFIG.expo.command, CONFIG.expo.args, { env: CONFIG.expo.env })
    this.checkInterval = null
    this.totalTimeout = null
    this.retryCount = 0

    this.setupProcessHandlers()
  }

  setupProcessHandlers() {
    this.process.stdout.on('data', this.handleStdout.bind(this))
    this.process.stderr.on('data', this.handleStderr.bind(this))
    this.process.on('close', this.handleClose.bind(this))

    // Process termination handlers
    process.on('SIGTERM', () => this.cleanup('SIGTERM'))
    process.on('SIGINT', () => this.cleanup('SIGINT'))
  }

  handleStdout(data) {
    const output = data.toString()
    console.log(`stdout: ${output}`)

    if (output.includes('Waiting on http://localhost:8081')) {
      console.log('Detected server start, beginning readiness checks...')
      this.startHealthChecks()
    }
  }

  handleStderr(data) {
    console.error(`stderr: ${data}`)
  }

  handleClose(code) {
    console.log(`Child process exited with code ${code}`)
    this.cleanup('CLOSE', code)
  }

  startHealthChecks() {
    // Set total timeout
    const totalTimeoutMs =
      CONFIG.retry.maxAttempts * CONFIG.retry.interval + CONFIG.retry.bufferTime
    this.totalTimeout = setTimeout(() => {
      console.error('Total timeout reached. Forcing exit...')
      this.cleanup('TIMEOUT', 1)
    }, totalTimeoutMs)

    // Start check interval
    this.checkInterval = setInterval(this.checkServerHealth.bind(this), CONFIG.retry.interval)
  }

  async checkServerHealth() {
    this.retryCount++
    console.log(`Attempt ${this.retryCount} of ${CONFIG.retry.maxAttempts}...`)

    const status = await checkServerReady()

    if (status.isReady) {
      console.log('Server is ready. Exiting...')
      this.cleanup('SUCCESS', 0)
    } else if (this.retryCount >= CONFIG.retry.maxAttempts) {
      console.error(
        `Server failed to respond after ${CONFIG.retry.maxAttempts} attempts`,
        status.error || status.statusCode
      )
      this.cleanup('MAX_RETRIES', 1)
    }
  }

  cleanup(reason, exitCode = 0) {
    console.log(`Cleaning up due to ${reason}...`)

    if (this.checkInterval) clearInterval(this.checkInterval)
    if (this.totalTimeout) clearTimeout(this.totalTimeout)

    try {
      this.process.kill('SIGTERM')
    } catch (error) {
      console.error('Error while killing process:', error)
    }

    process.exit(exitCode)
  }
}

// Start the server
new ExpoServer()
