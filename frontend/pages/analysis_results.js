import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { analysisAPI } from '@/services/api';
import Navbar from '@/components/Navbar';
import ScoreCard from '@/components/ScoreCard';
import ReportDownload from '@/components/ReportDownload';

const JUDGE_ICONS = {
  technical: '⚙️',
  investor: '💰',
  academic: '🎓',
  product: '🎨',
};

export default function AnalysisResults() {
  const router = useRouter();
  const { project_id } = router.query;
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    if (project_id) fetchAnalysis();
  }, [project_id]);

  const fetchAnalysis = async () => {
    try {
      const res = await analysisAPI.get(project_id);
      setAnalysis(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        alert('No analysis found for this project. Run analysis first.');
        router.push('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-violet-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!analysis) return null;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'judges', label: 'Judge Questions' },
    { key: 'suggestions', label: 'Suggestions' },
  ];

  return (
    <>
      <Head><title>Analysis Results — ProjectDefense AI</title></Head>
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 pt-24 pb-16">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">← Back to Dashboard</Link>
              <h1 className="text-3xl font-bold mt-2">Analysis Results</h1>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/viva_simulator?project_id=${project_id}`}
                className="px-5 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
              >
                🎙️ Start Viva
              </Link>
              <ReportDownload projectId={project_id} />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-900/50 p-1 rounded-xl mb-8 w-fit">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === t.key
                    ? 'bg-violet-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Summary */}
                <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-3 text-violet-400">📝 Project Summary</h2>
                  <p className="text-gray-300 leading-relaxed">{analysis.summary}</p>
                </div>

                {/* Strengths */}
                <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-3 text-emerald-400">✅ Strengths</h2>
                  <ul className="space-y-2">
                    {analysis.strengths?.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-3 text-amber-400">⚠️ Weaknesses</h2>
                  <ul className="space-y-2">
                    {analysis.weaknesses?.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Scorecard */}
              <div>
                <ScoreCard scores={analysis.scores} />
              </div>
            </div>
          )}

          {activeTab === 'judges' && (
            <div className="space-y-6">
              {analysis.judge_questions?.map((jq, i) => (
                <div key={i} className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span>{JUDGE_ICONS[jq.judge_type] || '👤'}</span>
                    {jq.judge_name}
                  </h3>
                  <ol className="space-y-3">
                    {jq.questions?.map((q, qi) => (
                      <li key={qi} className="flex items-start gap-3 text-gray-300">
                        <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center text-xs font-bold">{qi + 1}</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 text-violet-400">💡 Improvement Suggestions</h2>
              <div className="space-y-3">
                {analysis.suggestions?.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 text-gray-300 bg-gray-800/30 rounded-xl p-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-sm font-bold">{i + 1}</span>
                    <span className="leading-relaxed">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
