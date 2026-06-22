# B&I Family Feud — Game Flow (10-Minute Presentation)

## How It Works

- **Players text answers via SMS** — no app download, no QR codes, no web forms
- **Host controls the game** from `/host` on their laptop/phone
- **Board displays on the big screen** at `/board` for the room to watch
- You'll get through **3–4 rounds** in 10 minutes

---

## Screens

| Screen | URL | Who |
|--------|-----|-----|
| Board | `/board` | Projected on TV for the room |
| Host | `/host` | Your laptop — you control everything |

Players **only interact via text** to **+16366892103**

---

## Before the Presentation

### 1. Generate Questions (run once)
```bash
npx ts-node --project tsconfig.scripts.json scripts/generate-questions.ts
```

### 2. Pick Your 3–4 Best Questions
- Check Firebase Console or `/host` 
- Choose the funniest ones for your time slot

---

## The 10-Minute Script

### Intro (1 min)
> "We're playing Family Feud — B&I edition. I wrote a question about each of you.
> To play, text your first name to this number right now."

- Show the number on `/board` registration screen
- Wait ~30 seconds for people to register

### Rounds (2–3 min each, do 3–4 rounds)

1. **Click member card on `/host` → "Open Round"**
2. **Read the question aloud** — board shows it on screen
3. **Say: "Text your answer NOW"**
4. Watch answers stream in on `/host` (15–20 seconds)
5. **Reveal answers** — tap each one on host panel, let the room react
6. **Click "Mark Complete"** → move to next round

### Wrap-up (30 sec)
> "Let's see the leaderboard!"
- Top scorer wins bragging rights (or lunch)

---

## Timing Guide

| Segment | Time |
|---------|------|
| Intro + registration | 1 min |
| Round 1 | 2.5 min |
| Round 2 | 2.5 min |
| Round 3 | 2.5 min |
| Leaderboard + wrap | 1 min |
| **Total** | **~10 min** |

---

## SMS Commands (for players)

| Text | What happens |
|------|-------------|
| Their name | Registers them (first text) |
| Any answer | Submits during active round |
| `SCORE` | Shows top 5 |
| `HELP` | Instructions |

---

## Scoring

6 answers per question, 100 points total per round:
- #1: ~35 pts | #2: ~25 pts | #3: ~18 pts | #4: ~12 pts | #5: ~7 pts | #6: ~3 pts

---

## Host Quick Reference

```
1. Project /board on TV
2. Open /host on your device
3. "Text your name to [number]!" — wait 30 sec
4. Click member → Open Round → read question
5. "Text your answer!" — wait 15-20 sec
6. Reveal answers, enjoy reactions
7. Mark Complete → next round
8. After 3-4 rounds → show leaderboard
```

---

## Tips for 10 Minutes

- **Pre-pick your rounds** — don't browse during the presentation
- **Keep answer windows short** — 15-20 seconds max
- **Read the question with energy** — you're the host!
- **Reveal answers dramatically** — pause between each one
- **Don't wait for stragglers** — move fast, keep momentum
- **Have the number visible the entire time** on the board screen
