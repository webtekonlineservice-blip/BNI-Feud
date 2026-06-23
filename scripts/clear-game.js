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

async function clear() {
  // Clear responses
  const responses = await db.collection('responses').get();
  console.log('Clearing', responses.size, 'responses');
  for (const d of responses.docs) await d.ref.delete();

  // Clear players
  const players = await db.collection('players').get();
  console.log('Clearing', players.size, 'players');
  for (const d of players.docs) await d.ref.delete();

  // Reset all questions to inactive
  const questions = await db.collection('questions').get();
  for (const q of questions.docs) {
    await q.ref.update({ is_active: false, is_complete: false });
    // Reset answers to not revealed
    const answers = await db.collection('questions').doc(q.id).collection('answers').get();
    for (const a of answers.docs) await a.ref.update({ is_revealed: false });
  }
  console.log('Reset', questions.size, 'questions');

  // Reset game state
  await db.collection('game_state').doc('current').set({
    active_question_id: null,
    game_phase: 'registration',
    strikes: 0,
    question_text: '',
    member_name: '',
    member_role: '',
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log('Game state reset');
  console.log('Done! Ready for a fresh game.');
  process.exit(0);
}
clear().catch(e => { console.error(e); process.exit(1); });
