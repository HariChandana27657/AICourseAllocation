import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { removeAuthToken } from '../utils/auth';
import logoImg from '../assets/logo.png';
import NotificationBell from './NotificationBell';
import type { User } from '../types';

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    removeAuthToken();
    navigate('/login');
  };

  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';

  const isActive = (path: string) => location.pathname === path;

  const studentLinks = [
    { path: '/student', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/student/courses', label: 'Courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { path: '/student/preferences', label: 'Preferences', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { path: '/student/results', label: 'Results', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  ];

  const adminLinks = [
    { path: '/admin', label: 'Dashboard', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { path: '/admin/courses', label: 'Courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { path: '/admin/preferences', label: 'Preferences', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { path: '/admin/reports', label: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ];

  const links = isStudent ? studentLinks : isAdmin ? adminLinks : [];

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to={isStudent ? '/student' : '/admin'} className="flex-shrink-0 flex items-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-blue-400 rounded-2xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg overflow-hidden p-1">
                <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="ml-3 text-xl font-bold gradient-text hidden sm:block">Course Allocation</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-10 md:flex md:space-x-2">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 transform hover:scale-105 ${
                    isActive(link.path)
                      ? 'bg-gradient-to-r from-pink-400 to-blue-400 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-white/50 backdrop-blur-sm'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                  </svg>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            {/* Notification Bell */}
            <NotificationBell />

            {/* User Info */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/50 shadow-soft transform transition-all duration-300 hover:scale-105">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2.5 rounded-xl text-gray-700 hover:bg-white/50 backdrop-blur-sm transition-all duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/20 glass backdrop-blur-xl animate-slideIn">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 ${
                  isActive(link.path)
                    ? 'bg-gradient-to-r from-pink-400 to-blue-400 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-white/50 backdrop-blur-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                  </svg>
                  {link.label}
                </div>
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-white/20">
            <div className="flex items-center px-4 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="text-base font-semibold text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mx-4 w-[calc(100%-2rem)] flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
