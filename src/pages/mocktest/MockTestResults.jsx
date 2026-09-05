/**
 * MockTestResults - Standalone results page for mock test submissions
 * @component
 * @description Displays the submission summary after completing a mock test.
 * Can be accessed directly via URL with results passed via navigation state.
 */
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, BookOpen, Check, X } from 'lucide-react';
import { Badge, Button, Card, EmptyState, PageBanner } from '@components/ui';
import { SectionWrapper } from '@components/layout';
import SEO from '@components/SEO';
import { formatDate } from '@utils/date';
import { getLatestMockTestSubmission } from '@utils/mock-test-storage';

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
  const [showAnswerKey, setShowAnswerKey] = useState(false);

  useEffect(() => {
    if (submission) {
      setLoading(false);
      return;
    }

    if (testId) {
      setSubmission(getLatestMockTestSubmission(testId));
    }
    setLoading(false);
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
              subtitle="We couldn't find a saved attempt for this browser. Open the test again and finish it here to view the result."
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

  const percentage = calculatePercentage(submission.score, submission.totalMarks || submission.totalQuestions);
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
                    /{submission.totalMarks || submission.totalQuestions}
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
              {submission.questions && (
                <Button
                  variant={showAnswerKey ? 'secondary' : 'accent'}
                  onClick={() => setShowAnswerKey(!showAnswerKey)}
                  icon={showAnswerKey ? <EyeOff size={16} /> : <Eye size={16} />}
                >
                  {showAnswerKey ? 'Hide Answer Key' : 'View Answer Key'}
                </Button>
              )}
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
                    {submission.submittedBy || 'Anonymous learner'}
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

        {/* Answer Key Section */}
        {showAnswerKey && submission.questions && (
          <div className="section-container mt-6">
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <BookOpen size={24} className="text-primary" />
                <h2 className="text-h3 font-heading font-bold text-text-primary">
                  Answer Key & Explanations
                </h2>
              </div>

              <div className="space-y-4">
                {submission.questions.map((question, index) => {
                  const userAnswer = submission.answers?.[index];
                  const userSelected = userAnswer?.selectedOption;
                  const wasSkipped = userAnswer?.skipped;
                  const isCorrect = userSelected === question.correctAnswer;

                  return (
                    <div
                      key={question.id || index}
                      className={`rounded-2xl border p-4 ${
                        isCorrect
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : 'border-red-500/30 bg-red-500/5'
                      }`}
                    >
                      {/* Question header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isCorrect
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {isCorrect ? <Check size={16} /> : <X size={16} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-caption uppercase tracking-[0.12em] text-text-muted">
                              Question {index + 1}
                            </p>
                            <Badge variant="muted" size="sm">{question.marks || 1} {Number(question.marks) === 1 || !(question.marks) ? 'mark' : 'marks'}</Badge>
                          </div>
                          <p className="text-body font-medium text-text-primary">
                            {question.question}
                          </p>
                        </div>
                      </div>

                      {/* Options */}
                      <div className="ml-11 space-y-2">
                        {question.options.map((option, optionIndex) => {
                          const isCorrectOption = optionIndex === question.correctAnswer;
                          const isUserOption = optionIndex === userSelected;
                          const optionLetter = String.fromCharCode(65 + optionIndex);

                          return (
                            <div
                              key={optionIndex}
                              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-body-sm ${
                                isCorrectOption
                                  ? 'bg-emerald-500/15 text-emerald-300 font-medium'
                                  : isUserOption && !isCorrectOption
                                  ? 'bg-red-500/15 text-red-300 line-through'
                                  : 'text-text-secondary'
                              }`}
                            >
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                                isCorrectOption
                                  ? 'bg-emerald-500/30'
                                  : 'bg-surface2'
                              }`}>
                                {optionLetter}
                              </span>
                              <span className="flex-1">{option}</span>
                              {isCorrectOption && (
                                <Badge variant="success" size="sm">Correct</Badge>
                              )}
                              {isUserOption && !isCorrectOption && (
                                <Badge variant="error" size="sm">Your Answer</Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* User's status */}
                      <div className="ml-11 mt-3">
                        {wasSkipped && (
                          <p className="text-body-sm text-amber-400">
                            <span className="font-medium">You skipped this question.</span>
                          </p>
                        )}
                        {userSelected === null && !wasSkipped && (
                          <p className="text-body-sm text-text-muted">
                            <span className="font-medium">You did not answer this question.</span>
                          </p>
                        )}
                      </div>

                      {/* Explanation */}
                      {question.explanation && (
                        <div className="ml-11 mt-4 rounded-xl border border-border bg-surface2 p-4">
                          <p className="text-caption uppercase tracking-[0.12em] text-text-muted mb-2 flex items-center gap-2">
                            <BookOpen size={12} />
                            Explanation
                          </p>
                          <p className="text-body-sm text-text-secondary">
                            {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
      </SectionWrapper>
    </>
  );
}