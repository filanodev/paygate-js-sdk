<template>
  <div class="options-demo">
    <p class="info">
      💡 Cette section montre l'utilisation avec l'Options API de Vue.js
    </p>

    <div class="form-section">
      <div class="form-group">
        <label>Montant (FCFA):</label>
        <input 
          v-model.number="amount" 
          type="number" 
          min="10"
          class="input"
          placeholder="Ex: 1000"
        >
      </div>

      <div class="form-group">
        <label>Réseau:</label>
        <select v-model="network" class="input">
          <option value="">Choisir un réseau</option>
          <option value="FLOOZ">FLOOZ (Moov)</option>
          <option value="TMONEY">T-Money (Togocel)</option>
        </select>
      </div>

      <div class="actions">
        <button 
          @click="initiatePayment" 
          :disabled="loading || !isFormValid"
          class="btn btn-primary"
        >
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Traitement...' : '🚀 Paiement Options API' }}
        </button>

        <button 
          @click="generateUrl" 
          :disabled="!isFormValid"
          class="btn btn-secondary"
        >
          🔗 Générer URL
        </button>
      </div>
    </div>

    <!-- Résultats -->
    <div v-if="result" class="result-section">
      <h4>📊 Résultat:</h4>
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>

    <div v-if="error" class="alert alert-error">
      ❌ {{ error }}
      <button @click="clearError" class="alert-close">&times;</button>
    </div>

    <div v-if="generatedUrl" class="url-section">
      <h4>🔗 URL de paiement générée:</h4>
      <a :href="generatedUrl" target="_blank" class="payment-url">
        {{ generatedUrl }}
      </a>
    </div>

    <!-- Démo de vérification de statut -->
    <div class="status-section">
      <h4>🔍 Vérifier un statut:</h4>
      <div class="form-group">
        <input 
          v-model="statusRef" 
          placeholder="TX_REFERENCE ou IDENTIFIER"
          class="input"
        >
        <button 
          @click="checkPaymentStatus" 
          :disabled="statusLoading || !statusRef.trim()"
          class="btn btn-info"
        >
          {{ statusLoading ? 'Vérification...' : 'Vérifier' }}
        </button>
      </div>

      <div v-if="statusResult" class="status-result">
        <div class="status-badge" :class="getStatusClass(statusResult.status)">
          {{ getStatusIcon(statusResult.status) }} {{ statusResult.message }}
        </div>
        <div class="status-details">
          <div><strong>Référence:</strong> {{ statusResult.txReference }}</div>
          <div v-if="statusResult.amount"><strong>Montant:</strong> {{ statusResult.amount }} FCFA</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OptionsApiDemo',
  data() {
    return {
      amount: 50,
      network: 'FLOOZ',
      loading: false,
      error: null,
      result: null,
      generatedUrl: null,
      statusRef: '',
      statusLoading: false,
      statusResult: null
    }
  },
  computed: {
    isFormValid() {
      return this.amount && this.amount > 0 && this.network
    }
  },
  methods: {
    async initiatePayment() {
      if (!this.isFormValid) return

      this.loading = true
      this.error = null
      this.result = null

      try {
        const identifier = `OPTIONS_${Date.now()}_${Math.floor(Math.random() * 9999)}`
        
        const result = await this.$paygate.initiatePayment({
          phoneNumber: '+22892104312',
          amount: this.amount,
          identifier,
          network: this.network,
          description: 'Test paiement Options API Vue.js'
        })

        this.result = result
        
        // Pré-remplir pour test de statut
        this.statusRef = result.txReference

      } catch (error) {
        this.error = error.message
        console.error('Erreur Options API:', error)
      } finally {
        this.loading = false
      }
    },

    generateUrl() {
      if (!this.isFormValid) return

      this.error = null
      this.generatedUrl = null

      try {
        const identifier = `OPTIONS_URL_${Date.now()}`
        
        const result = this.$paygate.generatePaymentUrl({
          amount: this.amount,
          identifier,
          description: 'Test URL Options API Vue.js',
          successUrl: window.location.origin + '/success',
          phoneNumber: '+22892104312',
          network: this.network
        })

        this.generatedUrl = result.url
        this.statusRef = identifier

      } catch (error) {
        this.error = error.message
      }
    },

    async checkPaymentStatus() {
      if (!this.statusRef.trim()) return

      this.statusLoading = true
      this.statusResult = null

      try {
        // Utiliser la méthode automatique qui détecte le type
        const result = await this.$paygate.checkStatus(this.statusRef.trim())
        this.statusResult = result

      } catch (error) {
        this.error = error.message
      } finally {
        this.statusLoading = false
      }
    },

    clearError() {
      this.error = null
    },

    getStatusClass(status) {
      switch (status) {
        case 0: return 'success'
        case 1:
        case 2:
        case 3: return 'pending'
        case 4:
        case 5:
        case 6: return 'error'
        case 7: return 'expired'
        default: return 'unknown'
      }
    },

    getStatusIcon(status) {
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
  }
}
</script>

<style scoped>
.options-demo {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.info {
  background: #e3f2fd;
  color: #1976d2;
  padding: 12px;
  border-radius: 4px;
  margin: 0 0 20px 0;
  border-left: 4px solid #2196F3;
}

.form-section {
  background: white;
  padding: 20px;
  border-radius: 6px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
}

.form-group {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-group label {
  min-width: 120px;
  font-weight: 600;
  color: #333;
}

.input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 10px;
  padding-top: 10px;
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
  transition: all 0.2s;
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

.result-section {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 20px;
}

.result-section h4 {
  margin: 0 0 10px 0;
  color: #4CAF50;
}

.result-section pre {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  margin: 0;
}

.alert {
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  position: relative;
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

.url-section {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 20px;
}

.url-section h4 {
  margin: 0 0 10px 0;
  color: #2196F3;
}

.payment-url {
  display: block;
  padding: 10px 12px;
  background: #f0f8ff;
  border: 1px solid #2196F3;
  border-radius: 4px;
  color: #1976d2;
  text-decoration: none;
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
}

.payment-url:hover {
  background: #e3f2fd;
}

.status-section {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 15px;
}

.status-section h4 {
  margin: 0 0 15px 0;
  color: #ff9800;
}

.status-result {
  margin-top: 15px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #ddd;
}

.status-badge {
  padding: 12px 16px;
  font-weight: 600;
}

.status-badge.success {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.error {
  background-color: #f8d7da;
  color: #721c24;
}

.status-badge.expired {
  background-color: #e2e3e5;
  color: #383d41;
}

.status-details {
  padding: 12px 16px;
  background: #f8f9fa;
  font-size: 14px;
}

.status-details div {
  margin-bottom: 4px;
}

.status-details div:last-child {
  margin-bottom: 0;
}
</style>