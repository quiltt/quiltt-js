// Import styles, configure app
import '../src/app/globals.css'

// Make sure Next.js environment variables are available
if (typeof window !== 'undefined') {
  // @ts-expect-error
  window.process = { env: {} }
}
