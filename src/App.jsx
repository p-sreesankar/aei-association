/**
 * App.jsx — Root application component with routing configuration
 * @description Main entry point that sets up authentication context, routing,
 * and lazy-loaded page components.
 */
import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@components/auth/ProtectedRoute';
import { PageLayout } from '@components/layout';
import { LoadingSpinner, ToastProvider } from '@components/ui';
import { AuthProvider } from '@context/AuthContext';
import { SECTIONS } from '@data/site-config';

// ── Lazy-loaded pages ──────────────────────────────────────────
// Each page is code-split for faster initial load times
const Home             = lazy(() => import('@pages/Home'));
const About            = lazy(() => import('@pages/About'));
const Notices          = lazy(() => import('@pages/Notices'));
const Events           = lazy(() => import('@pages/Events'));
const Resources        = lazy(() => import('@pages/Resources'));
const Projects         = lazy(() => import('@pages/Projects'));
const Grievance        = lazy(() => import('@pages/Grievance'));
const Contact          = lazy(() => import('@pages/Contact'));
const NotFound         = lazy(() => import('@pages/NotFound'));
const Login            = lazy(() => import('@pages/Login'));
const MockTestIndex    = lazy(() => import('@pages/mocktest/MockTestIndex'));
const MockTestQuiz     = lazy(() => import('@pages/mocktest/MockTestQuiz'));
const MockTestResults  = lazy(() => import('@pages/mocktest/MockTestResults'));
const AdminDashboard   = lazy(() => import('@pages/mocktest/AdminDashboard'));
const ManageTests      = lazy(() => import('@pages/admin/ManageTests'));

// ── Main App Component ─────────────────────────────────────────
/**
 * Root application component
 * @component
 * @description Sets up providers, routing, and protected route guards
 */
export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <PageLayout>
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />

                {/* Conditional public routes based on site config */}
                {SECTIONS.notices   && <Route path="/notices"   element={<Notices />} />}
                {SECTIONS.events    && <Route path="/events"    element={<Events />} />}
                {SECTIONS.resources && <Route path="/resources"  element={<Resources />} />}
                {SECTIONS.projects  && <Route path="/projects"   element={<Projects />} />}
                {SECTIONS.grievance && <Route path="/grievance"  element={<Grievance />} />}
                {SECTIONS.contact   && <Route path="/contact"    element={<Contact />} />}

                {/* Mock tests routes - protected */}
                {SECTIONS.mockTests && (
                  <>
                    <Route path="/mock-tests" element={
                      <ProtectedRoute><MockTestIndex /></ProtectedRoute>
                    } />
                    <Route path="/mock-tests/:testId" element={
                      <ProtectedRoute><MockTestQuiz /></ProtectedRoute>
                    } />
                    <Route path="/mock-tests/:testId/results" element={
                      <ProtectedRoute><MockTestResults /></ProtectedRoute>
                    } />
                  </>
                )}

                {/* Admin routes - protected, admin only */}
                {SECTIONS.admin && (
                  <>
                    <Route path="/admin" element={
                      <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
                    } />
                    <Route path="/admin/manage-tests" element={
                      <ProtectedRoute adminOnly><ManageTests /></ProtectedRoute>
                    } />
                    <Route path="/admin/create-test" element={
                      <Navigate to="/admin/manage-tests?action=new" replace />
                    } />
                  </>
                )}

                {/* Legacy route redirects for backwards compatibility */}
                <Route path="/mock-test"        element={<Navigate to="/mock-tests" replace />} />
                <Route path="/mock-test/login"  element={<Navigate to="/login"     replace />} />
                <Route path="/mock-test/quiz/:testId" element={<Navigate to="/mock-tests/:testId" replace />} />
                <Route path="/mock-test/admin"  element={<Navigate to="/admin"      replace />} />

                {/* Catch-all 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </PageLayout>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
