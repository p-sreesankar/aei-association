import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

// Toast context for global toast management
import { createContext, useContext, useRef } from 'react';

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    info: (message, duration) => addToast(message, 'info', duration),
    remove: removeToast,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

/**
 * Toast Component — Notification bubble
 * 
 * @param {object} toast - Toast object with id, message, type
 * @param {function} onRemove - Callback to remove the toast
 */
function Toast({ toast, onRemove }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const handleRemove = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 200);
  }, [onRemove, toast.id]);

  const icons = {
    success: <CheckCircle size={20} className="text-emerald-400" />,
    error: <XCircle size={20} className="text-rose-400" />,
    info: <Info size={20} className="text-sky-400" />,
  };

  const borderColors = {
    success: 'border-emerald-500/50',
    error: 'border-rose-500/50',
    info: 'border-sky-500/50',
  };

  const bgColors = {
    success: 'bg-emerald-500/10',
    error: 'bg-rose-500/10',
    info: 'bg-sky-500/10',
  };

  return (
    <div
      className={`
        flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm
        transition-all duration-200 ease-out
        ${borderColors[toast.type] || borderColors.info}
        ${bgColors[toast.type] || bgColors.info}
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0 mt-0.5">
        {icons[toast.type] || icons.info}
      </div>
      <p className="flex-1 text-sm font-medium text-text-primary">
        {toast.message}
      </p>
      <button
        type="button"
        onClick={handleRemove}
        className="flex-shrink-0 rounded-lg p-0.5 text-text-muted transition-colors hover:bg-surface hover:text-text-primary"
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default Toast;