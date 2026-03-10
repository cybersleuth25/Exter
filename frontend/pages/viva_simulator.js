import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { vivaAPI } from '@/services/api';
import Navbar from '@/components/Navbar';
import QuestionCard from '@/components/QuestionCard';

const JUDGES = [
  { key: 'technical', name: 'Dr. Technica', role: 'Technical Judge', icon: '⚙️', desc: 'System design, scalability, architecture' },
  { key: 'investor', name: 'Mr. Capital', role: 'Startup Investor', icon: '💰', desc: 'Business model, market, revenue' },
  { key: 'academic', name: 'Prof. Scholar', role: 'Academic Examiner', icon: '🎓', desc: 'Algorithms, implementation, theory' },
  { key: 'product', name: 'Ms. UX', role: 'Product Judge', icon: '🎨', desc: 'User experience, product-market fit' },
];

export default function VivaSimulator() {
  const router = useRouter();
  const { project_id } = router.query;

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [answeringIdx, setAnsweringIdx] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    if (project_id) fetchHistory();
  }, [project_id]);

  const fetchHistory = async () => {
    try {
      const res = await vivaAPI.history(project_id);
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const startSession = async (judgeType) => {
    setLoading(true);
    try {
      const res = await vivaAPI.start({ project_id, judge_type: judgeType });
      setSession(res.data);
    } catch (err) {
      alert('Failed to start viva session. Make sure AI API key is configured.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (questionIndex, answer) => {
    setAnsweringIdx(questionIndex);
    try {
      const res = await vivaAPI.answer({
        session_id: session.id,
        question_index: questionIndex,
        answer,
      });
      setSession(res.data);
    } catch (err) {
      alert('Failed to submit answer.');
    } finally {
      setAnsweringIdx(null);
    }
  };

  return (
    <>
      <Head><title>Viva Simulator — ProjectDefense AI</title></Head>
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 pt-24 pb-16">
          <div className="mb-8">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">← Back to Dashboard</Link>
            <h1 className="text-3xl font-bold mt-2">Mock Viva Simulator</h1>
            <p className="text-gray-400 mt-1">Select a judge personality and practice your defense.</p>
          </div>

          {/* ── No Active Session ─────────────────── */}
          {!session && (
            <>
              {/* Judge Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {JUDGES.map((j) => (
                  <button
                    key={j.key}
                    onClick={() => startSession(j.key)}
                    disabled={loading}
                    className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6 text-left hover:border-violet-500/40 hover:bg-gray-800/30 transition-all duration-300 group disabled:opacity-50"
                  >
                    <div className="text-3xl mb-3">{j.icon}</div>
                    <h3 className="text-lg font-semibold group-hover:text-violet-400 transition-colors">{j.name}</h3>
                    <p className="text-sm text-gray-500">{j.role}</p>
                    <p className="text-sm text-gray-400 mt-2">{j.desc}</p>
                  </button>
                ))}
              </div>

              {loading && (
                <div className="text-center py-10">
                  <svg className="animate-spin h-8 w-8 text-violet-500 mx-auto mb-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-gray-400">Generating questions from your AI judge...</p>
                </div>
              )}

              {/* Session History */}
              {history.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-sm text-gray-400 hover:text-white transition-colors mb-4 flex items-center gap-1"
                  >
                    {showHistory ? '▼' : '▶'} Past Sessions ({history.length})
                  </button>
                  {showHistory && (
                    <div className="space-y-3">
                      {history.map((h) => (
                        <div key={h.id} className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium capitalize">{h.judge_type} Judge</span>
                            <span className="text-gray-500 text-sm ml-3">{new Date(h.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {h.is_completed ? (
                              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                                h.final_score >= 7 ? 'bg-emerald-500/15 text-emerald-400' :
                                h.final_score >= 4 ? 'bg-amber-500/15 text-amber-400' :
                                'bg-red-500/15 text-red-400'
                              }`}>
                                {h.final_score}/10
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">In progress</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── Active Session ────────────────────── */}
          {session && (
            <div>
              {/* Session Header */}
              <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold capitalize">{session.judge_type} Judge Session</h2>
                    <p className="text-gray-400 text-sm mt-1">
                      {session.is_completed
                        ? '✅ Session completed'
                        : `Question ${session.current_question_index + 1} of ${session.questions.length}`
                      }
                    </p>
                  </div>
                  {session.is_completed && session.final_score !== null && (
                    <div className="text-center">
                      <div className={`text-3xl font-bold px-4 py-2 rounded-2xl ${
                        session.final_score >= 7 ? 'bg-emerald-500/15 text-emerald-400' :
                        session.final_score >= 4 ? 'bg-amber-500/15 text-amber-400' :
                        'bg-red-500/15 text-red-400'
                      }`}>
                        {session.final_score}/10
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Final Score</p>
                    </div>
                  )}
                </div>
                {/* Progress bar */}
                {!session.is_completed && (
                  <div className="mt-4 w-full bg-gray-800/60 rounded-full h-2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${(session.current_question_index / session.questions.length) * 100}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Q&A Cards */}
              <div className="space-y-4">
                {session.questions.map((qa, i) => (
                  <QuestionCard
                    key={i}
                    index={i}
                    question={qa.question}
                    answer={qa.answer}
                    evaluation={qa.evaluation}
                    score={qa.score}
                    onAnswer={(ans) => submitAnswer(i, ans)}
                    disabled={i !== session.current_question_index || answeringIdx !== null || session.is_completed}
                  />
                ))}
              </div>

              {/* Completed Actions */}
              {session.is_completed && (
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={() => { setSession(null); fetchHistory(); }}
                    className="px-6 py-3 rounded-xl font-medium bg-violet-600 hover:bg-violet-500 text-white transition-all"
                  >
                    New Session
                  </button>
                  <Link
                    href={`/analysis_results?project_id=${project_id}`}
                    className="px-6 py-3 rounded-xl font-medium border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 transition-all"
                  >
                    View Analysis
                  </Link>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
