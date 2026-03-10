export default function QuestionCard({ index, question, answer, evaluation, score, onAnswer, disabled }) {
  return (
    <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 space-y-4 hover:border-violet-500/30 transition-all duration-300">
      {/* Question */}
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center text-sm font-bold">
          {index + 1}
        </span>
        <p className="text-gray-200 font-medium leading-relaxed">{question}</p>
      </div>

      {/* Answer Input or Existing Answer */}
      {answer ? (
        <div className="ml-11 space-y-3">
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/30">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Your Answer</p>
            <p className="text-gray-300 text-sm">{answer}</p>
          </div>
          {evaluation && (
            <div className="bg-indigo-500/5 rounded-xl p-4 border border-indigo-500/20">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-indigo-400 uppercase tracking-wider">AI Evaluation</p>
                {score !== null && score !== undefined && (
                  <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${
                    score >= 7 ? 'bg-emerald-500/15 text-emerald-400' :
                    score >= 4 ? 'bg-amber-500/15 text-amber-400' :
                    'bg-red-500/15 text-red-400'
                  }`}>
                    {score}/10
                  </span>
                )}
              </div>
              <p className="text-gray-300 text-sm">{evaluation}</p>
            </div>
          )}
        </div>
      ) : onAnswer && !disabled ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const val = e.target.elements.answer.value.trim();
            if (val) onAnswer(val);
          }}
          className="ml-11 flex gap-2"
        >
          <input
            name="answer"
            placeholder="Type your answer..."
            className="flex-1 bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-lg shadow-violet-500/20"
          >
            Submit
          </button>
        </form>
      ) : null}
    </div>
  );
}
