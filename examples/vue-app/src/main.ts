import { createApp } from 'vue'
import PayGatePlugin from '@filano/paygate-vue'
import App from './App.vue'

const app = createApp(App)

// Configuration PayGate
app.use(PayGatePlugin, {
  authToken: '5dbffde7-c09d-43b4-80f4-5d0b21dbdd72', // Token de test
  environment: 'sandbox',
  verifySSL: false // Désactiver SSL pour développement local
})

app.mount('#app')