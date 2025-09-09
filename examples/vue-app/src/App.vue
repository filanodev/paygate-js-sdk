<template>
  <div class="app">
    <header class="header">
      <h1>🏧 PayGate Vue.js Demo</h1>
      <p>Démonstration du SDK PayGateGlobal avec Vue.js</p>
      <div class="badge">
        Développé par <a href="https://me.fedapay.com/filano_don" target="_blank">Filano</a>
      </div>
    </header>

    <main class="main">
      <div class="grid">
        <!-- Section 1: Composables -->
        <section class="card">
          <h2>🎯 Composables usePayGate</h2>
          <p>Utilisation des composables pour l'intégration PayGate</p>
          
          <ComposableDemo />
        </section>

        <!-- Section 2: Formulaire de paiement -->
        <section class="card">
          <h2>📝 Composant PaymentForm</h2>
          <p>Formulaire de paiement prêt à l'emploi</p>
          
          <PaymentForm 
            @success="onPaymentSuccess"
            @error="onPaymentError"
            submit-label="💰 Payer maintenant"
            identifier-prefix="DEMO"
            default-description="Test paiement Vue.js SDK"
          />
        </section>

        <!-- Section 3: Vérification de statut -->
        <section class="card">
          <h2>🔍 Composant StatusChecker</h2>
          <p>Vérification et surveillance du statut des paiements</p>
          
          <StatusChecker 
            :show-polling="true"
            :poll-interval="3000"
            @status-updated="onStatusUpdate"
            @error="onStatusError"
          />
        </section>

        <!-- Section 4: Options API -->
        <section class="card">
          <h2>⚙️ Options API</h2>
          <p>Utilisation avec l'Options API de Vue.js</p>
          
          <OptionsApiDemo />
        </section>
      </div>
    </main>

    <!-- Toast notifications -->
    <div v-if="notification.show" :class="['toast', notification.type]">
      {{ notification.message }}
      <button @click="hideNotification" class="toast-close">&times;</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { PaymentForm, StatusChecker } from '@filanodev/paygate-vue'
import ComposableDemo from './components/ComposableDemo.vue'
import OptionsApiDemo from './components/OptionsApiDemo.vue'

// Système de notifications
const notification = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error' | 'info'
})

const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  notification.message = message
  notification.type = type
  notification.show = true
  
  // Auto-hide après 5 secondes
  setTimeout(() => {
    notification.show = false
  }, 5000)
}

const hideNotification = () => {
  notification.show = false
}

// Gestionnaires d'événements des composants
const onPaymentSuccess = (result: any) => {
  showNotification(`💚 Paiement initié avec succès! Référence: ${result.txReference}`, 'success')
  console.log('Paiement réussi:', result)
}

const onPaymentError = (error: string) => {
  showNotification(`❌ Erreur de paiement: ${error}`, 'error')
  console.error('Erreur paiement:', error)
}

const onStatusUpdate = (status: any) => {
  const statusText = status.message || 'Statut mis à jour'
  showNotification(`📊 ${statusText}`, 'info')
  console.log('Statut mis à jour:', status)
}

const onStatusError = (error: string) => {
  showNotification(`❌ Erreur de vérification: ${error}`, 'error')
  console.error('Erreur statut:', error)
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

.header h1 {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.header p {
  font-size: 1.1rem;
  margin: 0 0 15px 0;
  opacity: 0.9;
}

.badge {
  display: inline-block;
  background: rgba(255,255,255,0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
}

.badge a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}

.badge a:hover {
  text-decoration: underline;
}

.main {
  max-width: 1200px;
  margin: 0 auto;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 30px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.25);
}

.card h2 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.4rem;
}

.card p {
  color: #666;
  margin: 0 0 25px 0;
  line-height: 1.5;
}

.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast.success {
  background: #4CAF50;
}

.toast.error {
  background: #f44336;
}

.toast.info {
  background: #2196F3;
}

.toast-close {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  float: right;
  margin-left: 15px;
  opacity: 0.8;
}

.toast-close:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
  
  .card {
    padding: 20px;
  }
  
  .header h1 {
    font-size: 2rem;
  }
}
</style>