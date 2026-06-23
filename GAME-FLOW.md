# BNI Family Feud — App Flow

## Live URL
https://bni-feud.vercel.app

## Chapter
Think Big St. Louis — Mike Duffy's Pub, Kirkwood MO — Thursdays 11:30 AM

---

## Architecture

```
Player Phone → QR scan → /play (register form) → Firestore + confirmation SMS
Player Phone → SMS → /api/twilio (webhook) → Firestore + reply SMS
Host Laptop  → /host (control panel) → API routes → Firestore
Projector    → /board (game display) → Firestore real-time listeners
```

---

## App Routes

| Route | Purpose | Who sees it |
|-------|---------|-------------|
| `/` | Redirects to `/board` | — |
| `/board` | Game display (QR registration → question → answers → leaderboard) | Projector/TV |
| `/host` | Host control panel (activate rounds, reveal answers, strikes) | Host laptop/phone |
| `/play` | Web registration form (name + phone) | Players via QR scan |
| `/api/players` | GET all players / POST new registration | Internal |
| `/api/players/answer` | POST player answer submission | Internal |
| `/api/questions` | GET all questions / PATCH activate/complete | Internal |
| `/api/answers` | GET responses / PATCH reveal answer | Internal |
| `/api/twilio` | POST incoming SMS webhook from Twilio | Twilio |

---

## Registration Flow

### Via QR Code (primary)
1. `/board` displays QR code pointing to `https://bni-feud.vercel.app/play`
2. Player scans with phone camera → opens `/play` in browser
3. Player enters name + phone number → submits form
4. `POST /api/players` → creates player in Firestore
5. Twilio sends confirmation SMS with game instructions
6. Player sees "You're in!" waiting screen

### Via SMS (fallback)
1. Player texts their name to `+16366892103`
2. Twilio hits `POST /api/twilio`
3. Creates player in Firestore
4. Replies with confirmation + instructions

---

## Game Round Flow

### Host starts a round
1. Host clicks member card on `/host`
2. Modal opens showing question + answers + controls
3. Host clicks **"Open Round"**
4. `PATCH /api/questions` → sets question active, updates `game_state/current`

### Board reacts (real-time)
1. `/board` listens to `game_state/current` via Firestore `onSnapshot`
2. Detects `game_phase: 'playing'` + `active_question_id`
3. Switches to game view: shows question + hidden answer slots
4. Listens to `questions/{id}/answers` subcollection for reveals

### Players answer
1. Player texts answer to `+16366892103`
2. `POST /api/twilio` → checks game state → fuzzy matches answer
3. If match: reveals answer in Firestore, updates player score, replies "MATCH! +X pts"
4. If miss: replies "Not on the board!"
5. One answer per player per round (enforced via `responses` collection)

### Host reveals remaining answers
1. Host taps hidden answers on `/host` modal
2. `PATCH /api/answers` → sets `is_revealed: true` in Firestore subcollection
3. `/board` updates in real-time via `onSnapshot`

### Host ends the round
1. Host clicks **"Mark Complete"**
2. `PATCH /api/questions` → marks question complete, resets `game_state/current`
3. `/board` returns to registration/waiting view

---

## Firestore Data Model

```
game_state/current
  ├── active_question_id: string | null
  ├── game_phase: 'registration' | 'playing' | 'leaderboard'
  ├── question_text: string
  ├── member_name: string
  ├── member_role: string
  ├── strikes: number (0-3)
  └── updated_at: timestamp

members/{id}
  ├── name: string
  ├── role: string
  ├── company: string
  ├── fun_facts: string
  └── display_order: number

questions/{id}
  ├── member_id: string (ref to members)
  ├── question_text: string
  ├── is_active: boolean
  ├── is_complete: boolean
  ├── display_order: number
  └── answers/{id}  (subcollection)
        ├── answer_text: string
        ├── points: number
        ├── display_order: number (1-6)
        └── is_revealed: boolean

players/{id}
  ├── phone_number: string (E.164)
  ├── display_name: string
  ├── total_score: number
  ├── registered_at: string
  └── is_host: boolean

responses/{id}
  ├── player_id: string
  ├── question_id: string
  ├── raw_answer: string
  ├── matched_answer: string | null
  ├── points_earned: number
  ├── display_name: string
  └── received_at: string
```

---

## SMS Webhook Flow (`/api/twilio`)

```
Incoming text from player
  │
  ├─ Is "HELP" or "?" → Reply with instructions
  ├─ Is "SCORE" → Reply with top 5 leaderboard
  ├─ Player not registered → Register them, reply with welcome + instructions
  ├─ Starts with "NAME:" → Update display name
  ├─ No active question → Reply "No question open, watch the screen!"
  ├─ Already answered this round → Reply "Already answered!"
  └─ Otherwise → Match answer against board
       ├─ Match found → Reveal answer, update score, reply "+X pts!"
       └─ No match → Reply "Not on the board!"
```

---

## Answer Matching (`src/lib/matchAnswer.ts`)

- Uses Fuse.js for fuzzy string matching
- Compares player's raw answer against the 6 board answers
- Threshold-based matching (close enough counts)
- Only matches unrevealed answers

---

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/seed-firestore.ts` | Seed 13 Think Big members + init game state |
| `scripts/generate-questions.ts` | Generate questions via DeepSeek AI |
| `scripts/create-test-question.js` | Quick test question for debugging |
| `scripts/check-db.js` | Verify Firestore data |

---

## Deploy

- **Hosting**: Vercel (auto-deploys on push to `main`)
- **Database**: Firebase Firestore
- **SMS**: Twilio
- **AI**: DeepSeek (question generation only)
- **Repo**: https://github.com/webtekonlineservice-blip/BNI-Feud

---

## Twilio Webhook Setup

Set in Twilio Console → Phone Numbers → `+16366892103` → Messaging:
- **When a message comes in**: `https://bni-feud.vercel.app/api/twilio`
- **HTTP Method**: POST

---

## Environment Variables (Vercel)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_FIREBASE_*` | Client-side Firebase config (6 vars) |
| `FIREBASE_PROJECT_ID` | Admin SDK |
| `FIREBASE_CLIENT_EMAIL` | Admin SDK |
| `FIREBASE_PRIVATE_KEY` | Admin SDK (multiline) |
| `TWILIO_ACCOUNT_SID` | Twilio API |
| `TWILIO_AUTH_TOKEN` | Twilio API |
| `TWILIO_PHONE_NUMBER` | Outbound SMS from |
| `NEXT_PUBLIC_TWILIO_PHONE` | Display number |
| `NEXT_PUBLIC_APP_URL` | App base URL |
| `HOST_PASSWORD` | Host panel access |
| `DEEPSEEK_API_KEY` | Question generation |
