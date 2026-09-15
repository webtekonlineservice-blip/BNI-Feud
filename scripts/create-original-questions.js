// Script to create original, varied Family Feud questions (NOT all starting with "Name")
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

// Creative questions with VARIED formats - no repetitive "Name..." starters
const originalQuestions = [
  {
    member_name: 'Fredrick Koury',
    questions: [
      {
        text: "What do people forget to insure until disaster strikes?",
        answers: [
          { text: "Their phone", points: 35 },
          { text: "Jewelry", points: 28 },
          { text: "Home office equipment", points: 18 },
          { text: "Musical instruments", points: 12 },
          { text: "Bike", points: 5 },
          { text: "Their sanity", points: 2 }
        ]
      },
      {
        text: "Fill in the blank: When someone finds out they're not covered, they immediately ________.",
        answers: [
          { text: "Panic", points: 38 },
          { text: "Call their insurance agent", points: 26 },
          { text: "Start crying", points: 18 },
          { text: "Google 'what to do if...'", points: 10 },
          { text: "Blame their spouse", points: 6 },
          { text: "Promise to read the fine print next time", points: 2 }
        ]
      }
    ]
  },
  {
    member_name: 'Jaren Underwood',
    questions: [
      {
        text: "What's nearly impossible to keep clean if you're a painter?",
        answers: [
          { text: "Clothes", points: 35 },
          { text: "Your car interior", points: 28 },
          { text: "Hands and fingernails", points: 22 },
          { text: "Shoes", points: 10 },
          { text: "Hair", points: 4 },
          { text: "Phone screen", points: 1 }
        ]
      },
      {
        text: "Which color looks great in the store but terrible on the wall?",
        answers: [
          { text: "Bright red", points: 32 },
          { text: "Neon yellow", points: 26 },
          { text: "Dark purple", points: 20 },
          { text: "Hot pink", points: 12 },
          { text: "Black", points: 8 },
          { text: "Orange", points: 2 }
        ]
      }
    ]
  },
  {
    member_name: 'Marcus Tecarro',
    questions: [
      {
        text: "What do people avoid planning until it's way too awkward?",
        answers: [
          { text: "Their funeral", points: 40 },
          { text: "Who gets grandma's jewelry", points: 25 },
          { text: "Who takes care of their pets when they die", points: 18 },
          { text: "Digital passwords and accounts", points: 10 },
          { text: "Awkward family reunions", points: 5 },
          { text: "Retirement", points: 2 }
        ]
      },
      {
        text: "Families will fight over this after someone passes away:",
        answers: [
          { text: "Money and inheritance", points: 35 },
          { text: "The house", points: 28 },
          { text: "Jewelry and valuables", points: 18 },
          { text: "Family photos", points: 12 },
          { text: "Grandma's china collection", points: 5 },
          { text: "The TV remote", points: 2 }
        ]
      }
    ]
  },
  {
    member_name: 'Mitch Slattery',
    questions: [
      {
        text: "What do people buy even though they can't afford it?",
        answers: [
          { text: "A brand new car", points: 35 },
          { text: "Designer clothes and shoes", points: 27 },
          { text: "The latest iPhone", points: 20 },
          { text: "A boat", points: 10 },
          { text: "European vacation", points: 6 },
          { text: "Daily Starbucks", points: 2 }
        ]
      },
      {
        text: "Complete the excuse: 'I'd save money, but...'",
        answers: [
          { text: "I don't make enough", points: 38 },
          { text: "I'll start next month", points: 26 },
          { text: "You only live once", points: 18 },
          { text: "I have too many bills", points: 12 },
          { text: "I'm waiting for a raise", points: 4 },
          { text: "Saving is boring", points: 2 }
        ]
      }
    ]
  },
  {
    member_name: 'Patrick Driscoll',
    questions: [
      {
        text: "What always breaks right before a deadline?",
        answers: [
          { text: "The code you just wrote", points: 35 },
          { text: "Your computer", points: 28 },
          { text: "The internet connection", points: 20 },
          { text: "The office printer", points: 10 },
          { text: "Your confidence", points: 5 },
          { text: "The coffee maker", points: 2 }
        ]
      },
      {
        text: "When tech doesn't work, people blame:",
        answers: [
          { text: "The Wi-Fi", points: 40 },
          { text: "IT department", points: 25 },
          { text: "A computer virus", points: 18 },
          { text: "That update they installed", points: 10 },
          { text: "Their kids messing with it", points: 5 },
          { text: "Mercury in retrograde", points: 2 }
        ]
      }
    ]
  },
  {
    member_name: 'Paul Turin',
    questions: [
      {
        text: "At closing, homebuyers are shocked they have to pay for:",
        answers: [
          { text: "A million random fees", points: 35 },
          { text: "Homeowners insurance", points: 26 },
          { text: "Property taxes upfront", points: 20 },
          { text: "HOA fees", points: 12 },
          { text: "Title insurance", points: 5 },
          { text: "Their emotional damage", points: 2 }
        ]
      },
      {
        text: "On a mortgage application, people might exaggerate their:",
        answers: [
          { text: "Income", points: 38 },
          { text: "How much debt they have", points: 30 },
          { text: "Employment status", points: 18 },
          { text: "Being first-time buyers", points: 8 },
          { text: "Car value", points: 4 },
          { text: "Everything", points: 2 }
        ]
      }
    ]
  },
  {
    member_name: 'Sean Freihaut',
    questions: [
      {
        text: "Something dangerous people do without thinking twice:",
        answers: [
          { text: "Text while driving", points: 35 },
          { text: "Use a ladder incorrectly", points: 25 },
          { text: "Leave candles burning unattended", points: 20 },
          { text: "Not wear a seatbelt", points: 12 },
          { text: "Deep fry a turkey indoors", points: 6 },
          { text: "Trust a fart", points: 2 }
        ]
      },
      {
        text: "Where do accidents always seem to happen?",
        answers: [
          { text: "Parking lot", points: 32 },
          { text: "Kitchen", points: 28 },
          { text: "Bathroom", points: 18 },
          { text: "Stairs", points: 14 },
          { text: "The gym", points: 6 },
          { text: "Weddings", points: 2 }
        ]
      }
    ]
  },
  {
    member_name: 'Susan Cherkiss',
    questions: [
      {
        text: "Within a week of new carpet, someone will spill:",
        answers: [
          { text: "Red wine", points: 35 },
          { text: "Coffee", points: 28 },
          { text: "Juice", points: 18 },
          { text: "Pet accident", points: 12 },
          { text: "Paint", points: 5 },
          { text: "Tears of regret", points: 2 }
        ]
      },
      {
        text: "You never notice this about a room until someone points it out:",
        answers: [
          { text: "The floor is crooked", points: 32 },
          { text: "Paint colors don't match", points: 26 },
          { text: "There's a weird smell", points: 20 },
          { text: "Ceiling water stains", points: 14 },
          { text: "One outlet doesn't work", points: 6 },
          { text: "The room is actually tiny", points: 2 }
        ]
      }
    ]
  },
  {
    member_name: 'Tad Flowers',
    questions: [
      {
        text: "Complete the lie: 'I'll start ________ tomorrow.'",
        answers: [
          { text: "Exercising", points: 38 },
          { text: "Eating healthy", points: 28 },
          { text: "Saving money", points: 18 },
          { text: "Waking up early", points: 10 },
          { text: "Getting organized", points: 4 },
          { text: "Living my best life", points: 2 }
        ]
      },
      {
        text: "What scares people so much they need a pep talk?",
        answers: [
          { text: "Asking for a raise", points: 32 },
          { text: "Breaking up with someone", points: 26 },
          { text: "Public speaking", points: 20 },
          { text: "Going to the gym", points: 14 },
          { text: "Confronting a friend", points: 6 },
          { text: "Getting out of bed Monday", points: 2 }
        ]
      }
    ]
  },
  {
    member_name: 'Terry Fingerhut',
    questions: [
      {
        text: "You know it's bad for you, but you do it anyway:",
        answers: [
          { text: "Eat junk food", points: 35 },
          { text: "Stay up too late", points: 28 },
          { text: "Skip the gym", points: 20 },
          { text: "Drink too much coffee", points: 10 },
          { text: "Stress about everything", points: 5 },
          { text: "Doom scroll social media", points: 2 }
        ]
      },
      {
        text: "Which New Year's resolution dies by February?",
        answers: [
          { text: "Lose weight", points: 40 },
          { text: "Go to the gym regularly", points: 28 },
          { text: "Quit smoking", points: 18 },
          { text: "Drink more water", points: 8 },
          { text: "Read more books", points: 4 },
          { text: "Be a better person", points: 2 }
        ]
      }
    ]
  },
  {
    member_name: 'Jasmine G. McKinney',
    questions: [
      {
        text: "Seniors are always looking for their:",
        answers: [
          { text: "Glasses", points: 38 },
          { text: "Keys", points: 28 },
          { text: "Phone", points: 18 },
          { text: "Wallet or purse", points: 10 },
          { text: "Medication", points: 4 },
          { text: "What they were looking for", points: 2 }
        ]
      },
      {
        text: "Before retiring, you wish someone had warned you about:",
        answers: [
          { text: "How expensive healthcare is", points: 35 },
          { text: "How boring it can be", points: 26 },
          { text: "Needing way more savings", points: 20 },
          { text: "How to budget properly", points: 12 },
          { text: "Your spouse being home 24/7", points: 5 },
          { text: "Should have traveled more when younger", points: 2 }
        ]
      }
    ]
  },
  {
    member_name: 'Colten Bemis',
    questions: [
      {
        text: "During a home renovation, this always goes wrong:",
        answers: [
          { text: "It costs way more than expected", points: 38 },
          { text: "The contractor vanishes", points: 26 },
          { text: "They discover water damage", points: 18 },
          { text: "Takes twice as long", points: 12 },
          { text: "Permit gets denied", points: 4 },
          { text: "Your spouse changes their mind", points: 2 }
        ]
      },
      {
        text: "Homeowners dread this chore more than anything:",
        answers: [
          { text: "Cleaning gutters", points: 35 },
          { text: "Mowing the lawn", points: 28 },
          { text: "Fixing leaks", points: 20 },
          { text: "Dealing with HOA", points: 10 },
          { text: "Painting", points: 5 },
          { text: "Replacing the roof", points: 2 }
        ]
      }
    ]
  }
];

