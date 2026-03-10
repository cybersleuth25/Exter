import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { projectAPI, analysisAPI } from '@/services/api';
import Navbar from '@/components/Navbar';

export default function Dashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [user, setUser] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await projectAPI.list();
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (projectId) => {
    setAnalyzingId(projectId);
    try {
      await analysisAPI.analyze(projectId);
      router.push(`/analysis_results?project_id=${projectId}`);
    } catch (err) {
      alert('Analysis failed. Please check your AI API key and try again.');
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleDelete = async (projectId) => {
    if (!confirm('Delete this project and all its data?')) return;
    try {
      await projectAPI.delete(projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (err) {
      alert('Failed to delete project.');
    }
  };

  return (
    <>
      <Head><title>Dashboard — ProjectDefense AI</title></Head>
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 pt-24 pb-16">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">{user.name || 'User'}</span>
              </h1>
              <p className="text-gray-400 mt-1">Manage your projects and defense preparations</p>
            </div>
            <Link
              href="/submit_project"
              className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </Link>
          </div>

          {/* Projects */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <svg className="animate-spin h-8 w-8 text-violet-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20 bg-gray-900/30 border border-gray-800/50 rounded-2xl">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
              <p className="text-gray-400 mb-6">Submit your first project to get AI-powered feedback.</p>
              <Link href="/submit_project" className="px-6 py-3 rounded-xl font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-all">
                Submit Project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((p) => (
                <div key={p.id} className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6 hover:border-violet-500/30 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold group-hover:text-violet-400 transition-colors">{p.title}</h3>
                    {p.has_analysis && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400">Analyzed</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4">{p.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {p.tech_stack?.slice(0, 4).map((t, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-gray-800/60 text-gray-400">{t}</span>
                    ))}
                    {p.tech_stack?.length > 4 && (
                      <span className="px-2.5 py-1 rounded-lg text-xs bg-gray-800/60 text-gray-400">+{p.tech_stack.length - 4}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-800/50">
                    <button
                      onClick={() => handleAnalyze(p.id)}
                      disabled={analyzingId === p.id}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-all disabled:opacity-50"
                    >
                      {analyzingId === p.id ? '🔄 Analyzing...' : p.has_analysis ? '🔄 Re-Analyze' : '🤖 Analyze'}
                    </button>
                    {p.has_analysis && (
                      <>
                        <Link href={`/analysis_results?project_id=${p.id}`} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 transition-all">
                          📊 Results
                        </Link>
                        <Link href={`/viva_simulator?project_id=${p.id}`} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 transition-all">
                          🎙️ Viva
                        </Link>
                      </>
                    )}
                    <button onClick={() => handleDelete(p.id)} className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all ml-auto">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
