import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const defaultServiceAccountPath = path.resolve(repoRoot, 'service-account.json');
const defaultEmail = 'aeistudentassistcell@gmail.com';

function printUsage() {
  console.log('Firebase custom claim setter');
  console.log('');
  console.log('Usage:');
  console.log('  npm run firebase:set-admin-claim -- [email] [service-account-path]');
  console.log('');
  console.log('Examples:');
  console.log(`  npm run firebase:set-admin-claim -- ${defaultEmail}`);
  console.log('  npm run firebase:set-admin-claim -- admin@example.com ./service-account.json');
  console.log('');
  console.log('Notes:');
  console.log('- The user must already exist in Firebase Authentication.');
  console.log('- The user should sign out and sign back in after the claim is set.');
}

function parseArgs(argv) {
  const args = argv.slice(2).filter((value) => value !== '--');
  const [email = defaultEmail, serviceAccountPath = defaultServiceAccountPath] = args;

  return {
    help: args.includes('--help') || args.includes('-h'),
    email,
    serviceAccountPath,
  };
}

async function loadServiceAccount(serviceAccountPath) {
  const absolutePath = path.isAbsolute(serviceAccountPath)
    ? serviceAccountPath
    : path.resolve(repoRoot, serviceAccountPath);

  if (!existsSync(absolutePath)) {
    throw new Error(`Service account file not found: ${absolutePath}`);
  }

  const raw = await fs.readFile(absolutePath, 'utf8');
  const parsed = JSON.parse(raw);

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error('The service account JSON does not contain client_email and private_key.');
  }

  if (typeof parsed.private_key === 'string') {
    parsed.private_key = parsed.private_key.includes('\\n')
      ? parsed.private_key.replace(/\\n/g, '\n')
      : parsed.private_key;
  }

  return parsed;
}

async function main() {
  const { help, email, serviceAccountPath } = parseArgs(process.argv);

  if (help) {
    printUsage();
    return;
  }

  const serviceAccount = await loadServiceAccount(serviceAccountPath);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  const auth = admin.auth();
  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, { admin: true });

  console.log(`Admin claim set for ${email}`);
  console.log('Sign out and sign back in to refresh the ID token.');
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exitCode = 1;
});