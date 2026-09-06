import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className="toast"
            style={{
              borderLeft: `4px solid ${
                isSuccess ? 'var(--color-success)' : isError ? 'var(--color-urgent)' : 'var(--accent-primary)'
              }`
            }}
          >
            {isSuccess && <CheckCircle2 size={18} color="var(--color-success)" />}
            {isError && <AlertCircle size={18} color="var(--color-urgent)" />}
            {!isSuccess && !isError && <Info size={18} color="var(--accent-primary)" />}

            <span style={{ flex: 1, fontSize: '0.86rem' }}>{toast.message}</span>

            {toast.action && (
              <button
                type="button"
                className="toast-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toast.action.onClick();
                  onDismiss(toast.id);
                }}
              >
                {toast.action.label}
              </button>
            )}

            <button
              className="icon-btn"
              style={{ width: 22, height: 22, flexShrink: 0 }}
              onClick={() => onDismiss(toast.id)}
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
