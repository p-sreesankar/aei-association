import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function toOptionsText(options) {
  return options.join('\n');
}

async function clickByText(page, text) {
  await page.getByRole('button', { name: text }).first().dispatchEvent('click');
}

async function login(page, fixture) {
  const email = process.env[fixture.adminEmailEnv];
  const password = process.env[fixture.adminPasswordEnv];

  if (!email || !password) {
    throw new Error(`Missing admin credentials. Set ${fixture.adminEmailEnv} and ${fixture.adminPasswordEnv}.`);
  }

  await page.goto(`${fixture.baseUrl}${fixture.loginPath}`);
  await page.getByRole('textbox', { name: 'Email Address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await clickByText(page, 'Sign In');
  await page.waitForURL(new RegExp(`${fixture.manageTestsPath.replace('/', '\\/')}`), { timeout: 30000 });
}

async function fillTestMetadata(page, fixture, testId, title) {
  await clickByText(page, 'New');

  const idField = page.getByRole('textbox', { name: 'Test ID Generate' });
  const idValue = await idField.inputValue();
  if (idValue !== '') {
    throw new Error(`Expected blank draft after New. Got Test ID: ${idValue}`);
  }

  await idField.fill(testId);
  await page.getByRole('textbox', { name: 'Title' }).fill(title);
  await page.getByRole('textbox', { name: 'Subject' }).fill(fixture.newTest.subject);
  await page.getByRole('textbox', { name: 'Scheme' }).fill(String(fixture.newTest.scheme));
  await page.getByRole('spinbutton', { name: 'Semester' }).fill(String(fixture.newTest.semester));
  await page.getByRole('combobox', { name: 'Difficulty' }).selectOption(fixture.newTest.difficulty);
  await page.getByRole('textbox', { name: 'Start date' }).fill(fixture.newTest.startDate);
  await page.getByRole('textbox', { name: 'End date' }).fill(fixture.newTest.endDate);
  await page.getByRole('spinbutton', { name: 'Duration minutes' }).fill(String(fixture.newTest.durationMinutes));
  await page.getByRole('spinbutton', { name: 'Total marks' }).fill(String(fixture.newTest.totalMarks));
}

async function addQuestion(page, question) {
  await page.getByRole('textbox', { name: 'Question ID' }).fill(question.id);
  await page.getByRole('combobox', { name: 'Type' }).selectOption(question.type);
  await page.getByRole('textbox', { name: 'Question text' }).fill(question.question);
  await page.getByRole('textbox', { name: 'Options (one per line)' }).fill(toOptionsText(question.options));
  await page.getByRole('spinbutton', { name: 'Correct answer index (0-based)' }).fill(String(question.correctAnswer));
  await page.getByRole('textbox', { name: 'Explanation (optional)' }).fill(question.explanation || '');
  await clickByText(page, 'Add question');
  await page.getByText('Question added to draft.').waitFor({ timeout: 10000 });
}

async function saveTest(page, expectedTitle) {
  await clickByText(page, 'Save test');
  await page.getByText(`Saved ${expectedTitle}.`).waitFor({ timeout: 25000 });
}

async function run() {
  const root = process.cwd();
  const fixturePath = path.join(root, 'scripts', 'e2e', 'fixtures', 'admin-ui-crud.fixture.json');
  const reportDir = path.join(root, 'scripts', 'e2e', 'reports');
  ensureDir(reportDir);

  const fixture = readJson(fixturePath);
  const timestamp = Date.now();
  const testId = `${fixture.newTest.idPrefix}-${timestamp}`;
  const title = `${fixture.newTest.titlePrefix} ${timestamp}`;
  const editedTitle = `${title} Edited`;

  const result = {
    startedAt: new Date().toISOString(),
    ok: false,
    baseUrl: fixture.baseUrl,
    testId,
    title,
    editedTitle,
    steps: [],
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await login(page, fixture);
    result.steps.push('login');

    await page.goto(`${fixture.baseUrl}${fixture.manageTestsPath}`);
    result.steps.push('open-manage-tests');

    await fillTestMetadata(page, fixture, testId, title);
    result.steps.push('fill-test-metadata');

    await addQuestion(page, fixture.questions[0]);
    result.steps.push('question-create');

    await saveTest(page, title);
    result.steps.push('test-create');

    await page.getByText('Q1 • mcq').first().locator('../..').getByRole('button', { name: 'Edit' }).dispatchEvent('click');
    await page.getByRole('textbox', { name: 'Question text' }).fill('What does CRUD stand for in admin tools?');
    await clickByText(page, 'Update question');
    await page.getByText('Question updated in draft.').waitFor({ timeout: 10000 });
    result.steps.push('question-edit');

    await page.getByText('Q1 • mcq').first().locator('../..').getByRole('button', { name: 'Delete' }).dispatchEvent('click');
    await page.getByText('Question removed from draft. Save test to persist changes.').waitFor({ timeout: 10000 });
    result.steps.push('question-delete');

    await addQuestion(page, fixture.questions[1]);
    result.steps.push('question-recreate');

    await page.getByRole('textbox', { name: 'Title' }).fill(editedTitle);
    await saveTest(page, editedTitle);
    result.steps.push('test-edit');

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Delete' }).first().dispatchEvent('click');
    await page.getByText(`Deleted ${testId}.`).waitFor({ timeout: 25000 });
    result.steps.push('test-delete');

    result.ok = true;
  } catch (error) {
    result.error = String(error?.message || error);
  } finally {
    result.finishedAt = new Date().toISOString();
    await context.close();
    await browser.close();
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `admin-ui-crud-${stamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf8');

  console.log(JSON.stringify({ ok: result.ok, report: path.relative(root, jsonPath), testId: result.testId }, null, 2));

  if (!result.ok) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
