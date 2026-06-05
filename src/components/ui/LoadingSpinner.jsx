/**
 * LoadingSpinner - Animated loading indicator
 * @component
 * @description Displays an animated spinner during async operations
 */
import { motion } from 'framer-motion';

/**
 * @typedef {Object} LoadingSpinnerProps
 * @property {'sm'|'md'|'lg'} [size='md'] - Spinner size variant
 * @property {string} [className] - Additional CSS classes
 */

/**
 * Animated loading spinner with motion effects
 * @param {LoadingSpinnerProps} props
 */
export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const ringSizes = {
    sm: 20,
    md: 32,
    lg: 48,
  };

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: ringSizes[size], height: ringSizes[size] }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={sizeClasses[size]}
          aria-label="Loading"
        >
          {/* Outer ring */}
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="31.4 31.4"
            className="text-sky-200 opacity-30"
          />
          {/* Inner spinning ring */}
          <motion.circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="31.4 31.4"
            strokeDashoffset="-47"
            className="text-sky-500"
            style={{ originX: '12px', originY: '12px' }}
          />
        </svg>
      </motion.div>
    </div>
  );
}