<template>
  <div class="composable-demo">
    <!-- Demo initiation paiement -->
    <div class="demo-section">
      <h3>🎯 usePaymentInitiation</h3>
      <div class="form-group">
        <input v-model="phone" placeholder="Numéro (+22890123456)" class="input">
        <input v-model.number="amount" type="number" placeholder="Montant" class="input" min="10">
        <select v-model="network" class="input">
          <option value="">Choisir réseau</option>
          <option value="FLOOZ">FLOOZ</option>
          <option value="TMONEY">T-Money</option>
        </select>
      </div>
      
      <button 
        @click="handleInitiatePayment" 
        :disabled="initLoading || !isFormValid"
        class="btn btn-primary"
      >
        <span v-if="initLoading" class="spinner"></span>
        {{ initLoading ? 'Initiation...' : '💳 Initier paiement' }}
      </button>

      <div v-if="initError" class="alert alert-error">
        {{ initError }}
        <button @click="clearInitError" class="alert-close">&times;</button>
      </div>

      <div v-if="paymentResult && isSuccess" class="alert alert-success">
        ✅ Paiement initié! Référence: {{ paymentResult.txReference }}
      </div>
    </div>

    <!-- Demo vérification statut -->
    <div class="demo-section">
      <h3>🔍 usePayGate - Vérification</h3>
      <div class="form-group">
        <input 
          v-model="statusReference" 
          placeholder="TX_REFERENCE ou IDENTIFIER" 
          class="input"
        >
      </div>
      
      <div class="btn-group">
        <button 
          @click="handleCheckStatus" 
          :disabled="statusLoading || !statusReference.trim()"
          class="btn btn-secondary"
        >
          <span v-if="statusLoading" class="spinner"></span>
          {{ statusLoading ? 'Vérification...' : '🔎 Vérifier statut' }}
        </button>

        <button 
          @click="handleGenerateUrl" 
          :disabled="!amount || !network"
          class="btn btn-info"
        >
          🔗 Générer URL
        </button>
      </div>

      <div v-if="statusError" class="alert alert-error">
        {{ statusError }}
      </div>

      <div v-if="lastStatus" class="status-display">
        <div class="status-header" :class="getStatusClass(lastStatus.status)">
          <span class="status-icon">{{ getStatusIcon(lastStatus.status) }}</span>
          {{ lastStatus.message }}
        </div>
        <div class="status-details">
          <div><strong>Référence:</strong> {{ lastStatus.txReference }}</div>
          <div v-if="lastStatus.amount"><strong>Montant:</strong> {{ lastStatus.amount }} FCFA</div>
          <div v-if="lastStatus.paymentMethod"><strong>Méthode:</strong> {{ lastStatus.paymentMethod }}</div>
        </div>
      </div>

      <div v-if="generatedUrl" class="url-display">
        <strong>🔗 URL générée:</strong>
        <a :href="generatedUrl" target="_blank" class="payment-link">
          Ouvrir page de paiement
        </a>
      </div>
    </div>

    <!-- Demo solde -->
    <div class="demo-section">
      <h3>💰 Consultation des soldes</h3>
      <button 
        @click="handleCheckBalance" 
        :disabled="balanceLoading"
        class="btn btn-accent"
      >
        <span v-if="balanceLoading" class="spinner"></span>
        {{ balanceLoading ? 'Consultation...' : '💸 Consulter soldes' }}
      </button>

      <div v-if="balance" class="balance-display">
        <div class="balance-item">
          <span class="balance-label">FLOOZ:</span>
          <span class="balance-amount">{{ balance.flooz || 0 }} FCFA</span>
        </div>
        <div class="balance-item">
          <span class="balance-label">T-Money:</span>
          <span class="balance-amount">{{ balance.tmoney || 0 }} FCFA</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePayGate, usePaymentInitiation } from '@filanodev/paygate-vue'
import type { PayGateNetwork } from '@filanodev/paygate-vue'

// Composables
const { 
  checkStatus, 
  generatePaymentUrl, 
  checkBalance,
  loading: statusLoading,
  error: statusError,
  lastStatus
} = usePayGate()

