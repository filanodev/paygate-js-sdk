<template>
  <form @submit.prevent="handleSubmit" class="paygate-payment-form">
    <div class="form-group">
      <label for="phoneNumber">
        Numéro de téléphone <span class="required">*</span>
      </label>
      <input
        id="phoneNumber"
        v-model="form.phoneNumber"
        type="tel"
        placeholder="+22890123456"
        required
        :disabled="loading"
        class="form-control"
      >
      <small class="form-text">Format: +228XXXXXXXX</small>
    </div>

    <div class="form-group">
      <label for="amount">
        Montant (FCFA) <span class="required">*</span>
      </label>
      <input
        id="amount"
        v-model.number="form.amount"
        type="number"
        min="10"
        step="1"
        required
        :disabled="loading"
        class="form-control"
      >
    </div>

    <div class="form-group">
      <label for="network">
        Réseau <span class="required">*</span>
      </label>
      <select
        id="network"
        v-model="form.network"
        required
        :disabled="loading"
        class="form-control"
      >
        <option value="">Choisir un réseau</option>
        <option value="FLOOZ">FLOOZ (Moov)</option>
        <option value="TMONEY">T-Money (Togocel)</option>
      </select>
    </div>

    <div class="form-group">
      <label for="description">Description (optionnel)</label>
      <input
        id="description"
        v-model="form.description"
        type="text"
        :disabled="loading"
        class="form-control"
        :placeholder="defaultDescription"
      >
    </div>

    <div class="form-actions">
      <button 
        type="submit" 
        :disabled="loading || !isFormValid"
        class="btn btn-primary"
      >
        <span v-if="loading" class="spinner"></span>
        {{ loading ? 'Traitement...' : submitLabel }}
      </button>
      
      <button 
        v-if="showReset"
        type="button" 
        @click="reset"
        :disabled="loading"
        class="btn btn-secondary"
      >
        Réinitialiser
      </button>
    </div>

    <div v-if="error" class="alert alert-error">
      {{ error }}
      <button @click="clearError" class="alert-close">&times;</button>
    </div>

    <div v-if="paymentResult && isSuccess" class="alert alert-success">
      <strong>Paiement initié avec succès!</strong><br>
      Référence: {{ paymentResult.txReference }}
    </div>

    <div v-if="paymentResult && !isSuccess" class="alert alert-warning">
      <strong>Attention:</strong><br>
      {{ paymentResult.message }}
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PayGateNetwork } from '@filano/paygate-core'
import { usePaymentInitiation } from '../composables'

interface Props {
  submitLabel?: string
  showReset?: boolean
  defaultDescription?: string
  autoGenerateIdentifier?: boolean
  identifierPrefix?: string
}

interface Emits {
  (e: 'success', result: any): void
  (e: 'error', error: string): void
  (e: 'submit', formData: any): void
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Initier le paiement',
  showReset: true,
  defaultDescription: 'Paiement via PayGateGlobal',
  autoGenerateIdentifier: true,
  identifierPrefix: 'PAY'
})

const emit = defineEmits<Emits>()

const { initiate, loading, error, paymentResult, isSuccess, reset: resetPayment, clearError } = usePaymentInitiation()

const form = ref({
  phoneNumber: '',
  amount: null as number | null,
  network: '' as PayGateNetwork | '',
  description: ''
})

const isFormValid = computed(() => {
  return form.value.phoneNumber && 
         form.value.amount && 
         form.value.amount > 0 && 
         form.value.network
})

const generateIdentifier = () => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 9999)
  return `${props.identifierPrefix}_${timestamp}_${random}`
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  const identifier = props.autoGenerateIdentifier ? generateIdentifier() : `${props.identifierPrefix}_${Date.now()}`
  
  const params = {
    phoneNumber: form.value.phoneNumber,
    amount: form.value.amount!,
    identifier,
    network: form.value.network as PayGateNetwork,
    description: form.value.description || props.defaultDescription
  }

  emit('submit', params)

  const result = await initiate(params)
  
  if (result) {
    if (result.status === 0) {
      emit('success', result)
    } else {
      emit('error', result.message || 'Erreur lors du paiement')
    }
  } else if (error.value) {
    emit('error', error.value)
  }
}

const reset = () => {
  form.value = {
    phoneNumber: '',
    amount: null,
    network: '',
    description: ''
  }
  resetPayment()
}
</script>

<style scoped>
.paygate-payment-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: #333;
}

.required {
  color: #e74c3c;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.form-control:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.form-text {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #666;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #45a049;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #545b62;
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
  margin-top: 16px;
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

.alert-warning {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.alert-close {
  position: absolute;
  top: 8px;
  right: 12px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
}

.alert-close:hover {
  opacity: 1;
}
</style>