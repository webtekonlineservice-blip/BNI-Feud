import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

// POST /api/admin/notify-winner
// Sends SMS to the winner with their final score
export async function POST(req: NextRequest) {
  try {
    if (!accountSid || !authToken || !twilioNumber) {
      return NextResponse.json({ error: 'Twilio not configured' }, { status: 500 });
    }

    const client = twilio(accountSid, authToken);
    
    // Get the top player (winner)
    const playersSnap = await adminDb
      .collection('players')
      .orderBy('total_score', 'desc')
      .limit(3)
      .get();

    if (playersSnap.empty) {
      return NextResponse.json({ error: 'No players found' }, { status: 404 });
    }

    const players = playersSnap.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as any[];

    const winner = players[0];
    const secondPlace = players[1];
    const thirdPlace = players[2];

    // Send SMS to winner
    const message = await client.messages.create({
      body: `🏆 CONGRATULATIONS ${winner.display_name}! 🏆

You WON the BNI Family Feud game!

Your Score: ${winner.total_score} points
${secondPlace ? `2nd Place: ${secondPlace.display_name} (${secondPlace.total_score} pts)` : ''}
${thirdPlace ? `3rd Place: ${thirdPlace.display_name} (${thirdPlace.total_score} pts)` : ''}

You're the champion! 🎉
Enjoy your prize!

- BNI Think Big St. Louis`,
      from: twilioNumber,
      to: winner.phone_number,
    });

    console.log(`Winner notification sent to ${winner.display_name}: ${message.sid}`);

    // Optionally send congratulations to 2nd and 3rd place
    if (secondPlace) {
      await client.messages.create({
        body: `🥈 Great job ${secondPlace.display_name}!

You placed 2nd in BNI Family Feud!

Your Score: ${secondPlace.total_score} points
Winner: ${winner.display_name} (${winner.total_score} pts)

Well played! See you next time! 🎯

- BNI Think Big St. Louis`,
        from: twilioNumber,
        to: secondPlace.phone_number,
      });
    }

    if (thirdPlace) {
      await client.messages.create({
        body: `🥉 Nice work ${thirdPlace.display_name}!

You placed 3rd in BNI Family Feud!

Your Score: ${thirdPlace.total_score} points

Great effort! Keep playing! 🎮

- BNI Think Big St. Louis`,
        from: twilioNumber,
        to: thirdPlace.phone_number,
      });
    }

    return NextResponse.json({ 
      ok: true, 
      winner: winner.display_name,
      score: winner.total_score,
      message: 'Winner notifications sent successfully'
    });
  } catch (error: any) {
    console.error('Error sending winner notification:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to send notifications' 
    }, { status: 500 });
  }
}
