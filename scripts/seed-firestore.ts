/**
 * scripts/seed-firestore.ts
 * Seeds the Firestore database with members and initializes game state.
 * Run: npx ts-node --project tsconfig.scripts.json scripts/seed-firestore.ts
 */

import * as admin from 'firebase-admin'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

// Initialize Firebase Admin
const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
})

const db = admin.firestore()

const members = [
  { name: 'Alex B',     role: 'Financial Advisor',     company: 'Wealth Partners',      fun_facts: 'Loves golf, always talking about market trends, has a coffee mug collection', display_order: 1 },
  { name: 'Brittany C', role: 'Real Estate Agent',     company: 'Prime Realty',         fun_facts: 'Sold 40+ homes last year, drives a red convertible, obsessed with staging', display_order: 2 },
  { name: 'Carlos D',   role: 'Insurance Broker',      company: 'Shield Insurance',     fun_facts: 'Youth soccer coach, can quote any insurance policy from memory, always prepared', display_order: 3 },
  { name: 'Diane E',    role: 'Marketing Consultant',  company: 'Brand Boost Co',       fun_facts: 'Uses buzzwords constantly, runs a food blog, claims to know every influencer', display_order: 4 },
  { name: 'Eric F',     role: 'CPA / Accountant',      company: 'Eric F & Associates',  fun_facts: 'Works 80hr weeks in April, collects vintage calculators, very literal sense of humor', display_order: 5 },
  { name: 'Fatima G',   role: 'Attorney',              company: 'Garza Law Group',      fun_facts: 'Never off the clock, gives legal advice at every party, drives a Tesla', display_order: 6 },
  { name: 'Gilbert H',  role: 'Web Developer',         company: 'Freelance',            fun_facts: 'Builds full-stack apps, always has a side project, knows every JavaScript framework', display_order: 7 },
  { name: 'Hannah I',   role: 'HR Consultant',         company: 'People First HR',      fun_facts: 'Has read every HR policy ever written, mediates family disputes on vacation', display_order: 8 },
  { name: 'Ivan J',     role: 'Financial Planner',     company: 'Future Wealth Mgmt',   fun_facts: 'Talks about compound interest at dinner, has a spreadsheet for everything', display_order: 9 },
  { name: 'Jennifer K', role: 'Business Coach',        company: 'Thrive Coaching',      fun_facts: 'Posts morning motivation quotes daily, has done every personality test known to man', display_order: 10 },
  { name: 'Kevin L',    role: 'Mortgage Lender',       company: 'Home Loan Pros',       fun_facts: 'Can calculate a monthly payment in his head, has a handshake for every occasion', display_order: 11 },
  { name: 'Laura M',    role: 'Nutritionist',          company: 'Nourish Wellness',     fun_facts: 'Brings kale chips to every event, judges your lunch order, runs half-marathons', display_order: 12 },
  { name: 'Marcus N',   role: 'IT Solutions',          company: 'NetFix IT',            fun_facts: 'Fixes everyones computer at holiday parties, always on call, loves Star Trek', display_order: 13 },
  { name: 'Nicole O',   role: 'Event Planner',         company: 'Perfect Events Co',    fun_facts: 'Organizes everything including her friends weddings, has backup plans for backup plans', display_order: 14 },
  { name: 'Oscar P',    role: 'Commercial Realtor',    company: 'Metro Commercial RE',  fun_facts: 'Never met a strip mall he didnt like, knows the zoning laws of every suburb', display_order: 15 },
  { name: 'Priya Q',    role: 'Healthcare Consultant', company: 'Health Strategy Group', fun_facts: 'Self-diagnoses everything on WebMD, knows every medical acronym, very organized', display_order: 16 },
  { name: 'Rachel R',   role: 'Social Media Manager',  company: 'Click & Engage',       fun_facts: 'Always filming content, uses hashtags in real conversation, checks analytics hourly', display_order: 17 },
  { name: 'Sam T',      role: 'Business Attorney',     company: 'Turner Legal Group',   fun_facts: 'Gets called at 11pm by clients, has a contract for everything, very dry humor', display_order: 18 },
]

async function main() {
  console.log('🔥 Seeding Firestore for B&I Family Feud\n')

  // 1. Seed members
  console.log('  Adding members...')
  for (const member of members) {
    const ref = db.collection('members').doc()
    await ref.set(member)
    console.log(`    ✅ ${member.name} (${member.role})`)
  }

  // 2. Initialize game_state/current
  console.log('\n  Setting up game state...')
  await db.collection('game_state').doc('current').set({
    active_question_id: null,
    game_phase: 'registration',
    strikes: 0,
    question_text: '',
    member_name: '',
    member_role: '',
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  })
  console.log('    ✅ game_state/current initialized')

  console.log('\n✨ Firestore seeded! You can now run the question generator.')
  console.log('   npx ts-node --project tsconfig.scripts.json scripts/generate-questions.ts\n')

  process.exit(0)
}

main().catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})
