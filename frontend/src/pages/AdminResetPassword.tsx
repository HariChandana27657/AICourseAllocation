import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ParallaxBackground from '../components/ParallaxBackground';
import { authAPI } from '../services/api';
import { getUser } from '../utils/auth';

export default function AdminResetPassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const user = getUser();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }
    if (newPassword === currentPassword) {
      setMessage({ type: 'error', text: 'New password must be different from current password' });
      return;
    }

    setLoading(true);
    try {
      await authAPI.adminResetPassword(currentPassword, newPassword);
      setMessage({ type: 'success', text: '✅ Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate('/admin'), 2000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  const strength = (pwd: string) => {
    if (pwd.length === 0) return null;
    if (pwd.length < 6) return { label: 'Too short', color: 'bg-red-400', width: '25%' };
    if (pwd.length < 8) return { label: 'Weak', color: 'bg-orange-400', width: '50%' };
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { label: 'Medium', color: 'bg-yellow-400', width: '75%' };
    return { label: 'Strong', color: 'bg-green-400', width: '100%' };
  };

  const pwdStrength = strength(newPassword);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 relative overflow-hidden">
      <ParallaxBackground />
      <Navbar user={user} />

      <div className="max-w-lg mx-auto px-4 py-12 relative z-10">
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">Update your admin account password</p>
        </div>

        <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-8 animate-fadeIn">
          {/* Admin info */}
          <div className="flex items-center gap-4 p-4 rounded-2xl mb-8"
            style={{ background: 'linear-gradient(135deg, rgba(255,154,183,0.1), rgba(147,197,253,0.1))' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-black"
              style={{ background: 'linear-gradient(135deg, #FF9AB7, #93C5FD)' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Admin</span>
            </div>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-fadeIn ${
              message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <span className="text-xl">{message.type === 'success' ? '✅' : '❌'}</span>
              <p className="font-medium text-sm">{message.text}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="form-label">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="form-input pr-12"
                  placeholder="Enter current password"
                  required
                />
                <button type="button" onClick={() => setShowCurrent(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurrent ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="form-label">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="form-input pr-12"
                  placeholder="Enter new password (min 6 chars)"
                  required
                />
                <button type="button" onClick={() => setShowNew(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNew ? '🙈' : '👁️'}
                </button>
              </div>
              {/* Strength bar */}
              {pwdStrength && (
                <div className="mt-2">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${pwdStrength.color}`}
                      style={{ width: pwdStrength.width }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{pwdStrength.label}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={`form-input ${confirmPassword && confirmPassword !== newPassword ? 'border-red-400' : ''}`}
                placeholder="Re-enter new password"
                required
              />
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate('/admin')}
                className="flex-1 py-3 rounded-full border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-3 rounded-full text-white font-bold transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #FF9AB7, #93C5FD)' }}>
                {loading ? <><div className="spinner w-4 h-4 border-2" /> Updating...</> : '🔐 Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
