import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RotateCcw, ShieldCheck } from 'lucide-react';
import SEO from '@components/SEO';
import { SectionWrapper } from '@components/layout';
import { Badge, Button, Card, EmptyState, PageBanner } from '@components/ui';
import { MOCK_TESTS } from '@data/mock-tests';
import { formatDate } from '@utils/date';
import { fetchMockTestCatalog, fetchSubmissions } from '@/services/firestore-mock-tests';
import { getMockTestCatalog } from '@utils/mock-test-storage';
import { useAuth } from '@hooks/useAuth';

function percent(score, total) {
  if (!total) return 0;
  return Math.round((score / total) * 100);
}

export default function TestResults() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const [test, setTest] = useState(null);
  const [submission, setSubmission] = useState(location.state?.submission || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const catalog = await fetchMockTestCatalog();
        const found = catalog.find((item) => item.id === testId) || getMockTestCatalog(MOCK_TESTS).find((item) => item.id === testId) || null;
        if (!cancelled) setTest(found);

        if (!submission) {
          const allSubmissions = await fetchSubmissions(testId);
          const byUser = user?.uid ? allSubmissions.filter((entry) => entry.submittedByUid === user.uid) : allSubmissions;
          if (!cancelled) setSubmission(byUser[0] || allSubmissions[0] || null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [submission, testId, user?.uid]);

  const summary = useMemo(() => {
    if (!submission || !test) return null;
    const totalQuestions = submission.totalQuestions || test.questions?.length || 0;
    const score = submission.score || 0;
    const accuracy = percent(score, totalQuestions);
    const answers = Array.isArray(submission.answers) ? submission.answers : [];
    const correct = answers.filter((answer, index) => !answer?.skipped && answer.selectedOption === test.questions?.[index]?.correctAnswer).length;
    const skipped = answers.filter((answer) => answer?.skipped).length;
    const wrong = Math.max(totalQuestions - correct - skipped, 0);

    return { totalQuestions, score, accuracy, correct, wrong, skipped };
  }, [submission, test]);

  if (loading) {
    return (
      <SectionWrapper background="default">
        <Card>
          <EmptyState icon="search" title="Loading results..." subtitle="Please wait while we fetch the latest submission." />
        </Card>
      </SectionWrapper>
    );
  }

  if (!test || !summary || !submission) {
    return (
      <>
        <SEO title="Mock Test Results" description="Mock test results could not be located." />
        <SectionWrapper background="default">
          <Card>
            <EmptyState
              icon="inbox"
              title="No submission found"
              subtitle="Take a mock test first or open the results immediately after submitting the quiz."
              action={(
                <Button variant="primary" onClick={() => navigate('/mock-tests')}>
                  Return to tests
                </Button>
              )}
            />
          </Card>
        </SectionWrapper>
      </>
    );
  }

  const answers = Array.isArray(submission.answers) ? submission.answers : [];

  return (
    <>
      <SEO title={`${test.title} Results`} description="Review your score, answer breakdown, and performance summary." />

      <PageBanner
        title={`${test.title} Results`}
        subtitle="Review your performance summary and jump back into the test catalog or admin tools."
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Mock Tests', path: '/mock-tests' },
          { label: 'Results', path: `/mock-tests/${test.id}/results` },
        ]}
        gradientFrom="from-[#0C1D34]"
        gradientTo="to-[#0A1628]"
      />

      <SectionWrapper background="default">
        <div className="section-container space-y-6">
          <div className="grid gap-4 lg:grid-cols-4">
            <Card>
              <p className="text-caption uppercase tracking-[0.24em] text-text-muted">Score</p>
              <p className="mt-2 text-4xl font-heading font-bold text-text-primary">{summary.score}/{summary.totalQuestions}</p>
              <p className="mt-1 text-body-sm text-text-secondary">{summary.accuracy}% correct</p>
            </Card>
            <Card>
              <p className="text-caption uppercase tracking-[0.24em] text-text-muted">Correct</p>
              <p className="mt-2 text-4xl font-heading font-bold text-emerald-300">{summary.correct}</p>
              <p className="mt-1 text-body-sm text-text-secondary">Answered accurately</p>
            </Card>
            <Card>
              <p className="text-caption uppercase tracking-[0.24em] text-text-muted">Wrong</p>
              <p className="mt-2 text-4xl font-heading font-bold text-rose-300">{summary.wrong}</p>
              <p className="mt-1 text-body-sm text-text-secondary">Incorrect responses</p>
            </Card>
            <Card>
              <p className="text-caption uppercase tracking-[0.24em] text-text-muted">Skipped</p>
              <p className="mt-2 text-4xl font-heading font-bold text-amber-300">{summary.skipped}</p>
              <p className="mt-1 text-body-sm text-text-secondary">Not attempted</p>
            </Card>
          </div>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-h3 font-heading font-bold text-text-primary">Submission Overview</h3>
                <p className="mt-1 text-body-sm text-text-secondary">Submitted by {submission.submittedBy} on {new Date(submission.submittedAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="academic">{test.scheme} scheme</Badge>
                <Badge variant="primary">Sem {test.semester}</Badge>
                {isAdmin && <Badge variant="warning"><ShieldCheck size={12} className="mr-1" />Admin preview</Badge>}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant="primary" onClick={() => navigate('/mock-tests')} icon={<ArrowLeft size={16} />}>
                Back to tests
              </Button>
              <Button variant="secondary" onClick={() => navigate(`/mock-tests/${test.id}`)} icon={<RotateCcw size={16} />}>
                Retry test
              </Button>
              {isAdmin && (
                <Button variant="accent" onClick={() => navigate('/admin')}>
                  Admin dashboard
                </Button>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-h3 font-heading font-bold text-text-primary">Answer Breakdown</h3>
            <div className="mt-4 space-y-4">
              {test.questions.map((question, index) => {
                const answer = answers[index] || {};
                const state = answer.skipped
                  ? 'Skipped'
                  : answer.selectedOption === question.correctAnswer
                    ? 'Correct'
                    : 'Incorrect';

                return (
                  <div key={question.id || index} className="rounded-2xl border border-border bg-surface2 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-caption uppercase tracking-[0.22em] text-text-muted">Question {index + 1}</p>
                        <h4 className="mt-1 text-h4 font-heading font-semibold text-text-primary">{question.question}</h4>
                      </div>
                      <Badge variant={state === 'Correct' ? 'success' : state === 'Incorrect' ? 'urgent' : 'warning'}>
                        {state}
                      </Badge>
                    </div>

                    <div className="mt-4 grid gap-2 text-body-sm text-text-secondary">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-bg px-3 py-1 text-text-muted">Your answer: {answer.selectedOption !== null && answer.selectedOption !== undefined ? question.options[answer.selectedOption] : 'Not answered'}</span>
                        <span className="rounded-full bg-bg px-3 py-1 text-text-muted">Correct answer: {question.options[question.correctAnswer]}</span>
                      </div>
                      {question.explanation && (
                        <p className="rounded-xl border border-border bg-bg/80 p-3 text-text-secondary">{question.explanation}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <p className="text-caption uppercase tracking-[0.24em] text-text-muted">Accuracy</p>
              <p className="mt-2 text-3xl font-heading font-bold text-text-primary">{summary.accuracy}%</p>
              <p className="mt-1 text-body-sm text-text-secondary">Overall score percentage</p>
            </Card>
            <Card>
              <p className="text-caption uppercase tracking-[0.24em] text-text-muted">Format</p>
              <p className="mt-2 text-3xl font-heading font-bold text-text-primary">{formatDate(test.startDate)}</p>
              <p className="mt-1 text-body-sm text-text-secondary">Test launch date</p>
            </Card>
            <Card>
              <p className="text-caption uppercase tracking-[0.24em] text-text-muted">Mode</p>
              <p className="mt-2 text-3xl font-heading font-bold text-text-primary">Timed</p>
              <p className="mt-1 text-body-sm text-text-secondary">{test.durationMinutes} minutes</p>
            </Card>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}