import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { authAPI } from '@/services/api';
import Navbar from '@/components/Navbar';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Log In — ProjectDefense AI</title>
      </Head>
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen px-4 pt-16">
          <div className="w-full max-w-md">
            <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-8 backdrop-blur-xl">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/25">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold">Welcome Back</h1>
                <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-6 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
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
                    required
                    placeholder="••••••••"
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-400">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-violet-400 hover:text-violet-300 font-medium">Sign up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
