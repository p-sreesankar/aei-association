import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

async function main(){
  const saPath = path.resolve(process.cwd(), 'service-account.json');
  const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const db = admin.firestore();

  const docRef = db.collection('mockTests').doc();
  const now = Date.now();
  const testDoc = {
    title: `E2E Auto Test ${now}`,
    description: 'Automatically created test for E2E checks',
    durationSeconds: 600,
    questions: [
      {
        id: 'q1',
        text: 'What is 2 + 2?',
        options: ['1', '2', '3', '4'],
        correctIndex: 3
      }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await docRef.set(testDoc);
  console.log('Created mockTest id:', docRef.id);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
