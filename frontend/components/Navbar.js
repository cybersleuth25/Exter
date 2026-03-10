import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('token');
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/submit_project', label: 'New Project' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={isLoggedIn ? '/dashboard' : '/'} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              ProjectDefense AI
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {isLoggedIn && navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  router.pathname === link.href
                    ? 'bg-violet-500/15 text-violet-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <span className="text-sm text-gray-400">
                  Hi, <span className="text-violet-400 font-medium">{user.name || 'User'}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-all">
                  Log In
                </Link>
                <Link href="/signup" className="px-5 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-gray-950/95 backdrop-blur-xl border-t border-gray-800/50 pb-4">
          <div className="px-4 pt-2 space-y-1">
            {isLoggedIn && navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50"
              >
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" className="block px-4 py-3 rounded-lg text-sm text-gray-400 hover:text-white" onClick={() => setMobileOpen(false)}>Log In</Link>
                <Link href="/signup" className="block px-4 py-3 rounded-lg text-sm text-white bg-violet-600 hover:bg-violet-500 text-center" onClick={() => setMobileOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
