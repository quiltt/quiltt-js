// Import styles, configure app
import '../app/globals.css'

// Make sure Next.js environment variables are available
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.process = { env: {} }
}
