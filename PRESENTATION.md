# BNI Family Feud — 10 Minute Presentation Agenda

## Goal
Show the Think Big chapter what Webtek can build — using THEM as the demo. Every member plays the game, experiences the tech firsthand, and sees what's possible for their business.

---

## Pre-Meeting Setup (5 min before)
- [ ] Run `node scripts/clear-game.js` (fresh game)
- [ ] Open `https://bni-feud.vercel.app` on the projector (QR + instructions)
- [ ] Open `https://bni-feud.vercel.app/host` on your laptop (game control)
- [ ] Have your phone ready for demo texts

---

## The 10 Minutes

### 0:00 — Hook (30 sec)
> "For my 10 minutes today, we're going to play a game. I built this in the last week — it's about YOU."

- Point to the screen showing the QR code
- **Tech shown:** Custom web app, real-time player count

### 0:30 — Registration (1 min)
> "Everyone pull out your phone and scan that QR code. Enter your name and phone number."

- Watch player count climb live on screen
- As people register, they get a confirmation text
- **Tech shown:** QR codes, SMS (Twilio), real-time database (Firebase), mobile-responsive design

### 1:30 — Start the Game (30 sec)
> "Alright, [X] players registered. Let's play Family Feud — BNI edition. I used AI to write a personalized question about each of you."

- Click "Start Game" on `/host`
- First question appears
- **Tech shown:** AI content generation (DeepSeek)

### 2:00 — Round 1 (2 min)
> "[Read question aloud]. Text your answer to the game number NOW."

- Answers stream in live on screen
- Matches reveal in real-time
- Leaderboard ticker scrolls across
- **Tech shown:** SMS webhooks, fuzzy matching algorithm, real-time updates, live data streaming

### 4:00 — Round 2 (2 min)
> "Next question — this one's about [member name]..."

- Same flow — faster now that people know how it works
- React to the answers, make it fun

### 6:00 — Round 3 (2 min)
> "One more round..."

- By now the room is engaged and laughing

### 8:00 — Leaderboard + Winner (1 min)
> "Let's see who won!"

- Click through to leaderboard
- Winner gets announced on screen
- Winner gets a congratulations text automatically
- **Tech shown:** Automated notifications, data aggregation

### 9:00 — The Pitch (1 min)
> "Everything you just experienced — I built in a week.
> 
> - The website you scanned into
> - The texts you received  
> - The AI that wrote questions about each of you
> - The real-time game board
> - The analytics tracking every answer
> 
> This is what we do at Webtek. If you need a website, an app, SMS automation, AI integration, or any custom tech — that's our thing.
> 
> Who here has a client that could use something like this for their business?"

---

## Tech Stack (what you're demonstrating)

| Tech | Where they see it |
|------|-------------------|
| **Custom Web App** | The entire game |
| **Real-time Database** | Scores updating live |
| **SMS/Twilio** | Texts they send and receive |
| **AI (DeepSeek)** | Questions written about them |
| **QR Codes** | Registration |
| **Serverless (Vercel)** | Fast, no loading, scales |
| **Firebase** | Auth, database, hosting |
| **Analytics** | Tracking engagement |
| **Responsive Design** | Works on every phone |
| **Admin Panel** | Backend management |

---

## Talking Points (if asked)

- "How long did this take?" → Built in a week, deployed same day
- "What does something like this cost?" → Depends on scope, but custom apps start at $X
- "Can you do this for my business?" → Yes — events, lead gen, customer engagement, internal tools
- "What else can you build?" → Websites, apps, automations, AI integrations, SMS marketing

---

## Backup Plan

If something breaks:
- SMS stops working → Have people shout answers, you type them
- Projector fails → Use your laptop screen, describe what's happening
- Nobody registers → Pre-register 2-3 friends before the meeting

---

## After the Meeting

- The game stays live — people can share the URL
- Winner texts go out automatically
- Follow up with "Hey, enjoyed the game? I can build something similar for your [business/event/clients]"
- Track who engaged most (analytics tab) for follow-up targets

---

## One-Liner for the Week Before

> "Next Thursday I'm doing something different for my 10 minutes. Bring your phone — you're going to want to play."
