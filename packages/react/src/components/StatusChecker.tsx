import React, { useState, useCallback } from 'react'
import { usePaymentStatus } from '../hooks'

interface StatusCheckerProps {
  autoCheck?: boolean
  showPolling?: boolean
  pollInterval?: number
  initialReference?: string
  onStatusUpdated?: (status: any) => void
  onError?: (error: string) => void
  className?: string
}

export function StatusChecker({
  autoCheck = false,
  showPolling = true,
  pollInterval = 5000,
  initialReference = '',
  onStatusUpdated,
  onError,
  className = ''
}: StatusCheckerProps) {
  const [reference, setReference] = useState(initialReference)

  const { 
    status, 
    loading, 
    error, 
    isPolling, 
    check, 
    startPolling, 
    stopPolling, 
    reset: resetStatus 
  } = usePaymentStatus(reference, pollInterval)

  const getStatusClass = useCallback((statusCode: number): string => {
    switch (statusCode) {
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
  }, [])

  const getStatusIcon = useCallback((statusCode: number): string => {
    switch (statusCode) {
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
  }, [])

  const formatDateTime = useCallback((datetime: string): string => {
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
  }, [])

  const handleReset = useCallback(() => {
    setReference('')
    resetStatus()
  }, [resetStatus])

  // Auto-check si référence fournie
  React.useEffect(() => {
    if (autoCheck && initialReference) {
      check()
    }
  }, [autoCheck, initialReference, check])

  // Émettre les événements
  React.useEffect(() => {
    if (status) {
      onStatusUpdated?.(status)
    }
  }, [status, onStatusUpdated])

  React.useEffect(() => {
    if (error) {
      onError?.(error)
    }
  }, [error, onError])

  return (
    <div className={`paygate-status-checker ${className}`}>
      <div className="form-group">
        <label htmlFor="reference">
          Référence de transaction <span className="required">*</span>
        </label>
        <input
          id="reference"
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="TX_REFERENCE ou IDENTIFIER"
          required
          disabled={loading}
          className="form-control"
        />
        <small className="form-text">
          Référence PayGate (TX_XXXXX) ou votre identifiant personnalisé
        </small>
      </div>

      <div className="form-actions">
        <button 
          type="button"
          onClick={() => check(reference)} 
          disabled={loading || !reference.trim()}
          className="btn btn-primary"
        >
          {loading && <span className="spinner" />}
          {loading ? 'Vérification...' : 'Vérifier le statut'}
        </button>

        {showPolling && reference.trim() && !isPolling && (
          <button 
            type="button"
            onClick={startPolling} 
            disabled={loading}
            className="btn btn-secondary"
          >
            📡 Surveillance auto
          </button>
        )}

        {isPolling && (
          <button 
            type="button"
            onClick={stopPolling} 
            className="btn btn-warning"
          >
            ⏹ Arrêter surveillance
          </button>
        )}

        {(status || error) && (
          <button 
            type="button"
            onClick={handleReset} 
            disabled={loading}
            className="btn btn-secondary"
          >
            Effacer
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {status && (
        <div className="status-result">
          <div className={`status-header ${getStatusClass(status.status)}`}>
            <span className="status-icon">{getStatusIcon(status.status)}</span>
            <strong>{status.message || 'Statut inconnu'}</strong>
          </div>

          <div className="status-details">
            <div className="detail-row">
              <span className="label">Référence:</span>
              <span className="value">{status.txReference || reference}</span>
            </div>

            {status.identifier && (
              <div className="detail-row">
                <span className="label">Identifiant:</span>
                <span className="value">{status.identifier}</span>
              </div>
            )}

            {status.amount && (
              <div className="detail-row">
                <span className="label">Montant:</span>
                <span className="value">{status.amount} FCFA</span>
              </div>
            )}

            {status.phoneNumber && (
              <div className="detail-row">
                <span className="label">Téléphone:</span>
                <span className="value">{status.phoneNumber}</span>
              </div>
            )}

            {status.paymentMethod && (
              <div className="detail-row">
                <span className="label">Méthode:</span>
                <span className="value">{status.paymentMethod}</span>
              </div>
            )}

            {status.datetime && (
              <div className="detail-row">
                <span className="label">Date/Heure:</span>
                <span className="value">{formatDateTime(status.datetime)}</span>
              </div>
            )}
          </div>

          {isPolling && (
            <div className="polling-indicator">
              <span className="pulse-dot" />
              Surveillance en cours... (vérification toutes les {pollInterval / 1000}s)
            </div>
          )}
        </div>
      )}

      <style jsx>{`
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
          box-sizing: border-box;
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
      `}</style>
    </div>
  )
}