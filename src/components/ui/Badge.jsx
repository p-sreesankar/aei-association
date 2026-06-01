/**
 * Badge Component — Small, colorful, semantic labels
 * 
 * @example
 * // Category badges
 * <Badge variant="general">General</Badge>
 * <Badge variant="academic">Academic</Badge>
 * <Badge variant="urgent">Urgent</Badge>
 * <Badge variant="event">Event</Badge>
 * 
 * @example
 * // Status badges
 * <Badge variant="success">Completed</Badge>
 * <Badge variant="warning">Pending</Badge>
 * <Badge variant="error">Cancelled</Badge>
 * 
 * @example
 * // Custom styling
 * <Badge variant="primary" className="text-xs">
 *   New
 * </Badge>
 */
export default function Badge({
  children,
  variant = 'general',
  className = '',
  ...props
}) {
  // ── Variant Styles (Dark blue theme) ────────────────────────────────
  const variants = {
    // Notice Categories
    general: `
      bg-surface2 text-text-secondary
      border border-border
    `,
    academic: `
      bg-primary-soft text-primary
      border border-[rgba(14,165,233,0.2)]
    `,
    urgent: `
      bg-[rgba(239,68,68,0.12)] text-red-400
      border border-[rgba(239,68,68,0.2)]
      font-semibold
    `,
    event: `
      bg-[rgba(245,158,11,0.12)] text-accent
      border border-[rgba(245,158,11,0.2)]
    `,
    accent: `
      bg-[rgba(245,158,11,0.12)] text-accent
      border border-[rgba(245,158,11,0.2)]
      font-semibold
    `,

    // Freshness Badges (auto-applied by date helpers)
    new: `
      bg-[rgba(16,185,129,0.12)] text-emerald-400
      border border-[rgba(16,185,129,0.2)]
      font-semibold
    `,
    soon: `
      bg-[rgba(245,158,11,0.12)] text-amber-400
      border border-[rgba(245,158,11,0.2)]
      font-semibold
    `,

    // Semantic Badges
    primary: `
      bg-primary text-text-primary
    `,
    success: `
      bg-[rgba(16,185,129,0.12)] text-emerald-400
      border border-[rgba(16,185,129,0.2)]
    `,
    warning: `
      bg-[rgba(245,158,11,0.12)] text-amber-400
      border border-[rgba(245,158,11,0.2)]
    `,
    error: `
      bg-[rgba(239,68,68,0.12)] text-red-400
      border border-[rgba(239,68,68,0.2)]
    `,
    info: `
      bg-[rgba(59,130,246,0.12)] text-blue-400
      border border-[rgba(59,130,246,0.2)]
    `,

    // Neutral
    muted: `
      bg-surface2 text-text-muted
      border border-border
    `,
  };

  const baseClasses = `
    inline-flex items-center
    px-2.5 py-1
    rounded-full
    text-xs font-medium uppercase tracking-wide
    transition-colors duration-200
  `;

  const combinedClasses = `
    ${baseClasses}
    ${variants[variant] || variants.general}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <span className={combinedClasses} {...props}>
      {children}
    </span>
  );
}
