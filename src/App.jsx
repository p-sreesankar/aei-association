/**
 * App.jsx — Root application component with routing configuration
 * @description Main entry point that sets up authentication context, routing,
 * and lazy-loaded page components.
 */
import { Suspense } from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@components/auth/ProtectedRoute';
import { PageLayout } from '@components/layout';
import { LoadingSpinner, ToastProvider } from '@components/ui';
import { AuthProvider } from '@context/AuthContext';
import { SECTIONS } from '@data/site-config';
import { lazyWithRetry } from '@utils/lazyWithRetry';

// ── Lazy-loaded pages ──────────────────────────────────────────
// Each page is code-split for faster initial load times
const Home             = lazyWithRetry(() => import('@pages/Home'));
const About            = lazyWithRetry(() => import('@pages/About'));
const Notices          = lazyWithRetry(() => import('@pages/Notices'));
const Events           = lazyWithRetry(() => import('@pages/Events'));
const Resources        = lazyWithRetry(() => import('@pages/Resources'));
const Projects         = lazyWithRetry(() => import('@pages/Projects'));
const SeniorProjects   = lazyWithRetry(() => import('@pages/SeniorProjects'));
const StudentRepos     = lazyWithRetry(() => import('@pages/StudentRepos'));
const Grievance        = lazyWithRetry(() => import('@pages/Grievance'));
const Contact          = lazyWithRetry(() => import('@pages/Contact'));
const NotFound         = lazyWithRetry(() => import('@pages/NotFound'));
const Login            = lazyWithRetry(() => import('@pages/Login'));
const MockTestIndex    = lazyWithRetry(() => import('@pages/mocktest/MockTestIndex'));
const MockTestQuiz     = lazyWithRetry(() => import('@pages/mocktest/MockTestQuiz'));
const MockTestResults  = lazyWithRetry(() => import('@pages/mocktest/MockTestResults'));
const AdminDashboard   = lazyWithRetry(() => import('@pages/mocktest/AdminDashboard'));
const ManageTests      = lazyWithRetry(() => import('@pages/admin/ManageTests'));

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
                {SECTIONS.seniorProjects && <Route path="/senior-projects" element={<SeniorProjects />} />}
                {SECTIONS.projects  && <Route path="/projects"   element={<Projects />} />}
                {SECTIONS.studentRepos && <Route path="/student-repos" element={<StudentRepos />} />}
                {SECTIONS.grievance && <Route path="/grievance"  element={<Grievance />} />}
                {SECTIONS.contact   && <Route path="/contact"    element={<Contact />} />}

                {/* Mock tests routes - protected */}
                {SECTIONS.mockTests && (
                  <>
                    <Route path="/mock-tests" element={<MockTestIndex />} />
                    <Route path="/mock-tests/:testId" element={<MockTestQuiz />} />
                    <Route path="/mock-tests/:testId/results" element={<MockTestResults />} />
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
                <Route path="/mock-test/login"  element={<Navigate to="/mock-tests" replace />} />
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
