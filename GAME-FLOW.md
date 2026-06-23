# BNI Family Feud — Game Flow

## Live URL
https://bni-feud.vercel.app

## Chapter
Think Big St. Louis — Mike Duffy's Pub, Kirkwood MO — Thursdays 11:30 AM

---

## Pages

| URL | What it does | Who uses it |
|-----|-------------|-------------|
| `/` | Home — QR code + instructions + player count | Projector (before game) |
| `/host` | Game controller — questions, answers, leaderboard | Host laptop (projector during game) |
| `/play` | Registration form (name + phone) | Players via QR scan |

---

## The Game (10 min)

### Before: Reset
```bash
node scripts/clear-game.js
```
Clears all players, responses, resets questions. Fresh start.

### Phase 1: Registration (1-2 min)
1. Project `https://bni-feud.vercel.app` on TV
2. Players scan QR code → opens `/play` → enter name + phone
3. They get a confirmation SMS with instructions
4. Player count updates live on the home page

### Phase 2: Play (8 min)
1. Host opens `/host` on their laptop → clicks **Start Game**
2. Question 1 appears (about a specific member)
3. Players text their answer to `+16366892103`
4. Matches reveal on screen in real-time + player gets points
5. One guess per player per question
6. When ready, host clicks **Next Question →**
7. Repeat for all 13 questions (or however many you have time for)

### Phase 3: Leaderboard
1. After the last question, host clicks **Show Leaderboard**
2. Final scores display — #1 wins lunch!

---

## How Answers Work

- Player texts an answer
- Fuzzy matching (Fuse.js) compares it to the 6 answers on the board
- If close enough → match! Answer reveals, player scores those points
- If no match → "Not on the board!" reply
- Each player gets ONE guess per question
- Points per answer: #1 ~35, #2 ~25, #3 ~18, #4 ~12, #5 ~7, #6 ~3 (total = 100)

---

## SMS Commands

| Text | What happens |
|------|-------------|
| First text (any name) | Registers the player |
| Any answer | Submits during active round |
| `SCORE` | Shows top 5 leaderboard |
| `HELP` | Instructions |
| `NAME: New Name` | Change display name |

---

## Scripts

| Command | What it does |
|---------|-------------|
| `node scripts/clear-game.js` | Reset everything for a fresh game |
| `npx ts-node --project tsconfig.scripts.json scripts/seed-firestore.ts` | Seed the 13 members |
| `npx ts-node --project tsconfig.scripts.json scripts/generate-questions.ts` | Generate questions via DeepSeek |

---

## Host Quick Reference

```
1. Run: node scripts/clear-game.js (fresh start)
2. Project https://bni-feud.vercel.app on TV (QR + instructions)
3. Wait for players to register (watch count go up)
4. Open /host on your laptop
5. Click "Start Game"
6. Question shows → players text answers → matches reveal
7. Click "Next Question" when ready
8. After all questions → Leaderboard shows
9. #1 wins lunch!
```

---

## Tech Stack

- **Frontend**: Next.js 14 on Vercel
- **Database**: Firebase Firestore (real-time)
- **SMS**: Twilio
- **AI**: DeepSeek (question generation)
- **Repo**: https://github.com/webtekonlineservice-blip/BNI-Feud

---

## Environment Variables (Vercel)

All set in Vercel project settings:
- `NEXT_PUBLIC_FIREBASE_*` (6 client keys)
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- `NEXT_PUBLIC_TWILIO_PHONE`, `NEXT_PUBLIC_APP_URL`
- `HOST_PASSWORD`, `DEEPSEEK_API_KEY`

---

## Twilio Webhook

Console → Phone Numbers → +16366892103 → Messaging:
- URL: `https://bni-feud.vercel.app/api/twilio`
- Method: POST

---

## Tips

- Keep rounds short — 20-30 seconds per question
- Read the question aloud with energy
- React to matches as they reveal ("Ohhh! Someone got it!")
- Don't wait for all 6 to reveal — move on when it slows down
- You can skip questions (just click Next)
- Have fun with it — the roast questions are meant to get laughs
