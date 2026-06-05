/**
 * MockTestResults - Standalone results page for mock test submissions
 * @component
 * @description Displays the submission summary after completing a mock test.
 * Can be accessed directly via URL with results passed via navigation state.
 */
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Badge, Button, Card, EmptyState, PageBanner } from '@components/ui';
import { SectionWrapper } from '@components/layout';
import SEO from '@components/SEO';
import { formatDate } from '@utils/date';

/**
 * Calculates the percentage score
 * @param {number} score
 * @param {number} total
 * @returns {number}
 */
function calculatePercentage(score, total) {
  return total > 0 ? Math.round((score / total) * 100) : 0;
}

/**
 * Determines grade based on percentage
 * @param {number} percentage
 * @returns {{ grade: string, color: string }}
 */
function getGradeInfo(percentage) {
  if (percentage >= 90) return { grade: 'A+', color: 'text-emerald-400' };
  if (percentage >= 80) return { grade: 'A',  color: 'text-emerald-400' };
  if (percentage >= 70) return { grade: 'B+', color: 'text-sky-400' };
  if (percentage >= 60) return { grade: 'B',  color: 'text-sky-400' };
  if (percentage >= 50) return { grade: 'C',  color: 'text-amber-400' };
  return { grade: 'F', color: 'text-red-400' };
}

export default function MockTestResults() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { testId } = useParams();

  const [submission, setSubmission] = useState(state?.submission || null);
  const [loading, setLoading] = useState(!state?.submission);

  // Try to load from local storage if not in navigation state
  useEffect(() => {
    if (!submission && testId) {
      // For now, if no submission in state, show a message
      // In production, this could fetch from Firestore or local storage
      setLoading(false);
    }
  }, [testId, submission]);

  if (loading) {
    return (
      <SectionWrapper background="default">
        <Card>
          <EmptyState
            icon="loading"
            title="Loading results..."
            subtitle="Please wait while we retrieve your submission."
          />
        </Card>
      </SectionWrapper>
    );
  }

  if (!submission) {
    return (
      <>
        <SEO title="Results Not Found" />
        <SectionWrapper background="default">
          <Card>
            <EmptyState
              icon="search"
              title="Results not found"
              subtitle="We couldn't find your submission. It may have expired or you may need to complete the test again."
              action={
                <Button variant="primary" onClick={() => navigate('/mock-tests')}>
                  Back to Mock Tests
                </Button>
              }
            />
          </Card>
        </SectionWrapper>
      </>
    );
  }

  const percentage = calculatePercentage(submission.score, submission.totalQuestions);
  const gradeInfo = getGradeInfo(percentage);

  return (
    <>
      <SEO title={`${submission.testTitle || 'Test'} Results`} />
      <PageBanner
        title={submission.testTitle || 'Test Results'}
        subtitle="Your submission has been recorded. Review your performance below."
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Mock Tests', path: '/mock-tests' },
          { label: 'Results', path: `/mock-tests/${testId}/results` },
        ]}
        gradientFrom="from-[#0C1D34]"
        gradientTo="to-[#0A1628]"
      />

      <SectionWrapper background="default">
        <div className="section-container grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main score card */}
          <Card className="h-full">
            <div className="mb-6 text-center">
              <Badge variant="success" size="lg">Submission Complete</Badge>
              <h2 className="mt-4 text-h2 font-heading font-bold text-text-primary">
                Your Score
              </h2>
            </div>

            {/* Score display */}
            <div className="flex items-center justify-center gap-8 py-8">
              <div className="text-center">
                <p className={`text-7xl font-heading font-bold ${gradeInfo.color}`}>
                  {gradeInfo.grade}
                </p>
                <p className="mt-2 text-body-sm text-text-muted">Grade</p>
              </div>
              <div className="h-24 w-px bg-border" />
              <div className="text-center">
                <p className="text-5xl font-heading font-bold text-text-primary">
                  {submission.score}
                  <span className="text-3xl text-text-muted">
                    /{submission.totalQuestions}
                  </span>
                </p>
                <p className="mt-2 text-body-sm text-text-muted">
                  {percentage}% Correct
                </p>
              </div>
            </div>

            {/* Answer breakdown */}
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                <p className="text-h3 font-heading font-bold text-emerald-400">
                  {submission.answers?.filter(a => !a.skipped && a.selectedOption !== null).length || 0}
                </p>
                <p className="mt-1 text-body-sm text-text-secondary">Answered</p>
              </div>
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
                <p className="text-h3 font-heading font-bold text-amber-400">
                  {submission.answers?.filter(a => a.skipped).length || 0}
                </p>
                <p className="mt-1 text-body-sm text-text-secondary">Skipped</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface2 p-4 text-center">
                <p className="text-h3 font-heading font-bold text-text-primary">
                  {submission.answers?.filter(a => a.selectedOption === null && !a.skipped).length || 0}
                </p>
                <p className="mt-1 text-body-sm text-text-secondary">Unanswered</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate('/mock-tests')}
                icon={<ArrowLeft size={16} />}
              >
                Back to Tests
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate(`/mock-tests/${testId}`)}
                icon={<ArrowRight size={16} />}
              >
                Retry This Test
              </Button>
            </div>
          </Card>

          {/* Details sidebar */}
          <div className="space-y-6">
            <Card header={<h3 className="text-h4 font-heading font-semibold">Submission Details</h3>}>
              <div className="space-y-4 text-body-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Subject</span>
                  <span className="text-text-primary">{submission.testSubject || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Total Marks</span>
                  <span className="text-text-primary">{submission.totalMarks || submission.totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Time Limit</span>
                  <span className="text-text-primary">{submission.durationMinutes || 30} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Submitted</span>
                  <span className="text-text-primary">
                    {submission.submittedAt ? formatDate(submission.submittedAt) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Submitted By</span>
                  <span className="text-text-primary truncate max-w-[150px]">
                    {submission.submittedBy || 'Anonymous'}
                  </span>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-start gap-3 text-body-sm text-text-secondary">
                <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-primary" />
                <p>
                  Your responses have been saved and are available for review by administrators.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}