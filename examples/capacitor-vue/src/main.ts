import { createApp } from 'vue'

import { QuilttPlugin } from '@quiltt/capacitor/vue'

import App from './App.vue'
import './styles.css'

const token = import.meta.env.VITE_QUILTT_AUTH_TOKEN ?? 'test-auth-token'

createApp(App).use(QuilttPlugin, { token }).mount('#app')
