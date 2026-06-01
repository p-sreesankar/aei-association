import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@components/auth/ProtectedRoute';
import { PageLayout } from '@components/layout';
import { AuthProvider } from '@context/AuthContext';
import LoadingSpinner from '@components/LoadingSpinner';
import { SECTIONS } from '@data/site-config';

// ── Lazy-loaded pages ──────────────────────────────────────────
// Each page is code-split for faster initial load
const Home       = lazy(() => import('@pages/Home'));
const About      = lazy(() => import('@pages/About'));
const Notices    = lazy(() => import('@pages/Notices'));
const Events     = lazy(() => import('@pages/Events'));
const Resources  = lazy(() => import('@pages/Resources'));
const Projects   = lazy(() => import('@pages/Projects'));
const Grievance  = lazy(() => import('@pages/Grievance'));
const Contact    = lazy(() => import('@pages/Contact'));
const NotFound   = lazy(() => import('@pages/NotFound'));
const Login = lazy(() => import('@pages/Login'));
const MockTestsList = lazy(() => import('@pages/mock-tests/MockTestsList'));
const TestEnvironment = lazy(() => import('@pages/mock-tests/TestEnvironment'));
const TestResults = lazy(() => import('@pages/mock-tests/TestResults'));
const AdminDashboard = lazy(() => import('@pages/admin/Dashboard'));
const ManageTests = lazy(() => import('@pages/admin/ManageTests'));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <PageLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              {SECTIONS.notices && <Route path="/notices" element={<Notices />} />}
              {SECTIONS.events && <Route path="/events" element={<Events />} />}
              {SECTIONS.resources && <Route path="/resources" element={<Resources />} />}
              {SECTIONS.mockTests && <Route path="/mock-tests" element={<ProtectedRoute><MockTestsList /></ProtectedRoute>} />}
              {SECTIONS.mockTests && <Route path="/mock-tests/:testId" element={<ProtectedRoute><TestEnvironment /></ProtectedRoute>} />}
              {SECTIONS.mockTests && <Route path="/mock-tests/:testId/results" element={<ProtectedRoute><TestResults /></ProtectedRoute>} />}
              {SECTIONS.projects && <Route path="/projects" element={<Projects />} />}
              {SECTIONS.grievance && <Route path="/grievance" element={<Grievance />} />}
              {SECTIONS.contact && <Route path="/contact" element={<Contact />} />}
              <Route path="/login" element={<Login />} />
              <Route path="/mock-test" element={<Navigate to="/mock-tests" replace />} />
              <Route path="/mock-test/login" element={<Navigate to="/login" replace />} />
              <Route path="/mock-test/quiz/:testId" element={<Navigate to="/mock-tests/:testId" replace />} />
              <Route path="/mock-test/admin" element={<Navigate to="/admin" replace />} />
              {SECTIONS.admin && <Route path="/admin" element={(
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              )} />}
              {SECTIONS.admin && <Route path="/admin/manage-tests" element={(
                <ProtectedRoute adminOnly>
                  <ManageTests />
                </ProtectedRoute>
              )} />}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </PageLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}
