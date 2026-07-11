import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, SkipForward, SquareCheckBig, TimerReset, Pause, Play, Clock3 } from 'lucide-react';
import { Timer, ProgressBar } from '@components/ui';
import SEO from '@components/SEO';
import { SectionWrapper } from '@components/layout';
import { Badge, Button, Card, EmptyState, PageBanner } from '@components/ui';
import { MOCK_TESTS } from '@data/mock-tests';
import { formatDate } from '@utils/date';
import { getMockTestCatalog, saveMockTestSubmission } from '@utils/mock-test-storage';
import { fetchMockTestCatalog } from '@/services/firestore-mock-tests';

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getQuestionState(response) {
  if (response?.skipped) return 'skipped';
  if (response?.selectedOption !== null && response?.selectedOption !== undefined) return 'answered';
  return 'unanswered';
}

function stateStyles(state) {
  if (state === 'answered') return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  if (state === 'skipped') return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  return 'bg-surface2 text-text-muted border-border';
}

export default function MockTestQuiz() {
  const navigate = useNavigate();
  const { testId } = useParams();

  const [test, setTest] = useState(null);
  const [testLoading, setTestLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const catalog = await fetchMockTestCatalog();
        const found = catalog.find((item) => item.id === testId) || null;
        if (!cancelled) setTest(found);
      } catch {
        const catalog = getMockTestCatalog(MOCK_TESTS);
        if (!cancelled) setTest(catalog.find((item) => item.id === testId) || null);
      } finally {
        if (!cancelled) setTestLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [testId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submissionSummary, setSubmissionSummary] = useState(null);
  const [paused, setPaused] = useState(false);
  const [attemptReady, setAttemptReady] = useState(false);

  useEffect(() => {
    if (!test) return;

    setAttemptReady(false);
    setResponses(
      test.questions.map(() => ({
        selectedOption: null,
        skipped: false,
      })),
    );
    setCurrentIndex(0);
    setSecondsLeft((test.durationMinutes || 0) * 60);
    setSubmitted(false);
    setSubmissionSummary(null);
    setAttemptReady(true);
  }, [test]);

  useEffect(() => {
    if (!test || submitted || secondsLeft <= 0 || paused) return undefined;

    const interval = window.setInterval(() => {
      setSecondsLeft((previousSeconds) => {
        if (previousSeconds <= 1) {
          window.clearInterval(interval);
          return 0;
        }

        return previousSeconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [submitted, test, paused]);

  function updateResponse(nextResponse) {
    setResponses((previousResponses) =>
      previousResponses.map((response, index) => (index === currentIndex ? { ...response, ...nextResponse } : response)),
    );
  }

  async function handleSubmit() {
    if (submitted) return;

    const score = responses.reduce((total, response, index) => {
      if (response.selectedOption === test.questions[index].correctAnswer) {
        return total + 1;
      }

      return total;
    }, 0);

    const submission = {
      id: `submission-${Date.now()}`,
      testId: test.id,
      testTitle: test.title,
      testSubject: test.subject,
      submittedAt: new Date().toISOString(),
      submittedBy: 'Anonymous learner',
      submittedByUid: null,
      score,
      totalQuestions: test.questions.length,
      totalMarks: test.totalMarks,
      durationMinutes: test.durationMinutes,
      answers: responses,
      questions: test.questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      })),
    };

    saveMockTestSubmission(submission);

    setSubmitted(true);
    setSubmissionSummary(submission);
    navigate(`/mock-tests/${test.id}/results`, { replace: true, state: { submission } });
  }

  useEffect(() => {
    if (attemptReady && test && !submitted && secondsLeft === 0) {
      handleSubmit();
    }
  }, [attemptReady, secondsLeft, submitted, test]);

  if (testLoading) {
    return (
      <SectionWrapper background="default">
        <Card>
          <EmptyState
            icon="search"
            title="Loading mock test..."
            subtitle="Please wait while we retrieve the test data."
          />
        </Card>
      </SectionWrapper>
    );
  }

  if (!test) {
    return (
      <>
        <SEO title="Mock Test Not Found" description="The requested mock test could not be found." />
        <SectionWrapper background="default">
          <Card>
            <EmptyState
              icon="search"
              title="Mock test not found"
              subtitle="The selected test might have been removed or the URL may be invalid."
              action={
                <Button variant="primary" onClick={() => navigate('/mock-test')}>
                  Return to tests
                </Button>
              }
            />
          </Card>
        </SectionWrapper>
      </>
    );
  }

  const currentQuestion = test.questions[currentIndex];
  const currentResponse = responses[currentIndex] || { selectedOption: null, skipped: false };
  const answeredCount = responses.filter((response) => response.selectedOption !== null && response.selectedOption !== undefined).length;
  const skippedCount = responses.filter((response) => response.skipped).length;
  const questionStates = responses.map(getQuestionState);

  function handleSelect(optionIndex) {
    updateResponse({ selectedOption: optionIndex, skipped: false });
  }

  function handleSkip() {
    updateResponse({ selectedOption: null, skipped: true });
    if (currentIndex < test.questions.length - 1) {
      setCurrentIndex((index) => index + 1);
    }
  }

  function handleClear() {
    updateResponse({ selectedOption: null, skipped: false });
  }

  function navigateQuestion(step) {
    setCurrentIndex((index) => {
      const nextIndex = index + step;
      if (nextIndex < 0 || nextIndex >= test.questions.length) {
        return index;
      }

      return nextIndex;
    });
  }

  if (submitted && submissionSummary) {
    const percentage = submissionSummary.totalQuestions > 0
      ? Math.round((submissionSummary.score / submissionSummary.totalQuestions) * 100)
      : 0;

    return (
      <>
        <SEO title={`${test.title} Results`} description="Review your mock test submission summary." />
        <PageBanner
          title={`${test.title} Results`}
          subtitle="Your submission has been recorded. Review the summary below and return to the catalog for another attempt."
          breadcrumb={[
            { label: 'Home', path: '/' },
            { label: 'Mock Tests', path: '/mock-tests' },
            { label: 'Results', path: `/mock-tests/${test.id}/results` },
          ]}
          gradientFrom="from-[#0C1D34]"
          gradientTo="to-[#0A1628]"
        />

        <SectionWrapper background="default">
          <div className="section-container grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Card className="h-full">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border bg-surface2 p-4">
                  <p className="text-caption uppercase tracking-[0.24em] text-text-muted">Score</p>
                  <p className="mt-2 text-4xl font-heading font-bold text-text-primary">{submissionSummary.score}/{submissionSummary.totalQuestions}</p>
                  <p className="mt-1 text-body-sm text-text-secondary">{percentage}% correct</p>
                </div>
                <div className="rounded-2xl border border-border bg-surface2 p-4">
                  <p className="text-caption uppercase tracking-[0.24em] text-text-muted">Submitted by</p>
                  <p className="mt-2 text-body-lg font-semibold text-text-primary">{submissionSummary.submittedBy}</p>
                  <p className="mt-1 text-body-sm text-text-secondary">{new Date(submissionSummary.submittedAt).toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-border bg-surface2 p-4">
                  <p className="text-caption uppercase tracking-[0.24em] text-text-muted">Attempt</p>
                  <p className="mt-2 text-body-lg font-semibold text-text-primary">{submissionSummary.testSubject}</p>
                  <p className="mt-1 text-body-sm text-text-secondary">{submissionSummary.totalMarks} marks available</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="primary" onClick={() => navigate('/mock-tests')} icon={<ArrowLeft size={16} />}>
                  Back to catalog
                </Button>
                <Button variant="secondary" onClick={() => navigate(`/mock-tests/${test.id}`)}>
                  Retry this test
                </Button>
              </div>
            </Card>

            <Card header={<h3 className="text-h4 font-heading font-semibold text-text-primary">Attempt snapshot</h3>}>
              <div className="space-y-3 text-body-sm text-text-secondary">
                <div className="flex items-center justify-between">
                  <span>Answered</span>
                  <span className="text-text-primary">{answeredCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Skipped</span>
                  <span className="text-text-primary">{skippedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Time limit</span>
                  <span className="text-text-primary">{formatTime((test.durationMinutes || 0) * 60)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Date</span>
                  <span className="text-text-primary">{formatDate(test.startDate)}</span>
                </div>
              </div>
            </Card>
          </div>
        </SectionWrapper>
      </>
    );
  }

  return (
    <>
      <SEO title={test.title} description={`${test.subject} mock test with timer and question navigation.`} />

      <PageBanner
        title={test.title}
        subtitle={`${test.subject} - ${test.questions.length} questions, ${test.durationMinutes} minutes, ${test.totalMarks} marks.`}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Mock Test', path: '/mock-test' },
          { label: test.title, path: `/mock-test/quiz/${test.id}` },
        ]}
        gradientFrom="from-[#0C1D34]"
        gradientTo="to-[#0A1628]"
      />

      <SectionWrapper background="default" className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 left-8 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-8 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-[1] section-container grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="h-full">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="text-caption uppercase tracking-[0.24em] text-text-muted">Question {currentIndex + 1} of {test.questions.length}</p>
                <h2 className="mt-2 text-h3 font-heading font-bold text-text-primary">{currentQuestion.question}</h2>
              </div>

              <div className="flex items-center gap-3">
                <Timer secondsLeft={secondsLeft} totalSeconds={(test.durationMinutes || 0) * 60} paused={paused} />
                <div>
                  <Button
                    variant="secondary"
                    onClick={() => setPaused((p) => !p)}
                    icon={paused ? <Play size={14} /> : <Pause size={14} />}
                  >
                    {paused ? 'Resume' : 'Pause'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="academic">{test.subject}</Badge>
              <Badge variant="muted">{test.scheme} scheme</Badge>
              <Badge variant="accent">Sem {test.semester}</Badge>
            </div>

            <div className="mt-4">
              <ProgressBar value={secondsLeft / ((test.durationMinutes || 0) * 60 || 1)} />
            </div>

            <div className="mt-6 grid gap-3">
              {currentQuestion.options.map((option, optionIndex) => {
                const isSelected = currentResponse.selectedOption === optionIndex;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(optionIndex)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${isSelected ? 'border-primary bg-primary-soft text-text-primary shadow-[0_0_0_1px_rgba(14,165,233,0.35)]' : 'border-border bg-surface2 text-text-secondary hover:border-primary/60 hover:bg-surface3'}`}
                  >
                    <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-bg text-caption font-semibold text-text-primary">
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => navigateQuestion(-1)} disabled={currentIndex === 0} icon={<ArrowLeft size={16} />}>
                Previous
              </Button>
              <Button variant="secondary" onClick={handleSkip} icon={<SkipForward size={16} />}>
                Skip
              </Button>
              <Button variant="secondary" onClick={handleClear} icon={<TimerReset size={16} />}>
                Clear
              </Button>
              {currentIndex < test.questions.length - 1 ? (
                <Button variant="primary" onClick={() => navigateQuestion(1)} icon={<ArrowRight size={16} />}>
                  Next
                </Button>
              ) : (
                <Button variant="accent" onClick={handleSubmit} icon={<CheckCircle2 size={16} />}>
                  Submit
                </Button>
              )}
            </div>

            {currentQuestion.explanation && (
              <div className="mt-6 rounded-2xl border border-border bg-surface2 p-4">
                <div className="flex items-center gap-2 text-caption uppercase tracking-[0.24em] text-text-muted">
                  <AlertTriangle size={12} />
                  Review note
                </div>
                <p className="mt-2 text-body-sm text-text-secondary">{currentQuestion.explanation}</p>
              </div>
            )}
          </Card>

          <div className="grid gap-6">
            <Card header={<h3 className="text-h4 font-heading font-semibold text-text-primary">Question map</h3>}>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-5 xl:grid-cols-4">
                {questionStates.map((state, index) => {
                  const isActive = index === currentIndex;

                  return (
                    <button
                      key={`${test.id}-${index}`}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className={`rounded-xl border px-0 py-3 text-sm font-semibold transition-all ${stateStyles(state)} ${isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-bg' : ''}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

                <div className="mt-4 grid gap-2 text-body-sm text-text-secondary">
                <div className="flex items-center gap-2"><SquareCheckBig size={14} className="text-emerald-400" /> Answered: {answeredCount}</div>
                <div className="flex items-center gap-2"><SkipForward size={14} className="text-amber-400" /> Skipped: {skippedCount}</div>
                <div className="flex items-center gap-2">Time left: <span className="font-mono">{formatTime(secondsLeft)}</span></div>
              </div>
            </Card>

            <Card>
              <div className="space-y-3 text-body-sm text-text-secondary">
                <p className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" /> Your progress is auto-tracked for admin submission review.</p>
                <p className="flex items-center gap-2"><AlertTriangle size={14} className="text-accent" /> Timer will auto-submit when it reaches zero.</p>
                <p className="flex items-center gap-2"><Clock3 size={14} className="text-primary" /> Start date: {formatDate(test.startDate)}</p>
              </div>
            </Card>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}