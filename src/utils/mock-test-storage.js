const SUBMISSIONS_STORAGE_KEY = 'aei-mock-test-submissions';
const CUSTOM_TESTS_STORAGE_KEY = 'aei-mock-test-custom-tests';

function cloneQuestion(question) {
  return {
    ...question,
    options: Array.isArray(question.options) ? [...question.options] : [],
  };
}

function cloneTest(test) {
  return {
    ...test,
    questions: Array.isArray(test.questions) ? test.questions.map(cloneQuestion) : [],
  };
}

function readJson(key, fallback) {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function getMockTestCatalog(baseTests) {
  const storedCatalog = readJson(CUSTOM_TESTS_STORAGE_KEY, null);

  if (Array.isArray(storedCatalog) && storedCatalog.length > 0) {
    return storedCatalog.map(cloneTest);
  }

  return baseTests.map(cloneTest);
}

function saveMockTestCatalog(tests) {
  return writeJson(CUSTOM_TESTS_STORAGE_KEY, tests.map(cloneTest));
}

function getMockTestSubmissions() {
  const submissions = readJson(SUBMISSIONS_STORAGE_KEY, []);
  return Array.isArray(submissions) ? submissions : [];
}

function saveMockTestSubmission(submission) {
  const nextSubmissions = [submission, ...getMockTestSubmissions()].slice(0, 100);
  writeJson(SUBMISSIONS_STORAGE_KEY, nextSubmissions);
  return nextSubmissions;
}

function setMockTestSubmissions(submissions) {
  return writeJson(SUBMISSIONS_STORAGE_KEY, submissions);
}

export {
  CUSTOM_TESTS_STORAGE_KEY,
  SUBMISSIONS_STORAGE_KEY,
  getMockTestCatalog,
  getMockTestSubmissions,
  saveMockTestCatalog,
  saveMockTestSubmission,
  setMockTestSubmissions,
};