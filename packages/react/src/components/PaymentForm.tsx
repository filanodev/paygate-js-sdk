import React, { useState, useCallback, FormEvent } from 'react'
import type { PayGateNetwork } from '@filanodev/paygate-core'
import { usePaymentInitiation } from '../hooks'

interface PaymentFormProps {
  onSuccess?: (result: any) => void
  onError?: (error: string) => void
  onSubmit?: (formData: any) => void
  submitLabel?: string
  showReset?: boolean
  defaultDescription?: string
  autoGenerateIdentifier?: boolean
  identifierPrefix?: string
  className?: string
}

interface FormData {
  phoneNumber: string
  amount: number | ''
  network: PayGateNetwork | ''
  description: string
}

export function PaymentForm({
  onSuccess,
  onError,
  onSubmit,
  submitLabel = 'Initier le paiement',
  showReset = true,
  defaultDescription = 'Paiement via PayGateGlobal',
  autoGenerateIdentifier = true,
  identifierPrefix = 'PAY',
  className = ''
}: PaymentFormProps) {
  const { initiate, loading, error, paymentResult, isSuccess, reset: resetPayment, clearError } = usePaymentInitiation()

  const [form, setForm] = useState<FormData>({
    phoneNumber: '',
    amount: '',
    network: '',
    description: ''
  })

  const isFormValid = form.phoneNumber && form.amount && Number(form.amount) > 0 && form.network

  const generateIdentifier = useCallback(() => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 9999)
    return `${identifierPrefix}_${timestamp}_${random}`
  }, [identifierPrefix])

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    const identifier = autoGenerateIdentifier ? generateIdentifier() : `${identifierPrefix}_${Date.now()}`
    
    const params = {
      phoneNumber: form.phoneNumber,
      amount: Number(form.amount),
      identifier,
      network: form.network as PayGateNetwork,
      description: form.description || defaultDescription
    }

    onSubmit?.(params)

    const result = await initiate(params)
    
    if (result) {
      if (result.status === 0) {
        onSuccess?.(result)
      } else {
        onError?.(result.message || 'Erreur lors du paiement')
      }
    } else if (error) {
      onError?.(error)
    }
  }, [form, isFormValid, autoGenerateIdentifier, generateIdentifier, identifierPrefix, defaultDescription, onSubmit, initiate, onSuccess, onError, error])

  const handleReset = useCallback(() => {
    setForm({
      phoneNumber: '',
      amount: '',
      network: '',
      description: ''
    })
    resetPayment()
  }, [resetPayment])

  const updateForm = useCallback((field: keyof FormData, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  return (
    <form onSubmit={handleSubmit} className={`paygate-payment-form ${className}`}>
      <div className="form-group">
        <label htmlFor="phoneNumber">
          Numéro de téléphone <span className="required">*</span>
        </label>
        <input
          id="phoneNumber"
          type="tel"
          value={form.phoneNumber}
          onChange={(e) => updateForm('phoneNumber', e.target.value)}
          placeholder="+22890123456"
          required
          disabled={loading}
          className="form-control"
        />
        <small className="form-text">Format: +228XXXXXXXX</small>
      </div>

      <div className="form-group">
        <label htmlFor="amount">
          Montant (FCFA) <span className="required">*</span>
        </label>
        <input
          id="amount"
          type="number"
          value={form.amount}
          onChange={(e) => updateForm('amount', e.target.value ? Number(e.target.value) : '')}
          min="10"
          step="1"
          required
          disabled={loading}
          className="form-control"
        />
      </div>

      <div className="form-group">
        <label htmlFor="network">
          Réseau <span className="required">*</span>
        </label>
        <select
          id="network"
          value={form.network}
          onChange={(e) => updateForm('network', e.target.value)}
          required
          disabled={loading}
          className="form-control"
        >
          <option value="">Choisir un réseau</option>
          <option value="FLOOZ">FLOOZ (Moov)</option>
          <option value="TMONEY">T-Money (Togocel)</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description (optionnel)</label>
        <input
          id="description"
          type="text"
          value={form.description}
          onChange={(e) => updateForm('description', e.target.value)}
          disabled={loading}
          className="form-control"
          placeholder={defaultDescription}
        />
      </div>

      <div className="form-actions">
        <button 
          type="submit" 
          disabled={loading || !isFormValid}
          className="btn btn-primary"
        >
          {loading && <span className="spinner" />}
          {loading ? 'Traitement...' : submitLabel}
        </button>
        
        {showReset && (
          <button 
            type="button" 
            onClick={handleReset}
            disabled={loading}
            className="btn btn-secondary"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button type="button" onClick={clearError} className="alert-close">&times;</button>
        </div>
      )}

      {paymentResult && isSuccess && (
        <div className="alert alert-success">
          <strong>Paiement initié avec succès!</strong><br />
          Référence: {paymentResult.txReference}
        </div>
      )}

      {paymentResult && !isSuccess && (
        <div className="alert alert-warning">
          <strong>Attention:</strong><br />
          {paymentResult.message}
        </div>
      )}

      <style jsx>{`
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
          box-sizing: border-box;
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
      `}</style>
    </form>
  )
}