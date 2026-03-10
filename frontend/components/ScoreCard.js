const SCORE_LABELS = {
  technical_complexity: { label: 'Technical Complexity', icon: '⚙️' },
  innovation: { label: 'Innovation', icon: '💡' },
  scalability: { label: 'Scalability', icon: '📈' },
  business_potential: { label: 'Business Potential', icon: '💰' },
  implementation_clarity: { label: 'Implementation Clarity', icon: '📋' },
  overall: { label: 'Overall Score', icon: '🏆' },
};

function ScoreBar({ value, max = 10 }) {
  const pct = (value / max) * 100;
  const color =
    value >= 7 ? 'from-emerald-500 to-emerald-400' :
    value >= 4 ? 'from-amber-500 to-amber-400' :
    'from-red-500 to-red-400';

  return (
    <div className="w-full bg-gray-800/60 rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function ScoreCard({ scores }) {
  if (!scores) return null;

  const categories = Object.entries(SCORE_LABELS).filter(([k]) => k !== 'overall');
  const overall = scores.overall ?? 0;

  return (
    <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 space-y-6">
      {/* Overall Score Ring */}
      <div className="flex flex-col items-center">
        <div className="relative w-28 h-28">
          <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" className="text-gray-800" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(overall / 10) * 327} 327`}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{overall}</span>
            <span className="text-xs text-gray-400">/10</span>
          </div>
        </div>
        <p className="mt-2 text-sm font-medium text-gray-400">Overall Score</p>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4">
        {categories.map(([key, meta]) => (
          <div key={key} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">
                <span className="mr-1.5">{meta.icon}</span>
                {meta.label}
              </span>
              <span className="text-sm font-semibold text-gray-200">{scores[key] ?? 0}/10</span>
            </div>
            <ScoreBar value={scores[key] ?? 0} />
          </div>
        ))}
      </div>
    </div>
  );
}
