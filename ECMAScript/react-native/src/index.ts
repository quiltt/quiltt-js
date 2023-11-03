// Hermes doesn't have atob
// https://github.com/facebook/hermes/issues/1178
import 'core-js/stable/atob'
// React Native's URL implementation is incomplete
// https://github.com/facebook/react-native/issues/16434
import 'core-js/stable/url'
import QuilttConnector from './components/QuilttConnector'

export { QuilttConnector }
export default QuilttConnector
