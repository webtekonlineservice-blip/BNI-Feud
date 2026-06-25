import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [playersSnap, responsesSnap, questionsSnap] = await Promise.all([
      adminDb.collection('players').get(),
      adminDb.collection('responses').get(),
      adminDb.collection('questions').get(),
    ])

    const players = playersSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[]
    const responses = responsesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[]
    const questions = questionsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[]

    // Total stats
    const totalPlayers = players.length
    const totalResponses = responses.length
    const totalQuestions = questions.length
    const completedQuestions = questions.filter(q => q.is_complete).length

    // Match rate
    const matches = responses.filter(r => r.matched_answer)
    const matchRate = totalResponses > 0 ? Math.round((matches.length / totalResponses) * 100) : 0

    // Total points awarded
    const totalPoints = responses.reduce((sum: number, r: any) => sum + (r.points_earned || 0), 0)

    // Top players
    const topPlayers = [...players].sort((a, b) => b.total_score - a.total_score).slice(0, 5)

    // Most active players (by response count)
    const responseCounts: Record<string, number> = {}
    responses.forEach((r: any) => { responseCounts[r.display_name || r.player_id] = (responseCounts[r.display_name || r.player_id] || 0) + 1 })
    const mostActive = Object.entries(responseCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }))

    // Responses per question
    const responsesByQuestion: Record<string, number> = {}
    responses.forEach((r: any) => { responsesByQuestion[r.question_id] = (responsesByQuestion[r.question_id] || 0) + 1 })
    const avgResponsesPerQuestion = totalQuestions > 0 ? Math.round(totalResponses / totalQuestions) : 0

    // Best guesses (highest single-answer points)
    const bestGuesses = [...matches].sort((a: any, b: any) => b.points_earned - a.points_earned).slice(0, 5)

    return NextResponse.json({
      totalPlayers,
      totalResponses,
      totalQuestions,
      completedQuestions,
      matchRate,
      totalPoints,
      avgResponsesPerQuestion,
      topPlayers: topPlayers.map(p => ({ name: p.display_name, score: p.total_score })),
      mostActive,
      bestGuesses: bestGuesses.map((g: any) => ({ name: g.display_name, answer: g.raw_answer, matched: g.matched_answer, points: g.points_earned })),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
