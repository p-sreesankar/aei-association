import { Loader2 } from 'lucide-react';

/**
 * Button Component — Warm, friendly, accessible
 * 
 * @example
 * // Primary button
 * <Button variant="primary" size="md">
 *   Get Started
 * </Button>
 * 
 * @example
 * // With icon
 * <Button variant="secondary" icon={<ArrowRight size={16} />} iconPosition="right">
 *   Learn More
 * </Button>
 * 
 * @example
 * // Loading state
 * <Button variant="primary" loading disabled>
 *   Submitting...
 * </Button>
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon = null,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  // ── Variant Styles (Dark blue theme) ────────────────────────────────
  const variants = {
    primary: `
      bg-primary text-text-primary 
      hover:bg-primary-dim active:bg-primary-muted
      shadow-card hover:shadow-card-hover
      disabled:bg-surface3 disabled:text-text-muted disabled:shadow-none
    `,
    secondary: `
      bg-surface text-primary border-2 border-border
      hover:bg-surface2 hover:border-border-bright
      active:bg-surface3 active:border-border-bright
      shadow-card hover:shadow-card-hover
      disabled:bg-surface2 disabled:text-text-muted disabled:border-border disabled:shadow-none
    `,
    accent: `
      bg-accent text-text-primary
      hover:bg-accent-hover active:bg-accent-hover/90
      shadow-card hover:shadow-card-hover
      disabled:bg-surface3 disabled:text-text-muted disabled:shadow-none
    `,
    ghost: `
      bg-transparent text-primary
      hover:bg-primary-soft active:bg-primary-soft
      disabled:text-text-muted
    `,
    outline: `
      bg-transparent text-text-primary border-2 border-border
      hover:bg-surface2 hover:border-border-bright
      active:bg-surface3
      disabled:text-text-muted disabled:border-border
    `,
  };

  // ── Size Styles ────────────────────────────────────────────────────
  const sizes = {
    sm: 'px-4 py-2 text-body-sm gap-1.5',
    md: 'px-6 py-3 text-body gap-2',
    lg: 'px-8 py-4 text-body-lg gap-2.5',
  };

  // ── Combined Classes ───────────────────────────────────────────────
  const baseClasses = `
    inline-flex items-center justify-center
    font-heading font-semibold
    rounded-lg
    transition-all duration-200
    disabled:cursor-not-allowed disabled:opacity-60
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg
  `;

  const combinedClasses = `
    ${baseClasses}
    ${variants[variant] || variants.primary}
    ${sizes[size] || sizes.md}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  // ── Icon Rendering ─────────────────────────────────────────────────
  const renderIcon = () => {
    if (loading) {
      return <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="animate-spin" />;
    }
    return icon;
  };

  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {iconPosition === 'left' && renderIcon()}
      {children}
      {iconPosition === 'right' && !loading && icon}
    </button>
  );
}
