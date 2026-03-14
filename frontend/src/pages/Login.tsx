import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { setAuthToken, setUser as saveUser } from '../utils/auth';
import ParallaxBackground from '../components/ParallaxBackground';
import logoImg from '../assets/logo.png';
import type { User } from '../types';

interface LoginProps {
  setUser: (user: User) => void;
}

export default function Login({ setUser }: LoginProps) {
  const [isStudent, setIsStudent] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = isStudent
        ? await authAPI.studentLogin(email, password)
        : await authAPI.adminLogin(email, password);

      const { token, user } = response.data;
      setAuthToken(token);
      saveUser(user);
      setUser(user);

      navigate(user.role === 'student' ? '/student' : '/admin');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Animated Background Ribbons */}
      <ParallaxBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="hidden lg:block animate-fadeIn">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-full shadow-soft mb-8 animate-float overflow-hidden p-2">
                <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-6xl font-bold mb-6">
                <span className="gradient-text">Enjoy Learning</span>
              </h1>
              <h2 className="text-5xl font-bold text-gray-800 mb-6">
                 <span className="gradient-text">Choose wisely</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                 Ai Based Courses electives #VFSTR
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div className="text-center">
                  <p className="text-4xl font-bold gradient-text">3000+</p>
                  <p className="text-gray-600 mt-2">Students</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold gradient-text">10+</p>
                  <p className="text-gray-600 mt-2">Mentors</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold gradient-text">25+</p>
                  <p className="text-gray-600 mt-2">Courses</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="animate-fadeIn" style={{animationDelay: '0.2s'}}>
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-soft mb-4 overflow-hidden p-2">
                <img src="logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-4xl font-bold gradient-text mb-2">Course Allocation</h1>
              <p className="text-gray-600">AI-Powered Smart System</p>
            </div>

            {/* Login Card */}
            <div className="glass rounded-3xl shadow-hover p-10 border border-white/50 backdrop-blur-xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
                <p className="text-gray-600">Sign in to continue your learning journey</p>
              </div>

              {/* Role Toggle */}
              <div className="flex mb-8 bg-gray-50/50 rounded-2xl p-1.5 backdrop-blur-sm">
                <button
                  type="button"
                  className={`flex-1 py-4 rounded-xl font-semibold transition-all duration-300 transform ${
                    isStudent
                      ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-lg scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                  onClick={() => setIsStudent(true)}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Student
                  </div>
                </button>
                <button
                  type="button"
                  className={`flex-1 py-4 rounded-xl font-semibold transition-all duration-300 transform ${
                    !isStudent
                      ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-lg scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                  onClick={() => setIsStudent(false)}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Admin
                  </div>
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Input */}
                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                  <label className="form-label text-gray-700 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input bg-white/80 backdrop-blur-sm"
                    placeholder={isStudent ? 'student@gmail.com' : 'admin@gmail.com'}
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                  <label className="form-label text-gray-700 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input bg-white/80 backdrop-blur-sm"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-400 p-4 rounded-2xl animate-fadeIn">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-red-700 text-sm font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full font-bold py-4 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                    isStudent 
                      ? 'bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white'
                      : 'bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="spinner w-5 h-5 border-2"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Get Started</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

            </div>

            {/* Footer */}
            <div className="text-center mt-8 text-gray-600 text-sm">
              <p className="font-medium">© 2026 Course Allocation System</p>
              <p className="mt-1 text-gray-500">Powered by AI & Machine Learning</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
