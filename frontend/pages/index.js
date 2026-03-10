import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Head from 'next/head';

const features = [
  {
    icon: '🤖',
    title: 'AI Project Analyzer',
    desc: 'Get instant summary, strength analysis, and weakness detection powered by advanced AI.',
  },
  {
    icon: '👨‍⚖️',
    title: 'Multiple AI Judges',
    desc: 'Face Technical, Investor, Academic, and Product judges — each with a unique perspective.',
  },
  {
    icon: '🎙️',
    title: 'Mock Viva Simulator',
    desc: 'Practice your defense with interactive Q&A sessions and real-time AI evaluation.',
  },
  {
    icon: '📊',
    title: 'Smart Scoring',
    desc: 'Receive detailed scores across complexity, innovation, scalability, and more.',
  },
  {
    icon: '🔍',
    title: 'Weakness Detection',
    desc: 'AI identifies gaps in architecture, business model, scalability, and implementation.',
  },
  {
    icon: '📄',
    title: 'PDF Reports',
    desc: 'Download structured evaluation reports with scores, Q&A, and improvement suggestions.',
  },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>ProjectDefense AI — Prepare for Any Project Defense</title>
        <meta name="description" content="AI-powered platform to prepare for hackathons, project defenses, viva exams, and startup pitch evaluations." />
      </Head>

      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />

        {/* Hero */}
        <section className="relative pt-32 pb-20 px-4 overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-3xl" />
          <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />

          <div className="relative max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              AI-Powered Defense Preparation
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight">
              Ace Every{' '}
              <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Project Defense
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Simulate real judges, get AI-driven feedback, and perfect your project
              before the big day — whether it&apos;s a hackathon, viva, or investor pitch.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-2xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 hover:-translate-y-0.5"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 rounded-xl text-lg font-semibold border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 hover:bg-gray-800/50 transition-all duration-300"
              >
                Sign In →
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Everything You Need to{' '}
                <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  Succeed
                </span>
              </h2>
              <p className="mt-4 text-gray-400 max-w-xl mx-auto">
                Our AI platform covers every aspect of project evaluation and defense preparation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="group bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6 hover:border-violet-500/30 hover:bg-gray-800/30 transition-all duration-300"
                >
                  <div className="text-4xl mb-4">{f.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-violet-400 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/20 rounded-3xl p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Defend Your Project?</h2>
            <p className="text-gray-400 mb-8">Create an account and get AI-powered feedback in minutes.</p>
            <Link
              href="/signup"
              className="inline-block px-8 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-2xl shadow-violet-500/25 transition-all hover:-translate-y-0.5"
            >
              Start Now — It&apos;s Free
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800/50 py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <span>© 2026 ProjectDefense AI. All rights reserved.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