const {
  initiate,
  loading: initLoading,
  error: initError,
  paymentResult,
  isSuccess,
  clearError: clearInitError
} = usePaymentInitiation()

// État local
const phone = ref('+22892104312')
const amount = ref(10)
const network = ref<PayGateNetwork | ''>('TMONEY')
const statusReference = ref('')
const generatedUrl = ref('')
const balance = ref(null)
const balanceLoading = ref(false)

// Computed
const isFormValid = computed(() => {
  return phone.value && amount.value && amount.value > 0 && network.value
})

// Méthodes
const handleInitiatePayment = async () => {
  if (!isFormValid.value) return

  const identifier = `DEMO_${Date.now()}_${Math.floor(Math.random() * 9999)}`
  
  await initiate({
    phoneNumber: phone.value,
    amount: amount.value,
    identifier,
    network: network.value as PayGateNetwork,
    description: 'Test paiement composable Vue.js'
  })

  // Mettre la référence pour test de statut
  if (paymentResult.value) {
    statusReference.value = paymentResult.value.txReference
  }
}

const handleCheckStatus = async () => {
  if (!statusReference.value.trim()) return
  
  await checkStatus(statusReference.value.trim())
}

const handleGenerateUrl = () => {
  if (!amount.value || !network.value) return
  
  const identifier = `DEMO_URL_${Date.now()}`
  
  const result = generatePaymentUrl({
    amount: amount.value,
    identifier,
    description: 'Test URL de paiement Vue.js',
    successUrl: window.location.origin + '/success',
    phoneNumber: phone.value || undefined,
    network: network.value as PayGateNetwork
  })
  
  if (result) {
    generatedUrl.value = result.url
    statusReference.value = identifier
  }
}

const handleCheckBalance = async () => {
  balanceLoading.value = true
  
  try {
    balance.value = await checkBalance()
  } finally {
    balanceLoading.value = false
  }
}

const getStatusClass = (status: number): string => {
  switch (status) {
    case 0: return 'status-success'
    case 1:
    case 2:
    case 3: return 'status-pending'
    case 4:
    case 5:
    case 6: return 'status-error'
    case 7: return 'status-expired'
    default: return 'status-unknown'
  }
}

const getStatusIcon = (status: number): string => {
  switch (status) {
    case 0: return '✅'
    case 1:
    case 2:
    case 3: return '⏳'
    case 4:
    case 5:
    case 6: return '❌'
    case 7: return '⏰'
    default: return '❓'
  }
}
</script>

<style scoped>
.composable-demo {
  space-y: 25px;
}

.demo-section {
  margin-bottom: 25px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
}

.demo-section h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.1rem;
}

.form-group {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.input {
  flex: 1;
  min-width: 120px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.input:focus {
  outline: none;
  border-color: #4CAF50;
}

.btn-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-accent {
  background-color: #ff9800;
  color: white;
}

.spinner {
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.alert {
  padding: 12px;
  border-radius: 4px;
  margin-top: 15px;
  position: relative;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-close {
  position: absolute;
  top: 8px;
  right: 12px;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: inherit;
}

.status-display {
  margin-top: 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.status-header {
  padding: 12px 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-success {
  background-color: #d4edda;
  color: #155724;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-error {
  background-color: #f8d7da;
  color: #721c24;
}

.status-expired {
  background-color: #e2e3e5;
  color: #383d41;
}

.status-details {
  padding: 12px 16px;
  background: white;
  font-size: 14px;
}

.status-details div {
  margin-bottom: 4px;
}

.url-display {
  margin-top: 15px;
  padding: 12px;
  background: #e3f2fd;
  border-radius: 4px;
}

.payment-link {
  display: inline-block;
  margin-top: 8px;
  padding: 8px 16px;
  background: #2196F3;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
}

.payment-link:hover {
  background: #1976D2;
}

.balance-display {
  margin-top: 15px;
  display: flex;
  gap: 20px;
}

.balance-item {
  padding: 12px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.balance-label {
  display: block;
  font-weight: 600;
  color: #666;
  font-size: 12px;
  text-transform: uppercase;
}

.balance-amount {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #4CAF50;
  margin-top: 4px;
}
</style>