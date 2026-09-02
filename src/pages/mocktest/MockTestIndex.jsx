import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Clock3, Filter, Layers3, Search, Sparkles, TrendingUp, History, ChevronDown, ChevronUp } from 'lucide-react';
import SEO from '@components/SEO';
import { SectionWrapper } from '@components/layout';
import { Badge, Card, EmptyState, PageBanner } from '@components/ui';
import { MOCK_TESTS } from '@data/mock-tests';
import { formatDate, isUpcoming } from '@utils/date';
import { getMockTestCatalog, getMockTestSubmissions } from '@utils/mock-test-storage';
import { fetchMockTestCatalog, seedMockTestsFromLocal } from '@/services/firestore-mock-tests';

function difficultyVariant(difficulty) {
  if (difficulty === 'easy') return 'success';
  if (difficulty === 'hard') return 'urgent';
  return 'primary';
}

function formatDuration(minutes) {
  if (!minutes) return '—';
  return `${minutes} min`;
}

function MockTestCard({ test, onOpen }) {
  const [imageError, setImageError] = useState(false);
  const statusLabel = isUpcoming(test.startDate) ? 'Upcoming' : 'Open';

  return (
    <Card clickable onClick={() => onOpen(test.id)} className="relative h-full flex flex-col border-border/80 bg-gradient-to-b from-surface to-surface2 overflow-hidden p-0">
      {test.imageUrl && !imageError && (
        <div className="w-full aspect-video border-b border-border/50">
          <img 
            src={test.imageUrl} 
            alt={test.title} 
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h3 className="text-h4 font-heading font-bold text-text-primary line-clamp-2">
            {test.title}
          </h3>
          <p className="mt-1 text-body-sm text-text-secondary line-clamp-2">
            {test.subject}
          </p>
        </div>
        <Badge variant={difficultyVariant(test.difficulty)}>
          {test.difficulty}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="muted">{test.scheme} scheme</Badge>
        <Badge variant="academic">Sem {test.semester}</Badge>
        <Badge variant="accent">{statusLabel}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-2 text-body-sm text-text-secondary mb-5">
        <div className="flex items-center gap-2">
          <Clock3 size={14} className="text-primary" />
          {formatDuration(test.durationMinutes)} exam
        </div>
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-accent" />
          {test.totalMarks} marks, {test.questions?.length || 0} questions
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="text-primary" />
          {formatDate(test.startDate)} - {formatDate(test.endDate)}
        </div>
      </div>

        <div className="mt-auto pt-5 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1 text-caption uppercase tracking-[0.22em] text-text-muted">
            <Layers3 size={12} />
            {test.subject}
          </span>
          <span className="btn-primary pointer-events-none">Start</span>
        </div>
      </div>
    </Card>
  );
}

export default function MockTestIndex() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('all');

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState(() => getMockTestSubmissions());
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        let catalog = await fetchMockTestCatalog();
        if (catalog.length === 0) {
          await seedMockTestsFromLocal(getMockTestCatalog(MOCK_TESTS));
          catalog = await fetchMockTestCatalog();
        }
        if (!cancelled) setTests(catalog);
      } catch {
        if (!cancelled) setTests(getMockTestCatalog(MOCK_TESTS));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();

    setSubmissions(getMockTestSubmissions());

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const syncSubmissions = () => setSubmissions(getMockTestSubmissions());

    syncSubmissions();
    window.addEventListener('storage', syncSubmissions);

    return () => window.removeEventListener('storage', syncSubmissions);
  }, []);

  const subjects = useMemo(() => {
    const uniqueSubjects = Array.from(new Set(tests.map((test) => test.subject)));
    return ['all', ...uniqueSubjects];
  }, [tests]);

  const filteredTests = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();

    return tests.filter((test) => {
      const matchesSubject = subject === 'all' || test.subject === subject;
      const matchesQuery = !lowerQuery
        || [test.title, test.subject, test.scheme, String(test.semester)]
          .join(' ')
          .toLowerCase()
          .includes(lowerQuery);

      return matchesSubject && matchesQuery;
    });
  }, [query, subject, tests]);

  // Compute the last test score for each subject
  const lastScorePerSubject = useMemo(() => {
    const scores = {};
    for (const sub of submissions) {
      const subj = sub.testSubject || 'General';
      if (!scores[subj]) {
        scores[subj] = {
          score: sub.score,
          totalQuestions: sub.totalQuestions,
          testTitle: sub.testTitle,
          submittedAt: sub.submittedAt,
        };
      }
    }
    return scores;
  }, [submissions]);

  return (
    <>
      <SEO title="Mock Test" description="Take structured mock tests with timer tracking, question navigation, and an admin management backdoor." />

      <PageBanner
        title="Mock Test Arena"
        subtitle="Access scheduled assessments, practice under exam conditions, and view your browser-local attempt history."
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Mock Test', path: '/mock-test' },
        ]}
        gradientFrom="from-[#0C1D34]"
        gradientTo="to-[#0A1628]"
      />

      <SectionWrapper background="default" className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-28 right-0 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-[1] section-container">
          {/* Student Performance Dashboard */}
          {Object.keys(lastScorePerSubject).length > 0 && (
            <div className="mb-8 rounded-3xl border border-border bg-gradient-to-r from-[rgba(14,165,233,0.1)] to-[rgba(245,158,11,0.05)] p-6 shadow-md">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-primary" />
                <h3 className="text-h4 font-heading font-bold text-text-primary">Last Subject Performance</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(lastScorePerSubject).map(([subName, details]) => {
                  const percent = details.totalQuestions > 0 ? Math.round((details.score / details.totalQuestions) * 100) : 0;
                  return (
                    <div key={subName} className="rounded-2xl border border-border bg-surface2/60 p-4 backdrop-blur-sm flex flex-col justify-between hover:border-primary/40 transition-colors">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-caption font-semibold uppercase tracking-wider text-text-muted">{subName}</span>
                          <Badge variant={percent >= 75 ? 'success' : percent >= 45 ? 'primary' : 'urgent'}>
                            {percent}%
                          </Badge>
                        </div>
                        <h4 className="mt-2 text-body-md font-bold text-text-primary line-clamp-1">{details.testTitle}</h4>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
                        <span className="text-caption text-text-secondary">
                          Score: <span className="font-semibold text-text-primary">{details.score}/{details.totalQuestions}</span>
                        </span>
                        <span className="text-caption text-text-muted">
                          {new Date(details.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Previous Attempts History (Lazy Loaded) */}
          {submissions.length > 0 && (
            <div className="mb-8 rounded-3xl border border-border bg-[rgba(15,39,68,0.6)] overflow-hidden shadow-md">
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="flex w-full items-center justify-between p-5 text-left hover:bg-surface2/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <History size={20} className="text-primary" />
                  <h3 className="text-h4 font-heading font-bold text-text-primary">Previous Attempts</h3>
                  <Badge variant="muted">{submissions.length}</Badge>
                </div>
                {showHistory ? (
                  <ChevronUp size={20} className="text-text-muted" />
                ) : (
                  <ChevronDown size={20} className="text-text-muted" />
                )}
              </button>
              
              {showHistory && (
                <div className="border-t border-border">
                  <div className="max-h-96 overflow-y-auto p-4 space-y-3">
                    {submissions.map((sub) => {
                      const percent = sub.totalQuestions > 0 
                        ? Math.round((sub.score / sub.totalQuestions) * 100) 
                        : 0;
                      const isPass = percent >= 50;
                      
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => navigate(`/mock-tests/${sub.testId}/results`, { state: { submission: sub } })}
                          className="w-full rounded-2xl border border-border bg-surface2/60 p-4 text-left hover:border-primary/50 hover:bg-surface2 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-body-md font-semibold text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                                {sub.testTitle || 'Mock Test'}
                              </h4>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-caption text-text-muted">
                                <span>{sub.testSubject || 'General'}</span>
                                <span>•</span>
                                <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge variant={isPass ? 'success' : 'urgent'} size="sm">
                                {percent}%
                              </Badge>
                              <span className="text-caption text-text-secondary font-medium">
                                {sub.score}/{sub.totalQuestions}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-2 text-caption text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>View detailed results with answer explanations</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Filters and Search */}
          <div className="flex flex-col gap-6 rounded-3xl border border-border bg-[rgba(15,39,68,0.82)] p-5 md:p-6 shadow-card backdrop-blur-xl">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-caption uppercase tracking-[0.24em] text-text-muted">
                  <Search size={12} />
                  Search tests
                </span>
                <div className="relative">
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by title, subject, semester, or scheme"
                    className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 pl-11 text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-caption uppercase tracking-[0.24em] text-text-muted">
                  <Filter size={12} />
                  Subject filter
                </span>
                <select
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {subjects.map((option) => (
                    <option key={option} value={option}>
                      {option === 'all' ? 'All subjects' : option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-body-sm text-text-secondary">
              <span>{filteredTests.length} tests available</span>
            </div>
          </div>

          {/* Test Cards Grid */}
          <div className="mt-8">
            {loading ? (
              <Card>
                <EmptyState
                  icon="search"
                  title="Loading tests..."
                  subtitle="Please wait while we fetch the available mock tests."
                />
              </Card>
            ) : filteredTests.length === 0 ? (
              <Card>
                <EmptyState
                  icon="search"
                  title="No tests match your filters"
                  subtitle="Try a different subject or clear the search to see all available mock tests."
                />
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredTests.map((test) => (
                  <MockTestCard key={test.id} test={test} onOpen={(testId) => navigate(`/mock-tests/${testId}`)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}