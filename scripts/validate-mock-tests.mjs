import { MOCK_TESTS } from '../src/data/mock-tests.js';

const REQUIRED_FIELDS = ['id', 'title', 'subject', 'scheme', 'semester', 'difficulty', 'startDate', 'durationMinutes', 'totalMarks', 'questions'];
const ALLOWED_DIFFICULTY = new Set(['easy', 'medium', 'hard']);

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function validateTests(tests) {
  const errors = [];
  const warnings = [];
  const seenIds = new Set();

  tests.forEach((test, testIndex) => {
    const prefix = `index ${testIndex} (id: ${test?.id || 'missing'})`;

    for (const field of REQUIRED_FIELDS) {
      if (test == null || test[field] == null || `${test[field]}`.trim() === '') {
        errors.push(`${prefix}: missing required field '${field}'.`);
      }
    }

    if (typeof test?.id !== 'string' || test.id.trim() === '') {
      errors.push(`${prefix}: id must be a non-empty string.`);
    } else if (seenIds.has(test.id)) {
      errors.push(`${prefix}: duplicate id '${test.id}'.`);
    } else {
      seenIds.add(test.id);
    }

    if (!ALLOWED_DIFFICULTY.has(test?.difficulty)) {
      errors.push(`${prefix}: invalid difficulty '${test?.difficulty}'.`);
    }

    if (!isValidDate(test?.startDate)) {
      errors.push(`${prefix}: invalid startDate '${test?.startDate}', expected YYYY-MM-DD.`);
    }

    if (test?.endDate && !isValidDate(test.endDate)) {
      errors.push(`${prefix}: invalid endDate '${test.endDate}', expected YYYY-MM-DD.`);
    }

    if (!isPositiveInteger(Number(test?.durationMinutes))) {
      errors.push(`${prefix}: durationMinutes must be a positive integer.`);
    }

    if (!isPositiveInteger(Number(test?.totalMarks))) {
      errors.push(`${prefix}: totalMarks must be a positive integer.`);
    }

    if (!Array.isArray(test?.questions) || test.questions.length === 0) {
      errors.push(`${prefix}: questions must be a non-empty array.`);
      return;
    }

    const questionIds = new Set();
    test.questions.forEach((question, questionIndex) => {
      const qPrefix = `${prefix} question ${questionIndex}`;

      if (!question || typeof question !== 'object') {
        errors.push(`${qPrefix}: question must be an object.`);
        return;
      }

      if (typeof question.id !== 'string' || question.id.trim() === '') {
        errors.push(`${qPrefix}: question id must be a non-empty string.`);
      } else if (questionIds.has(question.id)) {
        errors.push(`${qPrefix}: duplicate question id '${question.id}'.`);
      } else {
        questionIds.add(question.id);
      }

      if (typeof question.question !== 'string' || question.question.trim() === '') {
        errors.push(`${qPrefix}: question text must be a non-empty string.`);
      }

      if (!Array.isArray(question.options) || question.options.length < 2) {
        errors.push(`${qPrefix}: options must be an array with at least two entries.`);
      } else {
        const optionSet = new Set();
        question.options.forEach((option, optionIndex) => {
          if (typeof option !== 'string' || option.trim() === '') {
            errors.push(`${qPrefix}: option ${optionIndex} must be a non-empty string.`);
          }

          const normalized = `${option}`.trim().toLowerCase();
          if (optionSet.has(normalized)) {
            errors.push(`${qPrefix}: duplicate option '${option}'.`);
          } else {
            optionSet.add(normalized);
          }
        });
      }

      if (!Number.isInteger(question.correctAnswer)) {
        errors.push(`${qPrefix}: correctAnswer must be an integer index.`);
      } else if (Array.isArray(question.options) && (question.correctAnswer < 0 || question.correctAnswer >= question.options.length)) {
        errors.push(`${qPrefix}: correctAnswer index ${question.correctAnswer} is out of range.`);
      }
    });

    if (test.endDate && isValidDate(test.startDate) && new Date(`${test.endDate}T00:00:00Z`) < new Date(`${test.startDate}T00:00:00Z`)) {
      warnings.push(`${prefix}: endDate is earlier than startDate.`);
    }
  });

  return { errors, warnings };
}

const result = validateTests(MOCK_TESTS);

console.log('Mock test validation summary');
if (result.warnings.length > 0) {
  console.log(`Warnings (${result.warnings.length}):`);
  for (const warning of result.warnings) {
    console.log(`- ${warning}`);
  }
}

if (result.errors.length > 0) {
  console.error(`Errors (${result.errors.length}):`);
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('All mock test validations passed.');