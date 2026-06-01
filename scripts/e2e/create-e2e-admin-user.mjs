import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

async function main(){
  const saPath = path.resolve(process.cwd(), 'service-account.json');
  const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

  const timestamp = Date.now();
  const email = `e2e-admin+${timestamp}@example.com`;
  const password = `AdminPass!${timestamp.toString().slice(-4)}`;

  const userRecord = await admin.auth().createUser({ email, password, displayName: 'E2E Admin' });
  await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });

  console.log('Created admin user:', email);
  console.log('Password:', password);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
