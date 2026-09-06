import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, Edit3, FilePlus, List, Plus, ScrollText, Shield, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '@components/SEO';
import { SectionWrapper } from '@components/layout';
import { Badge, Button, Card, EmptyState, PageBanner } from '@components/ui';
import { MOCK_TESTS } from '@data/mock-tests';
import { formatDate } from '@utils/date';
import { getMockTestCatalog, getMockTestSubmissions, saveMockTestCatalog, setMockTestSubmissions } from '@utils/mock-test-storage';
import {
  fetchMockTestCatalog,
  addQuestionToTest,
  deleteMockTestFromFirestore,
  seedMockTestsFromLocal
} from '@/services/firestore-mock-tests';
import { useAuth } from '@context/AuthContext';

const TAB_OPTIONS = [
  { id: 'catalog', label: 'Test Catalog', icon: List },
  { id: 'submissions', label: 'View Submissions', icon: ScrollText },
  { id: 'questions', label: 'Manage Questions', icon: Plus },
];

function buildQuestionDraft() {
  return {
    question: '',
    imageUrl: '',
    options: '',
    correctAnswer: '0',
    explanation: '',
  };
}

function normalizeOptions(rawOptions) {
  return rawOptions
    .split(/\r?\n|,/)
    .map((option) => option.trim())
    .filter(Boolean);
}

/**
 * Detects tests that look like invalid E2E Auto Test entries
 * (created by scripts/e2e/create-mock-test.mjs — no subject, no semester,
 * no proper questions array, and/or long random Firestore IDs).
 */
