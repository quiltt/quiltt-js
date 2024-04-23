import { spawn } from 'node:child_process'
import http from 'node:http'

function checkServerReady() {
  return new Promise((resolve, reject) => {
    const options = {
      host: 'localhost',
      port: 8081,
      timeout: 2000,
    }
    const request = http.get(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`)
      if (res.statusCode === 200) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
    request.on('error', (err) => {
      console.error('Error checking server status:', err)
      resolve(false)
    })
  })
}

const expoStart = spawn('expo', ['start', '--no-dev', '--max-workers', '1'], {
  env: { ...process.env, CI: '1' },
})

expoStart.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`)
  if (data.toString().includes('Waiting on http://localhost:8081')) {
    console.log('Detected server start, beginning readiness checks...')
    const checkInterval = setInterval(async () => {
      const isReady = await checkServerReady()
      if (isReady) {
        console.log('Server is ready. Exiting...')
        clearInterval(checkInterval)
        expoStart.kill('SIGTERM')
        process.exit(0)
      }
    }, 5000) // Check every 5 seconds
  }
})

expoStart.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`)
})

expoStart.on('close', (code) => {
  console.log(`child process exited with code ${code}`)
  process.exit(code)
})
