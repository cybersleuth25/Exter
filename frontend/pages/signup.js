import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { authAPI } from '@/services/api';
import Navbar from '@/components/Navbar';

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.signup(form);
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up — ProjectDefense AI</title>
      </Head>
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen px-4 pt-16">
          <div className="w-full max-w-md">
            <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-8 backdrop-blur-xl">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/25">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold">Create Account</h1>
                <p className="text-gray-400 text-sm mt-1">Start preparing for your project defense</p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-6 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required minLength={2}
                    placeholder="John Doe"
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required minLength={6}
                    placeholder="Min. 6 characters"
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-400">
                Already have an account?{' '}
                <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
