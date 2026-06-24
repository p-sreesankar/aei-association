import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Save, Trash2, RefreshCw, X, Hash, Sparkles } from 'lucide-react';
import SEO from '@components/SEO';
import { SectionWrapper } from '@components/layout';
import { Badge, Button, Card, EmptyState, PageBanner } from '@components/ui';
import { MOCK_TESTS } from '@data/mock-tests';
import { fetchMockTestCatalog, saveMockTestToFirestore, deleteMockTestFromFirestore, seedMockTestsFromLocal } from '@/services/firestore-mock-tests';
import { getMockTestCatalog } from '@utils/mock-test-storage';
import { useAuth } from '@hooks/useAuth';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

function toSlug(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildQuestion(index = 0) {
  return {
    id: String(index + 1),
    type: 'mcq',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: -1,
    explanation: '',
  };
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
    questions: Array.isArray(test?.questions) && test.questions.length > 0
      ? test.questions.map((q, idx) => ({
          id: String(idx + 1),
          type: q.type || 'mcq',
          question: q.question || '',
          options: Array.isArray(q.options) ? [...q.options] : ['', '', '', ''],
          correctAnswer: Number.isInteger(q.correctAnswer) ? q.correctAnswer : -1,
          explanation: q.explanation || '',
        }))
      : [buildQuestion(0)],
  };
}

