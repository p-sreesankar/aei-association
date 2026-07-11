import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import SEO from '@components/SEO';
import { SectionWrapper } from '@components/layout';
import { Badge, Button, Card, PageBanner } from '@components/ui';
import { useAuth } from '@context/AuthContext';

export default function MockTestLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, loading, loginWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      const defaultPath = isAdmin ? '/admin' : '/mock-tests';
      const targetPath = location.state?.from || defaultPath;
      navigate(targetPath, { replace: true });
    }
  }, [isAdmin, location.state, navigate, user]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await loginWithEmail(email, password);
      // Redirection is handled by the useEffect hook above upon state change
    } catch (loginError) {
      const msg = loginError?.message || '';
      const code = loginError?.code || '';

      if (code === 'auth/user-not-found' || msg.includes('user-not-found') || msg.includes('invalid-credential') || code === 'auth/invalid-credential') {
        setError('No account found with this email, or the password is incorrect.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(loginError?.message || 'Authentication failed. Please verify your details.');
      }
      setSubmitting(false);
    }
  }

  if (loading) {
    return null;
  }

  if (user) {
    const defaultPath = isAdmin ? '/admin' : '/mock-tests';
    return <Navigate to={location.state?.from || defaultPath} replace />;
  }

  return (
    <>
      <SEO title="Admin Login" description="Mock tests are open access. Sign in only to manage the test catalog and admin tools." />

      <PageBanner
        title="Admin Sign In"
        subtitle="Students can open mock tests directly without logging in. Use this form only for admin access."
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Mock Tests', path: '/mock-tests' },
          { label: 'Admin Login', path: '/login' },
        ]}
        gradientFrom="from-[#0C1D34]"
        gradientTo="to-[#0A1628]"
      />

      <SectionWrapper background="default" className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-28 left-8 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-8 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-[1] section-container grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div className="space-y-5">
            <Badge variant="accent" className="w-fit">Open Access Mock Tests</Badge>
            <h2 className="text-h1 font-heading font-bold text-text-primary">
              Mock tests are open to students without any sign in.
            </h2>
            <p className="max-w-2xl text-body-lg text-text-secondary">
              Students can attempt tests, review their latest result, and keep past attempts in their own browser. This form is reserved for admin access.
            </p>
            <div className="flex flex-wrap gap-3 text-body-sm text-text-secondary">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface2 px-4 py-2">
                <ShieldCheck size={14} /> Admin Access
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface2 px-4 py-2">
                <LockKeyhole size={14} className="text-primary" /> Sign In Only
              </span>
            </div>
          </div>

          <Card className="backdrop-blur-2xl bg-[rgba(15,39,68,0.76)] border-border/80 shadow-elevated">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <p className="text-caption uppercase tracking-[0.24em] text-text-muted">
                  Admin credentials
                </p>
                <h3 className="mt-2 text-h3 font-heading font-bold text-text-primary">
                  Enter your details
                </h3>
              </div>

              <label className="block space-y-2">
                <span className="text-body-sm text-text-secondary">Email Address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Enter your registered email"
                  autoComplete="email"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-body-sm text-text-secondary">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Enter your account password"
                  autoComplete="current-password"
                  required
                />
              </label>

              {error && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-body-sm text-rose-200">
                  {error}
                </div>
              )}

              <Button type="submit" variant="primary" className="w-full" loading={submitting}>
                Sign In
              </Button>

              <p className="text-center text-body-sm text-text-secondary mt-4">
                Students do not need an account to use mock tests.
              </p>
            </form>
          </Card>
        </div>
      </SectionWrapper>
    </>
  );
}