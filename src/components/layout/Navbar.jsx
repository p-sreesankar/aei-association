import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_LINKS, BRAND } from '@/config/navigation';
import { useAuth } from '@hooks/useAuth';

const LOGO_SRC = '/images/logo/logo.png';

/**
 * Navbar Component — Layered blue dark theme, sticky navigation
 *
 * Features:
 * - Sticky on scroll with shadow appearance
 * - Active link indicator (sky blue dot)
 * - Typographic " →" arrows on hover
 * - Mobile hamburger menu with slide-down animation
 * - Config-driven navigation (edit nav links in config/navigation.js)
 */
export default function Navbar() {
  const location = useLocation();
  const { user, isAdmin, loading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // ── Sticky Navbar with Shadow ──────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Close Mobile Menu on Route Change ──────────────────────────────────
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // ── Prevent Body Scroll When Menu Open ─────────────────────────────────
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // ── Check if Link is Active ────────────────────────────────────────────
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const authDestination = isAdmin ? '/admin' : '/mock-tests';

  return (
    <>
      <nav
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300
        `}
        style={{
          backgroundColor: 'rgba(10,22,40,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(14,165,233,0.12)',
          boxShadow: isScrolled ? '0 1px 0 rgba(14,165,233,0.15)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* ── Logo + Brand ───────────────────────────────────────── */}
            <Link
              to="/"
              className="flex items-center gap-3 group"
            >
              {/* Logo */}
              <div
                className="w-10 h-10 rounded-lg p-1.5 flex items-center justify-center shadow-card"
                style={{
                  backgroundColor: 'rgba(14,165,233,0.08)',
                  border: '1px solid rgba(14,165,233,0.25)',
                }}
              >
                <img
                  src={LOGO_SRC}
                  alt={`${BRAND.departmentShort} logo`}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Brand Name */}
              <div className="hidden sm:block">
                <div className="text-h4 font-heading font-bold transition-colors" style={{ color: '#F0F9FF' }}>
                  {BRAND.siteName}
                </div>
                <div className="text-caption -mt-0.5" style={{ color: '#38BDF8' }}>
                  {BRAND.departmentShort} · {BRAND.collegeShort}
                </div>
              </div>
            </Link>

            {/* ── Desktop Navigation ─────────────────────────────────── */}
            <div className="hidden lg:flex items-center gap-0.5 flex-1 min-w-0">
              {/* Scrollable nav links container */}
              <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide flex-shrink flex-grow">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="relative px-3 py-2 text-body-sm font-heading font-medium transition-colors group whitespace-nowrap flex-shrink-0"
                    style={{ color: isActive(link.path) ? '#F0F9FF' : '#7DD3FC' }}
                    onMouseEnter={(e) => { if (!isActive(link.path)) e.currentTarget.style.color = '#F0F9FF'; }}
                    onMouseLeave={(e) => { if (!isActive(link.path)) e.currentTarget.style.color = '#7DD3FC'; }}
                  >
                    {link.label}
                    {/* Typographic arrow on hover */}
                    <span
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-1"
                      style={{ color: '#0EA5E9' }}
                    >
                      →
                    </span>

                    {/* Active Indicator — Sky Blue Dot */}
                    {isActive(link.path) && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: '#0EA5E9' }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}

                    {/* Hover Underline — slides in from left */}
                    {!isActive(link.path) && (
                      <span
                        className="absolute bottom-0.5 left-3 right-3 h-[2px] rounded-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"
                        style={{ backgroundColor: 'rgba(14,165,233,0.4)' }}
                      />
                    )}
                  </Link>
                ))}
              </div>

              {/* Auth buttons - always visible, flex-shrink-0 to prevent squishing */}
              {!loading && (
                <div className="ml-2 flex items-center gap-1.5 flex-shrink-0">
                  {!user ? (
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-1.5 text-body-sm font-heading font-semibold text-text-primary transition-colors hover:border-primary hover:bg-primary-soft whitespace-nowrap"
                    >
                      Login
                    </Link>
                  ) : (
                    <>
                      <Link
                        to={authDestination}
                        className="inline-flex items-center justify-center rounded-lg border border-primary/30 bg-primary-soft px-3 py-1.5 text-body-sm font-heading font-semibold text-text-primary transition-colors hover:bg-primary hover:text-bg whitespace-nowrap"
                      >
                        {isAdmin ? 'Dashboard' : 'Mock Tests'}
                      </Link>
                      <button
                        type="button"
                        onClick={logout}
                        className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-1.5 text-body-sm font-heading font-semibold text-text-secondary transition-colors hover:border-rose-400 hover:text-rose-300 whitespace-nowrap"
                      >
                        Logout
                      </button>
                    </>
                  )}
                </div>
              )}

            </div>

            {/* ── Mobile Menu Button (min 44×44 touch target) ────────── */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors"
              style={{ color: '#F0F9FF' }}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu (Full-Screen Slide-Down) ──────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-40 lg:hidden pt-16 md:pt-20"
            style={{ backgroundColor: '#0A1628' }}
          >
            <div className="h-full overflow-y-auto overscroll-contain px-4 sm:px-6 py-6 pb-safe">
              <nav className="space-y-2">
                {NAV_LINKS.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      className="block px-6 py-4 rounded-lg min-h-[48px] flex items-center text-body-lg font-heading font-semibold transition-all duration-200"
                      style={{
                        color: isActive(link.path) ? '#F0F9FF' : '#7DD3FC',
                        backgroundColor: isActive(link.path) ? 'rgba(14,165,233,0.12)' : 'transparent',
                        boxShadow: isActive(link.path) ? '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(14,165,233,0.08)' : 'none',
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        {link.label}
                        {isActive(link.path) && (
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0EA5E9' }} />
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {!loading && (
                <div className="mt-8 rounded-2xl border border-border bg-surface p-4">
                  {!user ? (
                    <Link
                      to="/login"
                      className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-body-sm font-heading font-semibold text-bg"
                    >
                      Login
                    </Link>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-center text-body-sm text-text-muted">
                        Signed in as {user.displayName || user.email}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <Link
                          to={authDestination}
                          className="inline-flex items-center justify-center rounded-xl border border-primary/30 bg-primary-soft px-4 py-3 text-body-sm font-heading font-semibold text-text-primary"
                        >
                          {isAdmin ? 'Dashboard' : 'Mock Tests'}
                        </Link>
                        <button
                          type="button"
                          onClick={logout}
                          className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-3 text-body-sm font-heading font-semibold text-text-secondary"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Footer */}
              <div className="mt-12 pt-8" style={{ borderTop: '1px solid #1E4976' }}>
                <p className="text-body-sm text-center" style={{ color: '#38BDF8' }}>
                  {BRAND.tagline}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-16 md:h-20" />
    </>
  );
}
