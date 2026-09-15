// Script to add questions for missing members
const admin = require('firebase-admin');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

const missingQuestions = [
  {
    member_name: 'Mitch Slattery',
    questions: [
      {
        text: "Name something people buy that they definitely can't afford.",
        answers: [
          { text: "A new car", points: 35 },
          { text: "Designer clothes", points: 27 },
          { text: "The latest iPhone", points: 20 },
          { text: "A boat", points: 10 },
          { text: "Vacation to Europe", points: 6 },
          { text: "Daily Starbucks", points: 2 }
        ]
      },
      {
        text: "Name an excuse people give for not saving money.",
        answers: [
          { text: "I don't make enough", points: 38 },
          { text: "I'll start next month", points: 26 },
          { text: "Life is short, YOLO", points: 18 },
          { text: "I have too many bills", points: 12 },
          { text: "I'm waiting for a raise", points: 4 },
          { text: "Saving is boring", points: 2 }
        ]
      }
    ]
  },
  {
    member_name: 'Colten Bemis',
    questions: [
      {
        text: "Name something that goes wrong during a home renovation.",
        answers: [
          { text: "It costs way more than expected", points: 38 },
          { text: "The contractor disappears", points: 26 },
          { text: "They find water damage", points: 18 },
          { text: "It takes twice as long", points: 12 },
          { text: "The permit gets denied", points: 4 },
          { text: "Your spouse changes their mind", points: 2 }
        ]
      },
      {
        text: "Name something homeowners dread doing.",
        answers: [
          { text: "Cleaning the gutters", points: 35 },
          { text: "Mowing the lawn", points: 28 },
          { text: "Fixing a leak", points: 20 },
          { text: "Dealing with HOA", points: 10 },
          { text: "Painting", points: 5 },
          { text: "Replacing the roof", points: 2 }
        ]
      }
    ]
  }
];

async function addMissingQuestions() {
  try {
    console.log('🔍 Fetching members from database...\n');
    
    // Get all members
    const membersSnapshot = await db.collection('members').get();
    const memberMap = {};
    membersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      memberMap[data.name] = doc.id;
    });

    // Get current max display_order
    const questionsSnapshot = await db.collection('questions').orderBy('display_order', 'desc').limit(1).get();
    let displayOrder = 1;
    
    if (!questionsSnapshot.empty) {
      displayOrder = questionsSnapshot.docs[0].data().display_order + 1;
    }
    
    console.log('📝 Adding missing questions...\n');
    let totalCreated = 0;
    
    for (const memberQuestions of missingQuestions) {
      const memberId = memberMap[memberQuestions.member_name];
      
      if (!memberId) {
        console.log(`⚠️  Member "${memberQuestions.member_name}" not found, skipping...`);
        continue;
      }
      
      console.log(`📌 ${memberQuestions.member_name}:`);
      
      for (const q of memberQuestions.questions) {
        // Create question
        const questionRef = await db.collection('questions').add({
          question_text: q.text,
          member_id: memberId,
          display_order: displayOrder++,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        // Create answers
        let answerOrder = 1;
        for (const answer of q.answers) {
          await db.collection('questions')
            .doc(questionRef.id)
            .collection('answers')
            .add({
              answer_text: answer.text,
              points: answer.points,
              display_order: answerOrder++,
              is_revealed: false
            });
        }
        
        console.log(`   ✓ "${q.text.substring(0, 60)}..." (${q.answers.length} answers)`);
        totalCreated++;
      }
      console.log('');
    }
    
    console.log(`\n✅ Successfully added ${totalCreated} questions for missing members!\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addMissingQuestions();
