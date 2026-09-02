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
  await page.waitForURL(new RegExp(`/admin`), { timeout: 30000 });
}

async function fillTestMetadata(page, fixture, testId, title) {
  await clickByText(page, 'New');
  await page.waitForTimeout(500);

  const idField = page.getByRole('textbox', { name: /Test ID/ });
  
  await idField.fill(testId);
  await page.getByRole('textbox', { name: 'Title' }).fill(title);
  
  // The subject dropdown has a "+ Add New Subject" option with value "__NEW__". 
  // Let's use it for simplicity
  await page.getByRole('combobox', { name: 'Subject' }).selectOption('__NEW__');
  await page.getByPlaceholder('Enter new subject name').fill(fixture.newTest.subject);
  
  await page.getByRole('textbox', { name: 'Scheme' }).fill(String(fixture.newTest.scheme));
  await page.getByRole('spinbutton', { name: 'Semester' }).fill(String(fixture.newTest.semester));
  await page.getByRole('combobox', { name: 'Difficulty' }).selectOption(fixture.newTest.difficulty);
  await page.getByRole('textbox', { name: 'Start date' }).fill(fixture.newTest.startDate);
  
  await page.getByRole('spinbutton', { name: /Duration/ }).fill(String(fixture.newTest.durationMinutes));
}

async function addQuestionBlock(page, question, qIndex) {
  if (qIndex > 0) {
    await clickByText(page, 'Add Question Block');
    await page.waitForTimeout(500); 
  }
  
  const questionBlocks = await page.locator('.rounded-2xl.border.border-border.bg-surface2\\/40').all();
  const currentBlock = questionBlocks[qIndex];
  
  await currentBlock.locator('textarea[placeholder="Enter the question contents..."]').fill(question.question);
  
  for (let i = 0; i < question.options.length; i++) {
    await currentBlock.locator(`input[placeholder="Enter option ${String.fromCharCode(65 + i)}"]`).fill(question.options[i]);
  }
  
  await currentBlock.locator('input[type="radio"]').nth(question.correctAnswer).check();
  
  if (question.explanation) {
    await currentBlock.locator('input[placeholder="Why is this the correct answer?"]').fill(question.explanation);
  }
}

async function saveTest(page, expectedTitle) {
  await clickByText(page, 'Save Mock Test');
  try {
    await page.getByText(`Saved test "${expectedTitle}"`).waitFor({ timeout: 8000 });
  } catch (e) {
    const text = await page.locator('body').innerText();
    throw new Error(`Failed to save test. Page text: ${text}`);
  }
}

async function takeTestAsStudent(context, fixture, testId) {
  const page = await context.newPage();
  const testResults = { testId, score: 0, totalQuestions: 0 };
  
  try {
    console.log(`Starting test: ${testId}`);
    await page.goto(`${fixture.baseUrl}/mock-tests/${testId}`);
    
    const notFound = await page.getByText('Mock test not found').count();
    if (notFound > 0) {
      throw new Error(`Test ${testId} not found on student side.`);
    }

    try {
      await page.getByText(/Question 1 of/i).waitFor({ timeout: 15000 });
    } catch (e) {
      const text = await page.locator('body').innerText();
      throw new Error(`Test ${testId} failed to load on student side. Body text: ${text}`);
    }

    const progressText = await page.getByText(/Question \d+ of \d+/i).first().innerText();
    const totalQuestionsMatch = progressText.match(/of (\d+)/i);
    const totalQuestions = totalQuestionsMatch ? parseInt(totalQuestionsMatch[1], 10) : 1;
    testResults.totalQuestions = totalQuestions;

    for (let i = 0; i < totalQuestions; i++) {
      const optionButtons = await page.locator('button.w-full.rounded-2xl.border').all();
      if (optionButtons.length > 0) {
        const optionA = optionButtons[0];
        await optionA.click();
      }
      
      if (i < totalQuestions - 1) {
        await clickByText(page, 'Next');
      } else {
        await clickByText(page, 'Submit');
      }
    }
    
    await page.waitForURL(/\/results$/, { timeout: 10000 });
    
    const scoreElement = await page.locator('p.text-5xl.font-heading.font-bold').first().innerText();
    const scoreMatch = scoreElement.match(/^(\d+)/);
    if (scoreMatch) {
      testResults.score = parseInt(scoreMatch[1], 10);
    }
    
    console.log(`Completed test ${testId}, score: ${testResults.score}/${totalQuestions}`);
    
  } finally {
    await page.close();
  }
  
  return testResults;
}

async function run() {
  const root = process.cwd();
  const fixturePath = path.join(root, 'scripts', 'e2e', 'fixtures', 'admin-ui-crud.fixture.json');
  const reportDir = path.join(root, 'scripts', 'e2e', 'reports');
  ensureDir(reportDir);

  const fixture = readJson(fixturePath);
  
  const result = {
    startedAt: new Date().toISOString(),
    ok: false,
    baseUrl: fixture.baseUrl,
    createdTests: [],
    studentResults: [],
  };

  const browser = await chromium.launch({ headless: true });
  const adminContext = await browser.newContext();
  const studentContext = await browser.newContext();
  const adminPage = await adminContext.newPage();

  try {
    console.log('Logging into admin panel...');
    await login(adminPage, fixture);
    
    for (let i = 1; i <= 3; i++) {
      const timestamp = Date.now();
      const testId = `e2e-auto-test-${i}-${timestamp}`;
      const title = `E2E Mock Test ${i} ${timestamp}`;
      
      console.log(`Creating test ${i}: ${title}`);
      await adminPage.goto(`${fixture.baseUrl}/admin/manage-tests`);
      
      // Wait for initial load
      await adminPage.waitForSelector('text=Mock Exams', { state: 'visible', timeout: 15000 });
      await adminPage.waitForTimeout(1500); // let React settle
      
      await fillTestMetadata(adminPage, fixture, testId, title);
      
      for (let q = 0; q < 2; q++) {
        await addQuestionBlock(adminPage, fixture.questions[0], q);
      }
      
      await saveTest(adminPage, title);
      result.createdTests.push(testId);
    }
    
    console.log('Finished creating tests. Authenticating student context as a workaround until rules are deployed...');
    
    await new Promise(r => setTimeout(r, 2000));
    const studentAuthPage = await studentContext.newPage();
    await login(studentAuthPage, fixture);
    await studentAuthPage.close();
    
    console.log('Starting student execution...');
    for (const testId of result.createdTests) {
      const testResult = await takeTestAsStudent(studentContext, fixture, testId);
      result.studentResults.push(testResult);
    }
    
    console.log('Cleaning up generated tests...');
    await adminPage.goto(`${fixture.baseUrl}/admin/manage-tests`);
    for (const testId of result.createdTests) {
      try {
        adminPage.once('dialog', dialog => dialog.accept());
        await adminPage.getByText(testId).locator('xpath=ancestor::div[contains(@class, "w-full rounded-2xl")]').getByRole('button', { name: 'Delete' }).click();
        await adminPage.getByText(`Deleted test ${testId}.`).waitFor({ timeout: 15000 });
      } catch (e) {
        console.warn(`Failed to cleanup test ${testId}:`, e.message);
      }
    }

    result.ok = true;
  } catch (error) {
    result.error = String(error?.message || error);
    console.error(error);
  } finally {
    result.finishedAt = new Date().toISOString();
    await adminContext.close();
    await studentContext.close();
    await browser.close();
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `generate-take-${stamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf8');

  console.log(JSON.stringify({ ok: result.ok, report: path.relative(root, jsonPath), scores: result.studentResults }, null, 2));

  if (!result.ok) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
