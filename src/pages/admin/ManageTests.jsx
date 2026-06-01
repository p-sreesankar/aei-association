import { useEffect, useMemo, useState } from 'react';
import { Plus, Save, Trash2, RefreshCw, Pencil, X, Hash } from 'lucide-react';
import SEO from '@components/SEO';
import { SectionWrapper } from '@components/layout';
import { Badge, Button, Card, EmptyState, PageBanner } from '@components/ui';
import { MOCK_TESTS } from '@data/mock-tests';
import { fetchMockTestCatalog, saveMockTestToFirestore, deleteMockTestFromFirestore, seedMockTestsFromLocal } from '@/services/firestore-mock-tests';
import { getMockTestCatalog } from '@utils/mock-test-storage';
import { useAuth } from '@hooks/useAuth';

function toSlug(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildQuestionDraft(question = null) {
  const options = Array.isArray(question?.options) ? question.options : [];
  const normalizedCorrect = Number.isInteger(question?.correctAnswer) ? question.correctAnswer : 0;

  return {
    id: question?.id || '',
    type: question?.type || 'mcq',
    question: question?.question || '',
    optionsText: options.join('\n'),
    correctAnswer: normalizedCorrect,
    explanation: question?.explanation || '',
  };
}

function parseQuestionsJson(value) {
  try {
    const parsed = JSON.parse(value || '[]');
    if (!Array.isArray(parsed)) {
      return { questions: [], error: 'Questions must be a JSON array.' };
    }
    return { questions: parsed, error: '' };
  } catch (error) {
    return { questions: [], error: error?.message || 'Invalid JSON.' };
  }
}

function buildDraft(test = null) {
  return {
    id: test?.id || '',
    title: test?.title || '',
    subject: test?.subject || '',
    scheme: test?.scheme || '2024',
    semester: test?.semester || 3,
    difficulty: test?.difficulty || 'medium',
    startDate: test?.startDate || '',
    endDate: test?.endDate || '',
    durationMinutes: test?.durationMinutes || 30,
    totalMarks: test?.totalMarks || 20,
    questionsJson: JSON.stringify(test?.questions || [], null, 2),
  };
}

export default function ManageTests() {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState(buildDraft());
  const [questionDraft, setQuestionDraft] = useState(buildQuestionDraft());
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(-1);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        let catalog = await fetchMockTestCatalog();
        if (catalog.length === 0) {
          await seedMockTestsFromLocal(MOCK_TESTS);
          catalog = await fetchMockTestCatalog();
        }

        if (!catalog.length) {
          catalog = getMockTestCatalog(MOCK_TESTS);
        }

        if (!cancelled) {
          setTests(catalog);
          const initial = catalog[0] || null;
          setSelectedId(initial?.id || '');
          setDraft(buildDraft(initial));
        }
      } catch (error) {
        if (!cancelled) {
          const fallback = getMockTestCatalog(MOCK_TESTS);
          setTests(fallback);
          const initial = fallback[0] || null;
          setSelectedId(initial?.id || '');
          setDraft(buildDraft(initial));
          setStatus(`Loaded local fallback: ${error?.message || 'Firestore unavailable'}`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const selectedTest = useMemo(() => {
    if (!selectedId) return null;
    return tests.find((test) => test.id === selectedId) || null;
  }, [selectedId, tests]);
  const parsedQuestionsState = useMemo(() => parseQuestionsJson(draft.questionsJson), [draft.questionsJson]);
  const parsedQuestions = parsedQuestionsState.questions;
  const questionsParseError = parsedQuestionsState.error;

  useEffect(() => {
    if (selectedTest) {
      setDraft(buildDraft(selectedTest));
      setQuestionDraft(buildQuestionDraft());
      setEditingQuestionIndex(-1);
    }
  }, [selectedTest?.id]);

  function upsertQuestionInDraft(index, nextQuestion) {
    const { questions, error } = parseQuestionsJson(draft.questionsJson);
    if (error) {
      setStatus(`Questions JSON is invalid: ${error}`);
      return false;
    }

    const nextQuestions = [...questions];
    if (index >= 0 && index < nextQuestions.length) {
      nextQuestions[index] = nextQuestion;
    } else {
      nextQuestions.push(nextQuestion);
    }

    setDraft((current) => ({
      ...current,
      questionsJson: JSON.stringify(nextQuestions, null, 2),
    }));

    return true;
  }

  function removeQuestionFromDraft(index) {
    const { questions, error } = parseQuestionsJson(draft.questionsJson);
    if (error) {
      setStatus(`Questions JSON is invalid: ${error}`);
      return false;
    }

    if (index < 0 || index >= questions.length) return false;

    const nextQuestions = questions.filter((_, questionIndex) => questionIndex !== index);
    setDraft((current) => ({
      ...current,
      questionsJson: JSON.stringify(nextQuestions, null, 2),
    }));

    return true;
  }

  function handleGenerateId() {
    const titleSlug = toSlug(draft.title) || 'mock-test';
    const subjectSlug = toSlug(draft.subject).slice(0, 12);
    const semester = Number.parseInt(draft.semester, 10);
    const safeSemester = Number.isInteger(semester) && semester > 0 ? semester : 1;
    const year = new Date().getFullYear();

    const nextId = [subjectSlug, `s${safeSemester}`, titleSlug, year]
      .filter(Boolean)
      .join('-');

    setDraft((current) => ({ ...current, id: nextId }));
  }

  function handleQuestionSubmit(event) {
    event.preventDefault();
    setStatus('');

    const trimmedQuestion = questionDraft.question.trim();
    const options = questionDraft.optionsText
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean);
    const parsedAnswer = Number.parseInt(questionDraft.correctAnswer, 10);

    if (!trimmedQuestion) {
      setStatus('Question text is required.');
      return;
    }

    if (options.length < 2) {
      setStatus('Each question must have at least 2 options.');
      return;
    }

    if (!Number.isInteger(parsedAnswer) || parsedAnswer < 0 || parsedAnswer >= options.length) {
      setStatus(`Correct answer index must be between 0 and ${options.length - 1}.`);
      return;
    }

    const questionId = questionDraft.id.trim() || `q${Date.now()}`;
    const nextQuestion = {
      id: questionId,
      type: questionDraft.type || 'mcq',
      question: trimmedQuestion,
      options,
      correctAnswer: parsedAnswer,
      explanation: questionDraft.explanation.trim(),
    };

    const updated = upsertQuestionInDraft(editingQuestionIndex, nextQuestion);
    if (!updated) return;

    setQuestionDraft(buildQuestionDraft());
    setEditingQuestionIndex(-1);
    setStatus(editingQuestionIndex >= 0 ? 'Question updated in draft.' : 'Question added to draft.');
  }

  function handleQuestionEdit(index) {
    if (!Array.isArray(parsedQuestions) || !parsedQuestions[index]) return;
    setEditingQuestionIndex(index);
    setQuestionDraft(buildQuestionDraft(parsedQuestions[index]));
    setStatus(`Editing question ${index + 1}.`);
  }

  function handleQuestionDelete(index) {
    const deleted = removeQuestionFromDraft(index);
    if (!deleted) return;

    if (editingQuestionIndex === index) {
      setQuestionDraft(buildQuestionDraft());
      setEditingQuestionIndex(-1);
    } else if (editingQuestionIndex > index) {
      setEditingQuestionIndex((current) => current - 1);
    }

    setStatus('Question removed from draft. Save test to persist changes.');
  }

  function cancelQuestionEdit() {
    setEditingQuestionIndex(-1);
    setQuestionDraft(buildQuestionDraft());
    setStatus('Question editor reset.');
  }

  async function refreshCatalog() {
    setLoading(true);
    try {
      const catalog = await fetchMockTestCatalog();
      const nextCatalog = catalog.length ? catalog : getMockTestCatalog(MOCK_TESTS);
      setTests(nextCatalog);
      const initial = nextCatalog.find((test) => test.id === selectedId) || nextCatalog[0] || null;
      setSelectedId(initial?.id || '');
      setDraft(buildDraft(initial));
      setStatus('Catalog refreshed successfully.');
    } catch (error) {
      setStatus(`Refresh failed: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    setStatus('');

    const { questions, error } = parseQuestionsJson(draft.questionsJson);
    if (error) {
      setStatus(`Questions JSON is invalid: ${error}`);
      return;
    }

    if (!draft.id.trim() || !draft.title.trim() || !draft.subject.trim()) {
      setStatus('Test id, title, and subject are required.');
      return;
    }

    const payload = {
      id: draft.id.trim(),
      title: draft.title.trim(),
      subject: draft.subject.trim(),
      scheme: draft.scheme.trim(),
      semester: Number.parseInt(draft.semester, 10),
      difficulty: draft.difficulty.trim(),
      startDate: draft.startDate.trim(),
      endDate: draft.endDate.trim() || null,
      durationMinutes: Number.parseInt(draft.durationMinutes, 10),
      totalMarks: Number.parseInt(draft.totalMarks, 10),
      questions,
    };

    if (!Number.isInteger(payload.durationMinutes) || payload.durationMinutes <= 0) {
      setStatus('Duration must be a positive integer.');
      return;
    }

    if (!Number.isInteger(payload.totalMarks) || payload.totalMarks <= 0) {
      setStatus('Total marks must be a positive integer.');
      return;
    }

    if (!Array.isArray(payload.questions) || payload.questions.length === 0) {
      setStatus('At least one question is required to save a mock test.');
      return;
    }

    setSaving(true);
    try {
      await saveMockTestToFirestore(payload);
      const catalog = await fetchMockTestCatalog();
      const nextCatalog = catalog.length ? catalog : getMockTestCatalog(MOCK_TESTS);
      setTests(nextCatalog);
      setSelectedId(payload.id);
      setDraft(buildDraft(payload));
      setStatus(`Saved ${payload.title}.`);
    } catch (error) {
      setStatus(`Save failed: ${error?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(testId) {
    if (!window.confirm('Delete this mock test?')) return;

    try {
      await deleteMockTestFromFirestore(testId);
      const catalog = await fetchMockTestCatalog();
      const nextCatalog = catalog.length ? catalog : getMockTestCatalog(MOCK_TESTS);
      setTests(nextCatalog);
      const initial = nextCatalog[0] || null;
      setSelectedId(initial?.id || '');
      setDraft(buildDraft(initial));
      setStatus(`Deleted ${testId}.`);
    } catch (error) {
      setStatus(`Delete failed: ${error?.message || 'Unknown error'}`);
    }
  }

  async function handleSeed() {
    setStatus('Seeding catalog from local mock tests...');
    await seedMockTestsFromLocal(MOCK_TESTS);
    await refreshCatalog();
  }

  return (
    <>
      <SEO title="Manage Mock Tests" description="Create, edit, and delete mock test instances for the assessment portal." />

      <PageBanner
        title="Manage Mock Tests"
        subtitle={`Signed in as ${user?.email || 'admin'}. Create, edit, or delete tests and their question banks.`}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Mock Tests', path: '/mock-tests' },
          { label: 'Admin', path: '/admin' },
          { label: 'Manage Tests', path: '/admin/manage-tests' },
        ]}
        gradientFrom="from-[#0C1D34]"
        gradientTo="to-[#0A1628]"
      />

      <SectionWrapper background="default">
        <div className="section-container space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-[rgba(15,39,68,0.82)] p-4 shadow-card backdrop-blur-xl">
            <div>
              <p className="text-caption uppercase tracking-[0.24em] text-text-muted">Catalog controls</p>
              <h2 className="mt-2 text-h3 font-heading font-bold text-text-primary">Add, edit, and delete test instances</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">{tests.length} tests</Badge>
              <Button variant="secondary" onClick={refreshCatalog} icon={<RefreshCw size={16} />} loading={loading}>
                Refresh
              </Button>
              <Button variant="accent" onClick={handleSeed} icon={<Plus size={16} />}>
                Seed defaults
              </Button>
            </div>
          </div>

          {status && (
            <div className="rounded-2xl border border-primary/30 bg-primary-soft px-4 py-3 text-body-sm text-text-primary">
              {status}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <Card>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-h4 font-heading font-semibold text-text-primary">Available tests</h3>
                <Button
                  variant="primary"
                  onClick={() => {
                    setSelectedId('');
                    setDraft(buildDraft(null));
                    setQuestionDraft(buildQuestionDraft());
                    setEditingQuestionIndex(-1);
                  }}
                  icon={<Plus size={16} />}
                >
                  New
                </Button>
              </div>

              <div className="mt-4 space-y-3">
                {tests.length === 0 ? (
                  <EmptyState icon="inbox" title="No tests available" subtitle="Seed the catalog or create a new mock test instance." />
                ) : (
                  tests.map((test) => (
                    <button
                      key={test.id}
                      type="button"
                      onClick={() => { setSelectedId(test.id); setDraft(buildDraft(test)); }}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${selectedId === test.id ? 'border-primary bg-primary-soft' : 'border-border bg-surface2 hover:border-primary/50'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-heading font-semibold text-text-primary">{test.title}</h4>
                          <p className="mt-1 text-body-sm text-text-secondary">{test.subject}</p>
                        </div>
                        <Badge variant="muted">Sem {test.semester}</Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-caption text-text-muted">
                        <span>{test.questions?.length || 0} questions</span>
                        <span>•</span>
                        <span>{test.durationMinutes} min</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-h4 font-heading font-semibold text-text-primary">Test details</h3>
                  <p className="mt-1 text-body-sm text-text-secondary">Create full mocks and manage question banks with structured CRUD controls.</p>
                </div>
                {selectedId && (
                  <Button variant="secondary" onClick={() => handleDelete(selectedId)} icon={<Trash2 size={16} />}>
                    Delete
                  </Button>
                )}
              </div>

              <form onSubmit={handleSave} className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="block space-y-2 md:col-span-1">
                  <span className="text-body-sm text-text-secondary">Test ID</span>
                  <div className="flex gap-2">
                    <input value={draft.id} onChange={(event) => setDraft((current) => ({ ...current, id: event.target.value }))} className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary" required />
                    <Button type="button" variant="secondary" onClick={handleGenerateId} icon={<Hash size={14} />}>
                      Generate
                    </Button>
                  </div>
                </label>

                <label className="block space-y-2 md:col-span-1">
                  <span className="text-body-sm text-text-secondary">Title</span>
                  <input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary" required />
                </label>

                <label className="block space-y-2 md:col-span-2">
                  <span className="text-body-sm text-text-secondary">Subject</span>
                  <input value={draft.subject} onChange={(event) => setDraft((current) => ({ ...current, subject: event.target.value }))} className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary" required />
                </label>

                <label className="block space-y-2">
                  <span className="text-body-sm text-text-secondary">Scheme</span>
                  <input value={draft.scheme} onChange={(event) => setDraft((current) => ({ ...current, scheme: event.target.value }))} className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary" />
                </label>

                <label className="block space-y-2">
                  <span className="text-body-sm text-text-secondary">Semester</span>
                  <input type="number" min="1" max="8" value={draft.semester} onChange={(event) => setDraft((current) => ({ ...current, semester: event.target.value }))} className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary" />
                </label>

                <label className="block space-y-2">
                  <span className="text-body-sm text-text-secondary">Difficulty</span>
                  <select value={draft.difficulty} onChange={(event) => setDraft((current) => ({ ...current, difficulty: event.target.value }))} className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary">
                    <option value="easy">easy</option>
                    <option value="medium">medium</option>
                    <option value="hard">hard</option>
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-body-sm text-text-secondary">Start date</span>
                  <input type="date" value={draft.startDate} onChange={(event) => setDraft((current) => ({ ...current, startDate: event.target.value }))} className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary" />
                </label>

                <label className="block space-y-2">
                  <span className="text-body-sm text-text-secondary">End date</span>
                  <input type="date" value={draft.endDate} onChange={(event) => setDraft((current) => ({ ...current, endDate: event.target.value }))} className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary" />
                </label>

                <label className="block space-y-2">
                  <span className="text-body-sm text-text-secondary">Duration minutes</span>
                  <input type="number" min="1" value={draft.durationMinutes} onChange={(event) => setDraft((current) => ({ ...current, durationMinutes: event.target.value }))} className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary" />
                </label>

                <label className="block space-y-2">
                  <span className="text-body-sm text-text-secondary">Total marks</span>
                  <input type="number" min="1" value={draft.totalMarks} onChange={(event) => setDraft((current) => ({ ...current, totalMarks: event.target.value }))} className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary" />
                </label>

                <div className="md:col-span-2 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <div className="space-y-3 rounded-2xl border border-border bg-surface2/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-body-lg font-heading font-semibold text-text-primary">Question editor</h4>
                      {editingQuestionIndex >= 0 && (
                        <Badge variant="accent">Editing Q{editingQuestionIndex + 1}</Badge>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="block space-y-2">
                        <span className="text-body-sm text-text-secondary">Question ID</span>
                        <input
                          value={questionDraft.id}
                          onChange={(event) => setQuestionDraft((current) => ({ ...current, id: event.target.value }))}
                          className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary"
                          placeholder="q1"
                        />
                      </label>

                      <label className="block space-y-2">
                        <span className="text-body-sm text-text-secondary">Type</span>
                        <select
                          value={questionDraft.type}
                          onChange={(event) => setQuestionDraft((current) => ({ ...current, type: event.target.value }))}
                          className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary"
                        >
                          <option value="mcq">mcq</option>
                          <option value="true-false">true-false</option>
                        </select>
                      </label>

                      <label className="block space-y-2">
                        <span className="text-body-sm text-text-secondary">Question text</span>
                        <textarea
                          value={questionDraft.question}
                          onChange={(event) => setQuestionDraft((current) => ({ ...current, question: event.target.value }))}
                          rows={4}
                          className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary"
                          placeholder="Enter the question"
                        />
                      </label>

                      <label className="block space-y-2">
                        <span className="text-body-sm text-text-secondary">Options (one per line)</span>
                        <textarea
                          value={questionDraft.optionsText}
                          onChange={(event) => setQuestionDraft((current) => ({ ...current, optionsText: event.target.value }))}
                          rows={5}
                          className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary"
                          placeholder={'Option A\nOption B\nOption C'}
                        />
                      </label>

                      <label className="block space-y-2">
                        <span className="text-body-sm text-text-secondary">Correct answer index (0-based)</span>
                        <input
                          type="number"
                          min="0"
                          value={questionDraft.correctAnswer}
                          onChange={(event) => setQuestionDraft((current) => ({ ...current, correctAnswer: event.target.value }))}
                          className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary"
                        />
                      </label>

                      <label className="block space-y-2">
                        <span className="text-body-sm text-text-secondary">Explanation (optional)</span>
                        <textarea
                          value={questionDraft.explanation}
                          onChange={(event) => setQuestionDraft((current) => ({ ...current, explanation: event.target.value }))}
                          rows={3}
                          className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary"
                          placeholder="Why this answer is correct"
                        />
                      </label>

                      <div className="flex flex-wrap gap-2">
                        <Button type="button" onClick={handleQuestionSubmit} variant="primary" icon={editingQuestionIndex >= 0 ? <Save size={16} /> : <Plus size={16} />}>
                          {editingQuestionIndex >= 0 ? 'Update question' : 'Add question'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={cancelQuestionEdit} icon={<X size={16} />}>
                          Reset question form
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-border bg-surface2/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-body-lg font-heading font-semibold text-text-primary">Questions in draft</h4>
                      <Badge variant="primary">{Array.isArray(parsedQuestions) ? parsedQuestions.length : 0}</Badge>
                    </div>

                    {questionsParseError ? (
                      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-body-sm text-rose-200">
                        Questions JSON parse error: {questionsParseError}
                      </div>
                    ) : Array.isArray(parsedQuestions) && parsedQuestions.length > 0 ? (
                      <div className="space-y-2 max-h-[460px] overflow-auto pr-1">
                        {parsedQuestions.map((question, index) => (
                          <div key={`${question?.id || 'q'}-${index}`} className="rounded-xl border border-border bg-bg/60 p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-caption uppercase tracking-[0.22em] text-text-muted">Q{index + 1} • {question?.type || 'mcq'}</p>
                                <p className="mt-1 text-body-sm text-text-primary line-clamp-2">{question?.question || '(No question text)'}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button type="button" variant="secondary" onClick={() => handleQuestionEdit(index)} icon={<Pencil size={14} />}>
                                  Edit
                                </Button>
                                <Button type="button" variant="secondary" onClick={() => handleQuestionDelete(index)} icon={<Trash2 size={14} />}>
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState icon="inbox" title="No questions yet" subtitle="Add questions from the editor to build this mock test." />
                    )}
                  </div>
                </div>

                <label className="block space-y-2 md:col-span-2">
                  <span className="text-body-sm text-text-secondary">Questions JSON (advanced)</span>
                  <textarea value={draft.questionsJson} onChange={(event) => setDraft((current) => ({ ...current, questionsJson: event.target.value }))} rows={12} className="w-full rounded-2xl border border-border bg-bg/80 px-4 py-3 font-mono text-sm text-text-primary" />
                </label>

                <div className="md:col-span-2 flex flex-wrap gap-3">
                  <Button type="submit" variant="primary" loading={saving} icon={<Save size={16} />}>
                    Save test
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setDraft(buildDraft(selectedTest))}>
                    Reset to selected
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}