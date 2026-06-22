/**
 * scripts/seed-firestore.ts
 * Seeds Firestore with Think Big St. Louis chapter members.
 * Run: npx ts-node --project tsconfig.scripts.json scripts/seed-firestore.ts
 */

import * as admin from 'firebase-admin'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
})

const db = admin.firestore()

const members = [
  { name: 'Daniel Buerges',    role: 'Window Treatments',         company: 'Gotcha Covered',                         fun_facts: 'Visitor Host, knows every window in Kirkwood, always upbeat and welcoming newcomers', display_order: 1 },
  { name: 'Fredrick Koury',    role: 'Commercial Insurance',      company: 'Koury Agency, Inc.',                     fun_facts: 'Secretary/Treasurer, been in insurance forever, knows every risk scenario imaginable, very detail-oriented', display_order: 2 },
  { name: 'Irene Hasegawa',    role: 'Residential Real Estate',   company: 'Keller Williams Realty STL',             fun_facts: 'Member Relations, sells homes like hotcakes, always networking, knows every neighborhood in STL', display_order: 3 },
  { name: 'Jaren Underwood',   role: 'Residential Painter',       company: 'Malone Painting',                        fun_facts: 'Chapter President, leads the group, can match any paint color by memory, always covered in paint specs', display_order: 4 },
  { name: 'Kelsey Alvarado',   role: 'Banking Services',          company: 'BMO Harris Bank',                        fun_facts: 'Vice President, knows everyones financial situation, always professional, great with numbers', display_order: 5 },
  { name: 'Marcus Tecarro',    role: 'Estate Planning Attorney',  company: 'Polaris Estate Planning and Elder Law',  fun_facts: 'Quality Assurance on membership committee, thinks about worst-case scenarios for a living, very thorough', display_order: 6 },
  { name: 'Mitch Slattery',    role: 'Financial Advisor',         company: 'Edward Jones',                           fun_facts: 'Talks about retirement planning at lunch, always has market updates, very calm under pressure', display_order: 7 },
  { name: 'Patrick Driscoll',  role: 'Web Developer',             company: 'Webtek',                                 fun_facts: 'Built this game, always has a side project, probably debugging something right now', display_order: 8 },
  { name: 'Paul Turin',        role: 'Residential Mortgages',     company: 'Guild Mortgage',                         fun_facts: 'Education Coordinator, can calculate your monthly payment in his sleep, knows interest rates by heart', display_order: 9 },
  { name: 'Sean Freihaut',     role: 'Property & Casualty Insurance', company: 'Weiss Insurance Agency',             fun_facts: 'Visitor Host, protects everyone from disaster, always thinking about what could go wrong', display_order: 10 },
  { name: 'Susan Cherkiss',    role: 'Flooring',                  company: 'Advance Carpet One',                     fun_facts: 'Visitor Host, knows every type of flooring material, can spot a bad install from across the room', display_order: 11 },
  { name: 'Tad Flowers',       role: 'Business Coach',            company: 'FocalPoint Coaching',                    fun_facts: 'Member Engagement, asks deep questions, always has a framework for everything, very motivational', display_order: 12 },
  { name: 'Terry Fingerhut',   role: 'Health & Wellness Products', company: 'Shaklee',                               fun_facts: 'Mentor Coordinator, passionate about nutrition, always has a health tip, very energetic', display_order: 13 },
]

async function main() {
  console.log('🔥 Seeding Firestore — Think Big St. Louis Chapter\n')

  // Clear existing members
  const existingMembers = await db.collection('members').get()
  if (!existingMembers.empty) {
    console.log(`  Clearing ${existingMembers.size} existing members...`)
    const batch = db.batch()
    existingMembers.docs.forEach(doc => batch.delete(doc.ref))
    await batch.commit()
  }

  // Seed members
  console.log('  Adding 13 members...')
  for (const member of members) {
    await db.collection('members').doc().set(member)
    console.log(`    ✅ ${member.name} — ${member.role} (${member.company})`)
  }

  // Initialize game state
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

  console.log('\n✨ Done! Think Big St. Louis is loaded.')
  console.log('   Next: npx ts-node --project tsconfig.scripts.json scripts/generate-questions.ts\n')
  process.exit(0)
}

main().catch(err => { console.error('❌', err); process.exit(1) })
