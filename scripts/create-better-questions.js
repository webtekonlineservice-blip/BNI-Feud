// Script to create better, more diverse Family Feud questions
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

// Better questions with variety - mixing professional, personal, and funny scenarios
const betterQuestions = [
  {
    // Insurance professional - Fredrick Koury
    member_name: 'Fredrick Koury',
    questions: [
      {
        text: "Name something people forget to insure until it's too late.",
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
        text: "Name something people do when they realize they're not covered.",
        answers: [
          { text: "Panic", points: 38 },
          { text: "Call their agent frantically", points: 26 },
          { text: "Cry", points: 18 },
          { text: "Google 'what to do if...'", points: 10 },
          { text: "Blame someone else", points: 6 },
          { text: "Promise to never skip reading the fine print again", points: 2 }
        ]
      }
    ]
  },
  {
    // Painter - Jaren Underwood
    member_name: 'Jaren Underwood',
    questions: [
      {
        text: "Name something that's nearly impossible to keep clean when you paint for a living.",
        answers: [
          { text: "Your clothes", points: 35 },
          { text: "Your car", points: 28 },
          { text: "Your hands/fingernails", points: 22 },
          { text: "Your shoes", points: 10 },
          { text: "Your hair", points: 4 },
          { text: "Your phone screen", points: 1 }
        ]
      },
      {
        text: "Name a color everyone thinks they want until they see it on their wall.",
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
    // Estate Planning - Marcus Tecarro
    member_name: 'Marcus Tecarro',
    questions: [
      {
        text: "Name something people avoid planning for until it's awkward.",
        answers: [
          { text: "Their funeral", points: 40 },
          { text: "Who gets the family heirlooms", points: 25 },
          { text: "Who takes care of their pets", points: 18 },
          { text: "Their digital passwords after they die", points: 10 },
          { text: "Family reunions", points: 5 },
          { text: "Retirement", points: 2 }
        ]
      },
      {
        text: "Name something family members fight over after someone passes away.",
        answers: [
          { text: "Money/inheritance", points: 35 },
          { text: "The house", points: 28 },
          { text: "Jewelry", points: 18 },
          { text: "Family photos", points: 12 },
          { text: "Who gets grandma's china", points: 5 },
          { text: "The TV remote", points: 2 }
        ]
      }
    ]
  },
  {
    // Financial Advisor - Mitch
    member_name: 'Mitch',
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
    // Software Developer - Patrick Driscoll
    member_name: 'Patrick Driscoll',
    questions: [
      {
        text: "Name something that breaks right before a big deadline.",
        answers: [
          { text: "The code", points: 35 },
          { text: "Your computer", points: 28 },
          { text: "The internet", points: 20 },
          { text: "The printer", points: 10 },
          { text: "Your confidence", points: 5 },
          { text: "Your coffee maker", points: 2 }
        ]
      },
      {
        text: "Name something people blame when their technology doesn't work.",
        answers: [
          { text: "The Wi-Fi", points: 40 },
          { text: "The IT department", points: 25 },
          { text: "A virus", points: 18 },
          { text: "The update they just installed", points: 10 },
          { text: "Their kids", points: 5 },
          { text: "Mercury in retrograde", points: 2 }
        ]
      }
    ]
  },
  {
    // Mortgage - Paul Turin
    member_name: 'Paul Turin',
    questions: [
      {
        text: "Name something homebuyers don't expect to pay for at closing.",
        answers: [
          { text: "All the random fees", points: 35 },
          { text: "Homeowners insurance", points: 26 },
          { text: "Property taxes", points: 20 },
          { text: "HOA fees", points: 12 },
          { text: "Title insurance", points: 5 },
          { text: "Their sanity", points: 2 }
        ]
      },
      {
        text: "Name something people lie about on their mortgage application.",
        answers: [
          { text: "Their income", points: 38 },
          { text: "Their debt", points: 30 },
          { text: "Their employment status", points: 18 },
          { text: "Being first-time buyers", points: 8 },
          { text: "How much their car is worth", points: 4 },
          { text: "Everything", points: 2 }
        ]
      }
    ]
  },
  {
    // Insurance - Sean Freihaut
    member_name: 'Sean Freihaut',
    questions: [
      {
        text: "Name something dangerous people do without thinking twice.",
        answers: [
          { text: "Text while driving", points: 35 },
          { text: "Use a ladder incorrectly", points: 25 },
          { text: "Leave candles burning", points: 20 },
          { text: "Not wear a seatbelt", points: 12 },
          { text: "Deep fry a turkey indoors", points: 6 },
          { text: "Trust a fart", points: 2 }
        ]
      },
      {
        text: "Name a place where accidents always seem to happen.",
        answers: [
          { text: "The parking lot", points: 32 },
          { text: "The kitchen", points: 28 },
          { text: "The bathroom", points: 18 },
          { text: "The stairs", points: 14 },
          { text: "The gym", points: 6 },
          { text: "A wedding", points: 2 }
        ]
      }
    ]
  },
  {
    // Flooring - Susan Cherkiss
    member_name: 'Susan Cherkiss',
    questions: [
      {
        text: "Name something people spill on their new carpet within the first week.",
        answers: [
          { text: "Red wine", points: 35 },
          { text: "Coffee", points: 28 },
          { text: "Juice", points: 18 },
          { text: "Pet accidents", points: 12 },
          { text: "Paint", points: 5 },
          { text: "Tears of regret", points: 2 }
        ]
      },
      {
        text: "Name something people never notice about a room until someone points it out.",
        answers: [
          { text: "The floor is crooked", points: 32 },
          { text: "The paint colors don't match", points: 26 },
          { text: "There's a weird smell", points: 20 },
          { text: "The ceiling has water stains", points: 14 },
          { text: "One outlet doesn't work", points: 6 },
          { text: "The room is actually really small", points: 2 }
        ]
      }
    ]
  },
  {
    // Life Coach - Tad Flowers
    member_name: 'Tad Flowers',
    questions: [
      {
        text: "Name something people say they'll start doing 'tomorrow.'",
        answers: [
          { text: "Exercise", points: 38 },
          { text: "Eating healthy", points: 28 },
          { text: "Saving money", points: 18 },
          { text: "Waking up early", points: 10 },
          { text: "Being organized", points: 4 },
          { text: "Living their best life", points: 2 }
        ]
      },
      {
        text: "Name something people need a pep talk about.",
        answers: [
          { text: "Asking for a raise", points: 32 },
          { text: "Breaking up with someone", points: 26 },
          { text: "Public speaking", points: 20 },
          { text: "Going to the gym", points: 14 },
          { text: "Confronting a friend", points: 6 },
          { text: "Getting out of bed on Monday", points: 2 }
        ]
      }
    ]
  },
  {
    // Wellness - Terry Fingerhut
    member_name: 'Terry Fingerhut',
    questions: [
      {
        text: "Name something people know is bad for them but do anyway.",
        answers: [
          { text: "Eat junk food", points: 35 },
          { text: "Stay up too late", points: 28 },
          { text: "Skip exercise", points: 20 },
          { text: "Drink too much coffee", points: 10 },
          { text: "Stress about everything", points: 5 },
          { text: "Doom scroll on social media", points: 2 }
        ]
      },
      {
        text: "Name a New Year's resolution people give up on by February.",
        answers: [
          { text: "Lose weight", points: 40 },
          { text: "Go to the gym", points: 28 },
          { text: "Quit smoking", points: 18 },
          { text: "Drink more water", points: 8 },
          { text: "Read more books", points: 4 },
          { text: "Be a better person", points: 2 }
        ]
      }
    ]
  },
  {
    // Insurance - Jasmine G. McKinney (new member)
    member_name: 'Jasmine G. McKinney',
    questions: [
      {
        text: "Name something seniors always forget where they put it.",
        answers: [
          { text: "Their glasses", points: 38 },
          { text: "Their keys", points: 28 },
          { text: "Their phone", points: 18 },
          { text: "Their wallet/purse", points: 10 },
          { text: "Their medication", points: 4 },
          { text: "What they were looking for", points: 2 }
        ]
      },
      {
        text: "Name something people wish they had known before they retired.",
        answers: [
          { text: "How expensive healthcare is", points: 35 },
          { text: "How boring retirement can be", points: 26 },
          { text: "That they needed way more savings", points: 20 },
          { text: "How to budget properly", points: 12 },
          { text: "That their spouse would be home all day", points: 5 },
          { text: "They should have traveled more when younger", points: 2 }
        ]
      }
    ]
  }
];

async function createBetterQuestions() {
  try {
    console.log('🔍 Fetching members from database...\n');
    
    // Get all members
    const membersSnapshot = await db.collection('members').get();
    const memberMap = {};
    membersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      memberMap[data.name] = doc.id;
    });

    console.log('📋 Found members:', Object.keys(memberMap).join(', '));
    console.log('\n⚠️  Warning: This will DELETE all existing questions and create new ones.');
    console.log('    Make sure you want to proceed!\n');
    
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
    console.log('📝 Creating new questions...\n');
    let totalCreated = 0;
    let displayOrder = 1;
    
    for (const memberQuestions of betterQuestions) {
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
    
    console.log(`\n✅ Successfully created ${totalCreated} new questions!`);
    console.log('   Questions are more diverse, engaging, and fun.');
    console.log('   Each member now has varied topics beyond just their profession.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createBetterQuestions();