export default function ManageTests() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState(buildDraft());
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  // Subject dropdown states
  const [customSubjectActive, setCustomSubjectActive] = useState(false);
  const [customSubjectVal, setCustomSubjectVal] = useState('');

  // Extract unique subjects from loaded tests
  const subjects = useMemo(() => {
    const uniq = new Set(tests.map((t) => t.subject).filter(Boolean));
    return Array.from(uniq);
  }, [tests]);

  // Load catalog — reads searchParams directly so it's always current (not stale closure)
  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Read param directly at call-time to avoid stale closure
      const testIdParam = searchParams.get('testId');
      const isNewAction = searchParams.get('action') === 'new';

      try {
        const catalog = await fetchMockTestCatalog();

        if (!catalog.length) {
          catalog = getMockTestCatalog(MOCK_TESTS);
        }

        if (!cancelled) {
          setTests(catalog);

          if (isNewAction) {
            setSelectedId('');
            setDraft(buildDraft(null));
            setSearchParams({});
          } else {
            // Prefer testId from URL param, fall back to first test
            const initialFromParam = testIdParam ? catalog.find((t) => t.id === testIdParam) : null;
            const initial = initialFromParam || catalog[0] || null;
            setSelectedId(initial?.id || '');
            setDraft(buildDraft(initial));
          }
        }
      } catch (error) {
        if (!cancelled) {
          setStatus(`Failed to load catalog: ${error?.message || 'Unknown error'}`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [searchParams]);

  // Listen to searchParams changes (e.g. action=new from the Create New Test button)
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setSelectedId('');
      setDraft(buildDraft(null));
      setCustomSubjectActive(false);
      setCustomSubjectVal('');
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Sync draft when selected test changes
  useEffect(() => {
    if (selectedId) {
      const selectedTest = tests.find((test) => test.id === selectedId);
      if (selectedTest) {
        setDraft(buildDraft(selectedTest));
        setCustomSubjectActive(false);
        setCustomSubjectVal('');
      }
    }
  }, [selectedId, tests]);

  // Initialize custom subject view if selected test subject isn't empty
  useEffect(() => {
    if (draft.subject) {
      if (!subjects.includes(draft.subject) && tests.length > 0) {
        setCustomSubjectActive(true);
        setCustomSubjectVal(draft.subject);
      }
    }
  }, [draft.id]);

  // Handle subject change from select
  function handleSubjectSelect(val) {
    if (val === '__NEW__') {
      setCustomSubjectActive(true);
      setDraft((curr) => ({ ...curr, subject: customSubjectVal }));
    } else {
      setCustomSubjectActive(false);
      setDraft((curr) => ({ ...curr, subject: val }));
    }
  }

  // Handle custom subject text input change
  function handleCustomSubjectChange(val) {
    setCustomSubjectVal(val);
    setDraft((curr) => ({ ...curr, subject: val }));
  }

  // Auto-generate test slug ID
  function handleGenerateId() {
    const titleSlug = toSlug(draft.title) || 'mock-test';
    const subjectSlug = toSlug(draft.subject).slice(0, 12) || 'test';
    const semester = Number.parseInt(draft.semester, 10) || 1;
    const year = new Date().getFullYear();

    const nextId = [subjectSlug, `s${semester}`, titleSlug, year]
      .filter(Boolean)
      .join('-');

    setDraft((current) => ({ ...current, id: nextId }));
  }

  // Add question to draft
  function addQuestionToDraft() {
    setDraft((curr) => ({
      ...curr,
      questions: [...curr.questions, buildQuestion(curr.questions.length)],
    }));
  }

  // Delete question from draft
  function deleteQuestionFromDraft(index) {
    setDraft((curr) => {
      const nextQuestions = curr.questions.filter((_, idx) => idx !== index);
      // Ensure at least one question block remains, sequential ids 1-indexed
      const normalized = nextQuestions.length > 0 
        ? nextQuestions.map((q, idx) => ({ ...q, id: String(idx + 1) }))
        : [buildQuestion(0)];
      return {
        ...curr,
        questions: normalized,
      };
    });
  }

  // Update specific question field
  function updateQuestionField(index, field, value) {
    setDraft((curr) => {
      const nextQuestions = [...curr.questions];
      nextQuestions[index] = { ...nextQuestions[index], [field]: value };
      return {
        ...curr,
        questions: nextQuestions,
      };
    });
  }

  // Update specific question option
  function updateQuestionOption(questionIndex, optionIndex, value) {
    setDraft((curr) => {
      const nextQuestions = [...curr.questions];
      const nextOptions = [...nextQuestions[questionIndex].options];
      nextOptions[optionIndex] = value;
      nextQuestions[questionIndex] = {
        ...nextQuestions[questionIndex],
        options: nextOptions,
      };
      return {
        ...curr,
        questions: nextQuestions,
      };
    });
  }

  // Set correct answer
  function setCorrectAnswer(questionIndex, optionIndex) {
    updateQuestionField(questionIndex, 'correctAnswer', optionIndex);
  }

  // Save changes
  async function handleSave(event) {
    event.preventDefault();
    setStatus('');

    if (!draft.id.trim() || !draft.title.trim() || !draft.subject.trim()) {
      setStatus('Test ID, title, and subject are required.');
      return;
    }

    // Filter valid questions
    const validQuestions = draft.questions.filter(
      (q) => q.question.trim() && q.options.filter((o) => o.trim()).length >= 2
    );

    if (validQuestions.length === 0) {
      setStatus('Please add at least one complete question (with text and at least 2 options).');
      return;
    }

    // Validate correct answer indices
    for (let i = 0; i < validQuestions.length; i++) {
      const q = validQuestions[i];
      if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length || !q.options[q.correctAnswer]?.trim()) {
        setStatus(`Please select a valid correct answer for Question ${i + 1}.`);
        return;
      }
    }

    // Build payload with sequential string IDs starting from 1
    const payload = {
      id: draft.id.trim(),
      title: draft.title.trim(),
      subject: draft.subject.trim(),
      scheme: draft.scheme.trim(),
      semester: Number.parseInt(draft.semester, 10) || 1,
      difficulty: draft.difficulty.trim(),
      startDate: draft.startDate.trim(),
      endDate: draft.endDate.trim() || null,
      durationMinutes: Number.parseInt(draft.durationMinutes, 10) || 30,
      totalMarks: Number.parseInt(draft.totalMarks, 10) || validQuestions.length,
      questions: validQuestions.map((q, index) => ({
        id: String(index + 1),
        type: q.type,
        question: q.question.trim(),
        options: q.options.filter((opt) => opt.trim()),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation.trim(),
      })),
      updatedAt: new Date().toISOString(),
    };

    setSaving(true);
    try {
      await saveMockTestToFirestore(payload);
      const catalog = await fetchMockTestCatalog();
      const nextCatalog = catalog.length ? catalog : getMockTestCatalog(MOCK_TESTS);
      setTests(nextCatalog);
      setSelectedId(payload.id);
      setStatus(`Saved test "${payload.title}" successfully.`);
    } catch (error) {
      setStatus(`Save failed: ${error?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  }

  // Delete test
  async function handleDelete(testId) {
    if (!window.confirm(`Are you sure you want to delete "${testId}"?`)) return;
    try {
      await deleteMockTestFromFirestore(testId);
      const catalog = await fetchMockTestCatalog();
      const nextCatalog = catalog.length ? catalog : getMockTestCatalog(MOCK_TESTS);
      setTests(nextCatalog);
      const initial = nextCatalog[0] || null;
      setSelectedId(initial?.id || '');
      setDraft(buildDraft(initial));
      setStatus(`Deleted test ${testId}.`);
    } catch (error) {
      setStatus(`Delete failed: ${error?.message || 'Unknown error'}`);
    }
  }

  // Refresh
  async function refreshCatalog() {
    setLoading(true);
    try {
      const catalog = await fetchMockTestCatalog();
      const nextCatalog = catalog.length ? catalog : getMockTestCatalog(MOCK_TESTS);
      setTests(nextCatalog);
      const initial = nextCatalog.find((test) => test.id === selectedId) || nextCatalog[0] || null;
      setSelectedId(initial?.id || '');
      setDraft(buildDraft(initial));
      setStatus('Catalog refreshed.');
    } catch (error) {
      setStatus(`Refresh failed: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  // Seed defaults
  async function handleSeed() {
    setStatus('Seeding defaults...');
    await seedMockTestsFromLocal(MOCK_TESTS);
    await refreshCatalog();
  }

  return (
    <>
      <SEO title="Manage Mock Tests" description="Unified administration portal for managing department mock test papers." />

      <PageBanner
        title="Manage Mock Tests"
        subtitle={`Signed in as ${user?.email || 'admin'}. Single interface for test metadata and question bank CRUD.`}
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
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-[rgba(15,39,68,0.82)] p-4 shadow-card backdrop-blur-xl">
            <div>
              <p className="text-caption uppercase tracking-[0.24em] text-text-muted font-bold">Mock test arena</p>
              <h2 className="mt-2 text-h3 font-heading font-bold text-text-primary">Master Catalog Control</h2>
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

          {/* Status Message */}
          {status && (
            <div className={`rounded-2xl border px-4 py-3 text-body-sm font-medium ${status.includes('failed') || status.includes('failed') ? 'border-rose-500/30 bg-rose-500/10 text-rose-200' : 'border-primary/30 bg-primary-soft text-text-primary'}`}>
              {status}
            </div>
          )}

          {/* Master Grid layout: Lists tests on the left, full edit form on the right */}
          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            
            {/* Left Column: Test Catalog Navigator */}
            <Card className="h-fit">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-h4 font-heading font-semibold text-text-primary">Mock Exams</h3>
                <Button
                  variant="primary"
                  onClick={() => {
                    setSelectedId('');
                    setDraft(buildDraft(null));
                    setCustomSubjectActive(false);
                    setCustomSubjectVal('');
                  }}
                  icon={<Plus size={16} />}
                >
                  New
                </Button>
              </div>

              <div className="mt-4 space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {tests.length === 0 ? (
                  <EmptyState icon="inbox" title="No tests available" subtitle="Seed defaults or create a new test." />
                ) : (
                  tests.map((test) => (
                    <div
                      key={test.id}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${selectedId === test.id ? 'border-primary bg-primary-soft' : 'border-border bg-surface2 hover:border-primary/50'}`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedId(test.id)}
                        className="w-full text-left"
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
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleDelete(test._docId || test.id)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-caption text-text-muted transition-colors hover:bg-rose-500/20 hover:text-rose-400"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Right Column: Master Form (Details + Inline Questions) */}
            <Card>
              <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-4">
                <div>
                  <h3 className="text-h4 font-heading font-semibold text-text-primary">
                    {selectedId ? 'Edit Mock Test' : 'Create Mock Test'}
                  </h3>
                  <p className="mt-1 text-body-sm text-text-secondary">
                    Provide exam parameters and write questions in-place below.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSave} className="mt-6 space-y-6">
                
                {/* Section A: Metadata */}
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block space-y-2 md:col-span-1">
                    <span className="text-body-sm text-text-secondary font-medium">Test ID {selectedId && <span className="text-text-muted">(cannot be changed)</span>}</span>
                    <div className="flex gap-2">
                      <input 
                        value={draft.id} 
                        onChange={(event) => setDraft((current) => ({ ...current, id: event.target.value }))} 
                        className={`w-full rounded-xl border border-border px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${selectedId ? 'opacity-60 bg-bg/40 cursor-not-allowed border-border/40' : 'bg-bg/80 border-border'}`}
                        required 
                        disabled={Boolean(selectedId)}
                      />
                      <Button type="button" variant="secondary" onClick={handleGenerateId} icon={<Hash size={14} />} disabled={Boolean(selectedId)}>
                        Generate
                      </Button>
                    </div>
                  </label>

                  <label className="block space-y-2 md:col-span-1">
                    <span className="text-body-sm text-text-secondary font-medium">Title</span>
                    <input 
                      value={draft.title} 
                      onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} 
                      className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 border-border" 
                      required 
                    />
                  </label>

                  {/* Subject selector drop-down with new subject text field option */}
                  <div className="block space-y-2 md:col-span-2">
                    <label className="text-body-sm text-text-secondary font-medium block">Subject</label>
                    <div className="grid gap-3 md:grid-cols-2">
                      <select 
                        value={customSubjectActive ? '__NEW__' : (draft.subject || '')} 
                        onChange={(e) => handleSubjectSelect(e.target.value)}
                        className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">-- Select Subject --</option>
                        {subjects.map((subj) => (
                          <option key={subj} value={subj}>{subj}</option>
                        ))}
                        <option value="__NEW__">+ Add New Subject</option>
                      </select>

                      {customSubjectActive && (
                        <input 
                          type="text"
                          value={customSubjectVal}
                          onChange={(e) => handleCustomSubjectChange(e.target.value)}
                          placeholder="Enter new subject name"
                          className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          required
                        />
                      )}
                    </div>
                  </div>

                  <label className="block space-y-2">
                    <span className="text-body-sm text-text-secondary font-medium">Scheme</span>
                    <input value={draft.scheme} onChange={(event) => setDraft((current) => ({ ...current, scheme: event.target.value }))} className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 border-border" />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-body-sm text-text-secondary font-medium">Semester</span>
                    <input type="number" min="1" max="8" value={draft.semester} onChange={(event) => setDraft((current) => ({ ...current, semester: event.target.value }))} className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 border-border" />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-body-sm text-text-secondary font-medium">Difficulty</span>
                    <select value={draft.difficulty} onChange={(event) => setDraft((current) => ({ ...current, difficulty: event.target.value }))} className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="easy">easy</option>
                      <option value="medium">medium</option>
                      <option value="hard">hard</option>
                    </select>
                  </label>

                  <label className="block space-y-2">
                    <span className="text-body-sm text-text-secondary font-medium">Duration (minutes)</span>
                    <input type="number" min="1" value={draft.durationMinutes} onChange={(event) => setDraft((current) => ({ ...current, durationMinutes: event.target.value }))} className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 border-border" />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-body-sm text-text-secondary font-medium">Start Date</span>
                    <input type="date" value={draft.startDate} onChange={(event) => setDraft((current) => ({ ...current, startDate: event.target.value }))} className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 border-border" />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-body-sm text-text-secondary font-medium">End Date</span>
                    <input type="date" value={draft.endDate} onChange={(event) => setDraft((current) => ({ ...current, endDate: event.target.value }))} className="w-full rounded-xl border border-border bg-bg/80 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 border-border" />
                  </label>
                </div>

                {/* Section B: Inline Cards for Questions */}
                <div className="border-t border-border/60 pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-body-lg font-heading font-semibold text-text-primary">Questions Bank</h4>
                      <p className="text-caption text-text-secondary">Provide questions and mark the radio button corresponding to the correct option.</p>
                    </div>
                    <Badge variant="primary">{draft.questions.length} questions</Badge>
                  </div>

                  <div className="space-y-6">
                    {draft.questions.map((question, qIndex) => (
                      <div
                        key={qIndex}
                        className="rounded-2xl border border-border bg-surface2/40 p-5 space-y-4 relative"
                      >
                        {/* Header with Sequential ID indicator */}
                        <div className="flex items-center justify-between border-b border-border/30 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-sm font-semibold text-primary">
                              {qIndex + 1}
                            </span>
                            <span className="text-body-sm font-semibold text-text-primary">
                              Question {qIndex + 1}
                            </span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => deleteQuestionFromDraft(qIndex)}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-caption text-rose-400 hover:bg-rose-500/20 transition-colors"
                          >
                            <Trash2 size={14} />
                            <span>Remove</span>
                          </button>
                        </div>

                        {/* Question Input */}
                        <div className="space-y-1">
                          <label className="block text-body-sm font-medium text-text-secondary">Question Text</label>
                          <textarea
                            value={question.question}
                            onChange={(e) => updateQuestionField(qIndex, 'question', e.target.value)}
                            rows={3}
                            placeholder="Enter the question contents..."
                            className="w-full rounded-xl border border-border bg-bg/85 px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
                            required
                          />
                        </div>

                        {/* Question Option Inputs */}
                        <div className="space-y-3">
                          <label className="block text-body-sm font-medium text-text-secondary">
                            Options <span className="text-caption text-text-muted">(Check the correct option)</span>
                          </label>
                          <div className="grid gap-3">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-3">
                                {/* Correct option indicator radio */}
                                <label className="relative flex items-center justify-center">
                                  <input
                                    type="radio"
                                    name={`correct-option-${qIndex}`}
                                    checked={question.correctAnswer === optIndex}
                                    onChange={() => setCorrectAnswer(qIndex, optIndex)}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border-2 border-border transition-colors checked:border-emerald-500 checked:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                  />
                                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    {question.correctAnswer === optIndex && (
                                      <span className="h-2 w-2 rounded-full bg-white" />
                                    )}
                                  </span>
                                </label>

                                {/* Label badge A, B, C, D */}
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface2 text-sm font-semibold text-text-muted">
                                  {OPTION_LABELS[optIndex]}
                                </span>

                                {/* Option Value Input */}
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateQuestionOption(qIndex, optIndex, e.target.value)}
                                  placeholder={`Enter option ${OPTION_LABELS[optIndex]}`}
                                  className="flex-1 rounded-xl border border-border bg-bg/85 px-4 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Optional Explanation */}
                        <div className="space-y-1">
                          <label className="block text-body-sm font-medium text-text-secondary">Explanation <span className="text-text-muted text-caption">(optional)</span></label>
                          <input
                            type="text"
                            value={question.explanation}
                            onChange={(e) => updateQuestionField(qIndex, 'explanation', e.target.value)}
                            placeholder="Why is this the correct answer?"
                            className="w-full rounded-xl border border-border bg-bg/85 px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addQuestionToDraft}
                    icon={<Plus size={16} />}
                    className="w-full mt-3 py-3"
                  >
                    Add Question Block
                  </Button>
                </div>

                {/* Submit Actions */}
                <div className="flex gap-3 justify-end border-t border-border/60 pt-4">
                  {selectedId && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setSelectedId('');
                        setDraft(buildDraft(null));
                        setCustomSubjectActive(false);
                        setCustomSubjectVal('');
                      }}
                      icon={<X size={16} />}
                    >
                      Clear Selection
                    </Button>
                  )}
                  <Button type="submit" variant="primary" loading={saving} icon={<Save size={16} />}>
                    Save Mock Test
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
