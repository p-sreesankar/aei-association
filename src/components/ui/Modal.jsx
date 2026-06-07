import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

/**
 * Modal Component — Accessible dialog overlay
 * 
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Callback when closing (click outside, X button, or Escape)
 * @param {string} title - Modal title
 * @param {React.ReactNode} children - Modal content
 * @param {React.ReactNode} footer - Optional footer actions
 * @param {string} size - 'sm', 'md', 'lg' for different widths
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer = null,
  size = 'md',
}) {
  // Close on Escape key
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div
        className={`relative w-full ${sizes[size] || sizes.md} rounded-2xl border border-border bg-surface shadow-xl`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 id="modal-title" className="text-h4 font-heading font-semibold text-text-primary">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-text-muted transition-colors hover:bg-surface2 hover:text-text-primary"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 text-text-secondary">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}