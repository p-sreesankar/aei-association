import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

async function main(){
  const saPath = path.resolve(process.cwd(), 'service-account.json');
  const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const db = admin.firestore();

  const snaps = await db.collection('mockTestSubmissions')
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get();

  const items = [];
  snaps.forEach(doc => {
    const data = doc.data();
    items.push({ id: doc.id, ...data });
  });

  console.log(JSON.stringify(items, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
