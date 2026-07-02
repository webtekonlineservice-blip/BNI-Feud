'use client';

interface AnalyticsTabProps {
  analytics: any;
}

export default function AnalyticsTab({ analytics }: AnalyticsTabProps) {
  if (!analytics) {
    return <p className="text-gray-500">Loading analytics...</p>;
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{analytics.totalPlayers}</p>
          <p className="text-sm text-gray-500">Total Players</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{analytics.totalResponses}</p>
          <p className="text-sm text-gray-500">Total Responses</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{analytics.matchRate}%</p>
          <p className="text-sm text-gray-500">Match Rate</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{analytics.totalPoints}</p>
          <p className="text-sm text-gray-500">Total Points</p>
        </div>
      </div>

      {/* Top Players */}
      {analytics.topPlayers && analytics.topPlayers.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Top Players</h3>
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
            {analytics.topPlayers.map((p: any, i: number) => (
              <div key={i} className="flex justify-between items-center px-4 py-2">
                <span>{p.name}</span>
                <span className="font-semibold text-bni-red">{p.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Most Active */}
      {analytics.mostActive && analytics.mostActive.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Most Active</h3>
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
            {analytics.mostActive.map((p: any, i: number) => (
              <div key={i} className="flex justify-between items-center px-4 py-2">
                <span>{p.name}</span>
                <span className="text-gray-500">{p.answerCount} answers</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Guesses */}
      {analytics.bestGuesses && analytics.bestGuesses.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Best Guesses</h3>
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
            {analytics.bestGuesses.map((g: any, i: number) => (
              <div key={i} className="flex justify-between items-center px-4 py-2">
                <div>
                  <span className="font-medium">{g.name}</span>
                  <span className="text-gray-500 text-sm ml-2">&quot;{g.answer}&quot;</span>
                  {g.matched && <span className="text-green-600 text-xs ml-2">&#10003; matched</span>}
                </div>
                <span className="font-semibold text-bni-red">{g.points} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      {analytics.completedQuestions !== undefined && (
        <p className="text-sm text-gray-500 mt-4">
          {analytics.completedQuestions}/{analytics.totalQuestions} questions played · avg {analytics.avgAnswersPerQuestion} answers/question
        </p>
      )}
    </div>
  );
}
