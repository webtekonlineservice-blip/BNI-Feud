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

async function main() {
  console.log('Looking for Gilbert H...');
  const membersSnap = await db.collection('members').where('name', '==', 'Gilbert H').limit(1).get();
  if (membersSnap.empty) { console.error('No member found'); process.exit(1); }

  const member = membersSnap.docs[0];
  const memberData = member.data();
  console.log('Member:', memberData.name, '-', memberData.role);

  const questionRef = await db.collection('questions').add({
    member_id: member.id,
    question_text: 'We surveyed 100 people: Name something a web developer says when their code finally works',
    is_active: false,
    is_complete: false,
    display_order: 1,
    created_at: new Date().toISOString(),
  });
  console.log('Question ID:', questionRef.id);

  const answers = [
    { answer_text: 'Dont touch anything', points: 35, display_order: 1, is_revealed: false },
    { answer_text: 'It works on my machine', points: 25, display_order: 2, is_revealed: false },
    { answer_text: 'I have no idea why', points: 18, display_order: 3, is_revealed: false },
    { answer_text: 'Time to commit', points: 12, display_order: 4, is_revealed: false },
    { answer_text: 'Let me refactor this', points: 7, display_order: 5, is_revealed: false },
    { answer_text: 'Ship it', points: 3, display_order: 6, is_revealed: false },
  ];

  for (const ans of answers) {
    await db.collection('questions').doc(questionRef.id).collection('answers').add(ans);
  }
  console.log('Added 6 answers');
  console.log('Test question ready! Go to /host to activate it.');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
