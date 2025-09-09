<template>
  <div class="paygate-status-checker">
    <div class="form-group">
      <label for="reference">
        Référence de transaction <span class="required">*</span>
      </label>
      <input
        id="reference"
        v-model="reference"
        type="text"
        placeholder="TX_REFERENCE ou IDENTIFIER"
        required
        :disabled="loading"
        class="form-control"
      >
      <small class="form-text">
        Référence PayGate (TX_XXXXX) ou votre identifiant personnalisé
      </small>
    </div>

    <div class="form-actions">
      <button 
        type="button"
        @click="check" 
        :disabled="loading || !reference.trim()"
        class="btn btn-primary"
      >
        <span v-if="loading" class="spinner"></span>
        {{ loading ? 'Vérification...' : 'Vérifier le statut' }}
      </button>

      <button 
        v-if="showPolling && reference.trim() && !isPolling"
        type="button"
        @click="startPolling" 
        :disabled="loading"
        class="btn btn-secondary"
      >
        📡 Surveillance auto
      </button>

      <button 
        v-if="isPolling"
        type="button"
        @click="stopPolling" 
        class="btn btn-warning"
      >
        ⏹ Arrêter surveillance
      </button>

      <button 
        v-if="status || error"
        type="button"
        @click="reset" 
        :disabled="loading"
        class="btn btn-secondary"
      >
        Effacer
      </button>
    </div>

    <div v-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <div v-if="status" class="status-result">
      <div class="status-header" :class="statusClass">
        <span class="status-icon">{{ statusIcon }}</span>
        <strong>{{ statusText }}</strong>
      </div>

      <div class="status-details">
        <div class="detail-row">
          <span class="label">Référence:</span>
          <span class="value">{{ status.txReference || reference }}</span>
        </div>

        <div v-if="status.identifier" class="detail-row">
          <span class="label">Identifiant:</span>
          <span class="value">{{ status.identifier }}</span>
        </div>

        <div v-if="status.amount" class="detail-row">
          <span class="label">Montant:</span>
          <span class="value">{{ status.amount }} FCFA</span>
        </div>

        <div v-if="status.phoneNumber" class="detail-row">
          <span class="label">Téléphone:</span>
          <span class="value">{{ status.phoneNumber }}</span>
        </div>

        <div v-if="status.paymentMethod" class="detail-row">
          <span class="label">Méthode:</span>
          <span class="value">{{ status.paymentMethod }}</span>
        </div>

        <div v-if="status.datetime" class="detail-row">
          <span class="label">Date/Heure:</span>
          <span class="value">{{ formatDateTime(status.datetime) }}</span>
        </div>
      </div>

      <div v-if="isPolling" class="polling-indicator">
        <span class="pulse-dot"></span>
        Surveillance en cours... (vérification toutes les {{ pollInterval / 1000 }}s)
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePaymentStatus } from '../composables'

interface Props {
  autoCheck?: boolean
  showPolling?: boolean
  pollInterval?: number
  initialReference?: string
}

interface Emits {
  (e: 'status-updated', status: any): void
  (e: 'error', error: string): void
}

const props = withDefaults(defineProps<Props>(), {
  autoCheck: false,
  showPolling: true,
  pollInterval: 5000,
  initialReference: ''
})

const emit = defineEmits<Emits>()

const reference = ref(props.initialReference)

const { 
  status, 
  loading, 
  error, 
  isPolling, 
  check, 
  startPolling, 
  stopPolling, 
  reset: resetStatus 
} = usePaymentStatus(reference, props.pollInterval)

const statusClass = computed(() => {
  if (!status.value) return ''
  
  switch (status.value.status) {
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
})

const statusIcon = computed(() => {
  if (!status.value) return ''
  
  switch (status.value.status) {
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
})

const statusText = computed(() => {
  if (!status.value) return ''
  return status.value.message || 'Statut inconnu'
})

const formatDateTime = (datetime: string): string => {
  try {
    return new Date(datetime).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch {
    return datetime
  }
}

const reset = () => {
  reference.value = ''
  resetStatus()
}

// Auto-check si référence fournie au montage
if (props.autoCheck && props.initialReference) {
  check()
}

// Émettre les événements
watch(status, (newStatus) => {
  if (newStatus) {
    emit('status-updated', newStatus)
  }
})

watch(error, (newError) => {
  if (newError) {
    emit('error', newError)
  }
})
</script>

<style scoped>
.paygate-status-checker {
  max-width: 500px;
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
}

.form-control:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.form-text {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #666;
}

.form-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
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

.btn-warning {
  background-color: #ffc107;
  color: #333;
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
  margin-bottom: 16px;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-result {
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
  border-bottom: 1px solid #c3e6cb;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
  border-bottom: 1px solid #ffeaa7;
}

.status-error {
  background-color: #f8d7da;
  color: #721c24;
  border-bottom: 1px solid #f5c6cb;
}

.status-expired {
  background-color: #e2e3e5;
  color: #383d41;
  border-bottom: 1px solid #d6d8db;
}

.status-details {
  padding: 16px;
  background: #f8f9fa;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 4px 0;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: 500;
  color: #666;
}

.value {
  font-family: monospace;
  color: #333;
}

.polling-indicator {
  padding: 12px 16px;
  background-color: #e3f2fd;
  color: #1976d2;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background-color: #1976d2;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
}
</style>