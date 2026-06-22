require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}
const db = admin.firestore();

async function check() {
  const q = await db.collection('questions').get();
  console.log('Questions:', q.size);
  const p = await db.collection('players').get();
  console.log('Players:', p.size);
  const m = await db.collection('members').get();
  console.log('Members:', m.size);

  if (!q.empty) {
    const first = q.docs[0];
    console.log('First Q:', JSON.stringify(first.data()));
    const ans = await db.collection('questions').doc(first.id).collection('answers').get();
    console.log('Answers subcoll:', ans.size);
  }
  process.exit(0);
}
check().catch(e => { console.error(e.message); process.exit(1); });
