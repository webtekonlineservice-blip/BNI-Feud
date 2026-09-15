// Script to add Jasmine G. McKinney to the members collection
const admin = require('firebase-admin');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Initialize Firebase Admin
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

async function addMember() {
  try {
    // Get current members to determine display_order
    const membersSnapshot = await db.collection('members').orderBy('display_order', 'desc').limit(1).get();
    let nextOrder = 1;
    
    if (!membersSnapshot.empty) {
      const lastMember = membersSnapshot.docs[0].data();
      nextOrder = (lastMember.display_order || 0) + 1;
    }

    // Add new member
    const newMember = {
      name: 'Jasmine G. McKinney',
      role: 'Insurance',
      company: 'Simple Senior Benefits',
      fun_facts: '',
      display_order: nextOrder,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const docRef = await db.collection('members').add(newMember);
    
    console.log('✅ Successfully added member:', newMember.name);
    console.log('   Member ID:', docRef.id);
    console.log('   Display Order:', newMember.display_order);
    console.log('   Role:', newMember.role);
    console.log('   Company:', newMember.company);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding member:', error);
    process.exit(1);
  }
}

addMember();