function isInvalidTest(test) {
  const hasSubject = Boolean(test.subject?.trim());
  const hasSemester = Number.isInteger(test.semester);
  const hasQuestions = Array.isArray(test.questions) && test.questions.length > 0;
  const hasProperStructure = hasQuestions && test.questions.every(
    (q) => typeof q.question === 'string' && Array.isArray(q.options)
  );
  return !hasSubject || !hasSemester || !hasProperStructure;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('catalog');
  
  const [tests, setTests] = useState([]);
  const [submissions, setSubmissions] = useState(() => getMockTestSubmissions());
  const [dataLoading, setDataLoading] = useState(true);
  
  const [selectedTestId, setSelectedTestId] = useState('');
  const [draft, setDraft] = useState(buildQuestionDraft());
  const [statusMessage, setStatusMessage] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [deletingTestId, setDeletingTestId] = useState('');

  // Filtered tests for catalog view
  const filteredTests = useMemo(() => {
    const q = catalogSearch.toLowerCase();
    return tests.filter(
      (t) =>
        !q ||
        t.title?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q) ||
        t.id?.toLowerCase().includes(q) ||
        String(t.semester).includes(q)
    );
  }, [tests, catalogSearch]);

  // Load tests from Firestore
  useEffect(() => {
    fetchMockTestCatalog()
      .then((catalog) => {
        setTests(catalog);
        if (catalog.length > 0 && !selectedTestId) {
          setSelectedTestId(catalog[0].id);
        }
      })
      .catch(() => {
        const local = getMockTestCatalog(MOCK_TESTS);
        setTests(local);
        if (local.length > 0 && !selectedTestId) {
          setSelectedTestId(local[0].id);
        }
      })
      .finally(() => setDataLoading(false));
  }, [selectedTestId]);

  useEffect(() => {
    const syncSubmissions = () => setSubmissions(getMockTestSubmissions());

    syncSubmissions();
    window.addEventListener('storage', syncSubmissions);

    return () => window.removeEventListener('storage', syncSubmissions);
  }, []);

  const selectedTest = tests.find((test) => test.id === selectedTestId) || tests[0];

  async function handleLogout() {
    await logout();
  }

  async function handleAppendQuestion(event) {
    event.preventDefault();
    if (!selectedTest) return;

    const options = normalizeOptions(draft.options);
    const correctAnswerIndex = Number.parseInt(draft.correctAnswer, 10);

    if (!draft.question.trim() || options.length < 2 || Number.isNaN(correctAnswerIndex) || correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
      setStatusMessage('Provide a question, at least two options, and a valid correct answer index.');
      return;
    }

    const nextQuestion = {
      id: `q-${Date.now()}`,
      type: 'mcq',
      question: draft.question.trim(),
      imageUrl: draft.imageUrl?.trim() || null,
      options,
      correctAnswer: correctAnswerIndex,
      explanation: draft.explanation.trim(),
    };
    
    setStatusMessage('Appending question...');
    
    try {
      await addQuestionToTest(selectedTest.id, nextQuestion);
      
      const nextTests = tests.map((test) => {
        if (test.id !== selectedTest.id) return test;
        return {
          ...test,
          questions: [...(test.questions || []), nextQuestion],
        };
      });

      setTests(nextTests);
      setDraft(buildQuestionDraft());
      setStatusMessage(`Question appended to ${selectedTest.title}.`);
    } catch (error) {
      console.error(error);
      setStatusMessage('Error appending question. Please try again.');
    }
  }

  async function handleDeleteSubmission(submissionId) {
    const nextSubmissions = getMockTestSubmissions().filter((submission) => submission.id !== submissionId);
    setMockTestSubmissions(nextSubmissions);
    setSubmissions(nextSubmissions);
  }

  async function handleDeleteTest(testId) {
    if (!testId || typeof testId !== 'string') {
      setStatusMessage(`❌ Invalid test ID — cannot delete.`);
      return;
    }
    if (!window.confirm(`Delete "${testId}" from Firestore? This cannot be undone.`)) return;
    setDeletingTestId(testId);
    setStatusMessage('Deleting…');
    try {
      await deleteMockTestFromFirestore(testId);
      // Small delay to let Firestore snapshot propagate before re-fetching
      await new Promise((r) => setTimeout(r, 300));
      const catalog = await fetchMockTestCatalog();
      setTests(catalog);
      setStatusMessage(`✅ Deleted test "${testId}".`);
    } catch (error) {
      console.error('[handleDeleteTest]', error);
      setStatusMessage(`❌ Failed to delete test: ${error?.message || String(error)}`);
    } finally {
      setDeletingTestId('');
    }
  }

  async function handleRefreshCatalog() {
    setDataLoading(true);
    try {
      const catalog = await fetchMockTestCatalog();
      setTests(catalog);
      setStatusMessage(`✅ Catalog refreshed — ${catalog.length} test(s) loaded.`);
    } catch (error) {
      console.error(error);
      setStatusMessage(`❌ Refresh failed: ${error?.message || 'Unknown error'}`);
    } finally {
      setDataLoading(false);
    }
  }
  
  async function handleSeedData() {
    setSeeding(true);
    setStatusMessage('⏳ Seeding mock test data to Firestore...');
    try {
      await seedMockTestsFromLocal(getMockTestCatalog(MOCK_TESTS));
      const catalog = await fetchMockTestCatalog();
      setTests(catalog);
      if (catalog.length > 0 && !selectedTestId) {
        setSelectedTestId(catalog[0].id);
      }
      setStatusMessage(`✅ Seeded successfully — ${catalog.length} test(s) loaded.`);
    } catch (error) {
      console.error('Seed failed:', error);
      const msg = error?.message || 'Unknown error';
      setStatusMessage(`❌ Seed failed: ${msg}`);
      alert(`Seed failed: ${msg}\n\nCheck browser console (F12) for details.`);
    } finally {
      setSeeding(false);
    }
  }

  return (
    <>
      <SEO title="Mock Test Admin" description="Manage mock test submissions and append new exam questions." />

      <PageBanner
        title="Mock Test Admin Dashboard"
        subtitle={`Signed in as ${user?.email || 'admin'}. Review local attempts on this browser, append questions, and manage the test catalog.`}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Mock Tests', path: '/mock-tests' },
          { label: 'Admin', path: '/admin' },
        ]}
        gradientFrom="from-[#0C1D34]"
        gradientTo="to-[#0A1628]"
      />

      <SectionWrapper background="default" className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-28 right-0 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-0 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-[1] section-container space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-[rgba(15,39,68,0.82)] p-4 shadow-card backdrop-blur-xl">
            <div>
              <p className="text-caption uppercase tracking-[0.24em] text-text-muted">Backdoor access</p>
              <h2 className="mt-2 text-h3 font-heading font-bold text-text-primary">Control room overview</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" onClick={handleSeedData} loading={seeding} disabled={seeding}>
                {seeding ? 'Seeding…' : 'Seed Defaults'}
              </Button>
              <Button variant="accent" onClick={() => navigate('/admin/create-test')} icon={<FilePlus size={16} />}>
                Create New Test
              </Button>
              <Badge variant="accent">{submissions.length} submissions</Badge>
              <Badge variant="academic">{tests.reduce((total, test) => total + (test.questions?.length || 0), 0)} questions</Badge>
              <Button variant="secondary" onClick={handleLogout} icon={<Shield size={16} />}>
                Sign out
              </Button>
            </div>
          </div>

          {/* Global status banner */}
          {statusMessage && (
            <div className={`rounded-2xl border px-5 py-3 text-body-sm font-medium backdrop-blur-sm ${
              statusMessage.startsWith('✅') ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : statusMessage.startsWith('❌') ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
              : 'border-sky-500/30 bg-sky-500/10 text-sky-200'
            }`}>
              {statusMessage}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {TAB_OPTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${activeTab === id ? 'border-primary bg-primary-soft text-text-primary' : 'border-border bg-surface2 text-text-secondary hover:border-primary/60 hover:text-text-primary'}`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'catalog' ? (
            <div className="space-y-4">
              {/* Catalog toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="search"
                    placeholder="Search by title, subject, or semester…"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    className="w-full min-w-[260px] rounded-xl border border-border bg-bg/80 px-4 py-2.5 text-body-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-72"
                  />
                  <span className="text-caption text-text-muted">
                    {filteredTests.length} of {tests.length} test{tests.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <Button variant="secondary" onClick={handleRefreshCatalog} icon={<Shield size={14} />} loading={dataLoading}>
                  Refresh
                </Button>
              </div>

              {/* Test cards grid */}
              {dataLoading ? (
                <Card>
                  <EmptyState icon="inbox" title="Loading catalog…" subtitle="Fetching tests from Firestore." />
                </Card>
              ) : filteredTests.length === 0 ? (
                <Card>
                  <EmptyState
                    icon="inbox"
                    title={catalogSearch ? 'No matching tests' : 'No tests in catalog'}
                    subtitle={catalogSearch ? 'Try a different search term.' : 'Seed defaults or create a new test to get started.'}
                  />
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredTests.map((test) => {
                    const invalid = isInvalidTest(test);
                    return (
                      <Card
                        key={test.id}
                        className={`flex flex-col gap-3 ${invalid ? 'border-rose-500/50' : ''}`}
                      >
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="truncate text-h4 font-heading font-semibold text-text-primary">{test.title}</h3>
                              {invalid && (
                                <span title="Invalid test — missing subject, semester, or proper question structure" className="flex items-center gap-1 rounded-full border border-rose-500/50 bg-rose-500/10 px-2 py-0.5 text-caption text-rose-300">
                                  <AlertTriangle size={10} />
                                  Invalid
                                </span>
                              )}
                            </div>
                            <p className={`mt-0.5 truncate text-body-sm ${invalid ? 'text-text-muted italic' : 'text-text-secondary'}`}>
                              {test.subject || <span className="text-rose-400">No subject set</span>}
                            </p>
                          </div>
                          <div className="flex flex-shrink-0 flex-col items-end gap-1">
                            {Number.isInteger(test.semester) ? (
                              <Badge variant="muted">Sem {test.semester}</Badge>
                            ) : (
                              <Badge variant="muted" className="text-rose-400 border-rose-500/50">No semester</Badge>
                            )}
                            <Badge variant="academic">{test.questions?.length || 0} Qs</Badge>
                          </div>
                        </div>

                        {/* Meta row */}
                        <div className="flex flex-wrap gap-2 text-caption text-text-muted">
                          <Badge variant="primary">{test.difficulty || 'medium'}</Badge>
                          <span className="flex items-center gap-1">{test.durationMinutes || 30} min</span>
                          <span>•</span>
                          <span>{test.totalMarks || test.questions?.length || 0} marks</span>
                          {test.startDate && (
                            <>
                              <span>•</span>
                              <span>{formatDate(test.startDate)}</span>
                            </>
                          )}
                        </div>

                        {/* Test ID */}
                        <p className="truncate text-caption font-mono text-text-muted">{test.id}</p>

                        {/* Actions */}
                        <div className="mt-auto flex gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => navigate(`/admin/manage-tests?testId=${encodeURIComponent(test.id)}`)}
                            icon={<Edit3 size={14} />}
                            className="flex-1 justify-center"
                          >
                            Edit
                          </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleDeleteTest(test._docId || test.id)}
                          icon={<Trash2 size={14} />}
                          loading={deletingTestId === (test._docId || test.id)}
                          className="flex-1 justify-center text-rose-400 hover:border-rose-500/50 hover:bg-rose-500/10"
                        >
                          Delete
                        </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Quick-link to full editor */}
              <div className="flex justify-center">
                <Button variant="accent" onClick={() => navigate('/admin/manage-tests')} icon={<Edit3 size={16} />}>
                  Open Full Test Editor
                </Button>
              </div>
            </div>
          ) : activeTab === 'submissions' ? (
            <Card>
              {dataLoading ? (
                <EmptyState
                  icon="inbox"
                  title="Loading submissions..."
                  subtitle="Please wait while we retrieve the data."
                />
              ) : submissions.length === 0 ? (
                <EmptyState
                  icon="inbox"
                  title="No submissions yet"
                    subtitle="Completed mock tests will appear here on this browser after attempts are submitted."
                />
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="rounded-2xl border border-border bg-surface2 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-h4 font-heading font-semibold text-text-primary">{submission.testTitle}</h3>
                          <p className="mt-1 text-body-sm text-text-secondary">{submission.testSubject}</p>
                        </div>
                        <Badge variant="primary">{submission.score}/{submission.totalQuestions}</Badge>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-4 text-body-sm text-text-secondary">
                        <div>
                          <span className="block text-caption uppercase tracking-[0.22em] text-text-muted">Submitted by</span>
                          <span className="text-text-primary">{submission.submittedBy || 'Anonymous learner'}</span>
                        </div>
                        <div>
                          <span className="block text-caption uppercase tracking-[0.22em] text-text-muted">Timestamp</span>
                          <span className="text-text-primary">{new Date(submission.submittedAt).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="block text-caption uppercase tracking-[0.22em] text-text-muted">Duration</span>
                          <span className="text-text-primary">{submission.durationMinutes} minutes</span>
                        </div>
                        <div>
                          <span className="block text-caption uppercase tracking-[0.22em] text-text-muted">Marks</span>
                          <span className="text-text-primary">{submission.totalMarks}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <Badge variant="muted">{submission.totalQuestions > 0 ? Math.round((submission.score / submission.totalQuestions) * 100) : 0}%</Badge>
                        <Badge variant="academic">{submission.answers.filter((answer) => answer.skipped).length} skipped</Badge>
                        <Button variant="secondary" onClick={() => handleDeleteSubmission(submission.id)} icon={<Trash2 size={16} />}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
              <Card>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-h4 font-heading font-semibold text-text-primary">Manage Questions</h3>
                    <p className="mt-1 text-body-sm text-text-secondary">Append a new multiple-choice question to the selected mock test.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={handleSeedData}>
                      Seed Defaults
                    </Button>
                    <BarChart3 size={18} className="text-primary" />
                  </div>
                </div>

                <form onSubmit={handleAppendQuestion} className="mt-6 space-y-5">
                  <label className="block space-y-2">
                    <span className="text-body-sm text-text-secondary">Target test</span>
                    <select
                      value={selectedTest?.id || ''}
                      onChange={(event) => setSelectedTestId(event.target.value)}
                      className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {tests.map((test) => (
                        <option key={test.id} value={test.id}>
                          {test.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block space-y-2">
                    <span className="text-body-sm text-text-secondary">Question text</span>
                    <textarea
                      value={draft.question}
                      onChange={(event) => setDraft((previous) => ({ ...previous, question: event.target.value }))}
                      rows={4}
                      className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="Write the new exam question here"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-body-sm text-text-secondary">Image URL <span className="text-text-muted text-caption">(optional)</span></span>
                    <input
                      type="url"
                      value={draft.imageUrl}
                      onChange={(event) => setDraft((previous) => ({ ...previous, imageUrl: event.target.value }))}
                      className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="https://example.com/image.png"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-body-sm text-text-secondary">Options</span>
                    <textarea
                      value={draft.options}
                      onChange={(event) => setDraft((previous) => ({ ...previous, options: event.target.value }))}
                      rows={4}
                      className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="Enter options separated by commas or line breaks"
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block space-y-2">
                      <span className="text-body-sm text-text-secondary">Correct answer index</span>
                      <input
                        type="number"
                        min="0"
                        value={draft.correctAnswer}
                        onChange={(event) => setDraft((previous) => ({ ...previous, correctAnswer: event.target.value }))}
                        className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="0"
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-body-sm text-text-secondary">Explanation</span>
                      <input
                        type="text"
                        value={draft.explanation}
                        onChange={(event) => setDraft((previous) => ({ ...previous, explanation: event.target.value }))}
                        className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="Short explanation for review"
                      />
                    </label>
                  </div>

                  {statusMessage && (
                    <div className="rounded-xl border border-border bg-primary-soft px-4 py-3 text-body-sm text-text-primary">
                      {statusMessage}
                    </div>
                  )}

                  <Button type="submit" variant="accent" icon={<Plus size={16} />}>
                    Append question
                  </Button>
                </form>
              </Card>

              <Card header={<h3 className="text-h4 font-heading font-semibold text-text-primary">Selected test summary</h3>}>
                {selectedTest ? (
                  <div className="space-y-3 text-body-sm text-text-secondary">
                    <div className="flex items-center justify-between gap-3">
                      <span>Test</span>
                      <span className="text-text-primary">{selectedTest.title}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Subject</span>
                      <span className="text-text-primary">{selectedTest.subject}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Questions</span>
                      <span className="text-text-primary">{selectedTest.questions.length}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Window</span>
                      <span className="text-text-primary">{formatDate(selectedTest.startDate)} - {formatDate(selectedTest.endDate)}</span>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon="inbox"
                    title="No test selected"
                    subtitle="Choose a mock test to inspect its current question count and availability window."
                  />
                )}
              </Card>
            </div>
          )}
        </div>
      </SectionWrapper>
    </>
  );
}