async function replaceWithOriginalQuestions() {
  try {
    console.log('🔍 Fetching members from database...\n');
    
    // Get all members
    const membersSnapshot = await db.collection('members').get();
    const memberMap = {};
    membersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      memberMap[data.name] = doc.id;
    });

    console.log('📋 Found members:', Object.keys(memberMap).length);
    console.log('\n⚠️  Warning: This will REPLACE all existing questions with original formats.');
    console.log('    No more repetitive "Name..." questions!\n');
    
    // Delete all existing questions and their answers
    console.log('🗑️  Deleting old questions...');
    const questionsSnapshot = await db.collection('questions').get();
    
    for (const questionDoc of questionsSnapshot.docs) {
      // Delete answers subcollection
      const answersSnapshot = await db.collection('questions')
        .doc(questionDoc.id)
        .collection('answers')
        .get();
      
      for (const answerDoc of answersSnapshot.docs) {
        await answerDoc.ref.delete();
      }
      
      // Delete question
      await questionDoc.ref.delete();
    }
    
    console.log(`   Deleted ${questionsSnapshot.size} old questions\n`);
    
    // Create new questions
    console.log('✨ Creating original, varied questions...\n');
    let totalCreated = 0;
    let displayOrder = 1;
    
    for (const memberQuestions of originalQuestions) {
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
        
        console.log(`   ✓ "${q.text.substring(0, 70)}..."`);
        totalCreated++;
      }
      console.log('');
    }
    
    console.log(`\n✅ Successfully created ${totalCreated} ORIGINAL questions!`);
    console.log('   ✨ No more repetitive "Name..." starters');
    console.log('   ✨ Variety: questions, fill-in-the-blanks, what/where/which/who');
    console.log('   ✨ More natural and conversational\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

replaceWithOriginalQuestions();
