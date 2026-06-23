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
  const snap = await db.collection('responses').get();
  console.log(snap.size + ' responses in Firestore:');
  snap.docs.forEach(d => {
    const r = d.data();
    console.log(`  ${r.display_name}: "${r.raw_answer}" → ${r.matched_answer || 'miss'} (+${r.points_earned})`);
  });
  process.exit(0);
}
check().catch(e => { console.error(e.message); process.exit(1); });
