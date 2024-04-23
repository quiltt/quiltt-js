import fs from 'node:fs'
import path from 'node:path'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const content = `export const ErrorReporterConfig = {
  honeybadger_api_key: '${process.env.HONEYBADGER_API_KEY_REACT_NATIVE_SDK}',
}
`

const filePath = path.join(__dirname, '..', 'src', 'utils', 'error', 'ErrorReporterConfig.ts')

console.log('Writing file:', filePath)

fs.writeFile(filePath, content, (err) => {
  if (err) {
    console.error('Error writing file:', err)
  } else {
    console.log('File written successfully', filePath)
  }
})
