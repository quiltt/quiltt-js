// Hermes doesn't have atob
// https://github.com/facebook/hermes/issues/1178
import { decode } from 'base-64'
if (!global.atob) {
  global.atob = decode
}
import QuilttConnector from './components/QuilttConnector'

export { QuilttConnector }
export default QuilttConnector
