import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ParallaxBackground from '../components/ParallaxBackground';
import { reportAPI, allocationAPI, courseAPI } from '../services/api';
import { getUser } from '../utils/auth';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const user = getUser();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, coursesRes] = await Promise.all([
        reportAPI.getAnalytics(),
        courseAPI.getAll(),
      ]);
      setAnalytics(analyticsRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAllocation = async () => {
    if (!confirm('Run the allocation algorithm? This will clear existing allocations.')) return;
    setAllocating(true);
    setMessage(null);
    try {
      const response = await allocationAPI.run();
      setMessage({ type: 'success', text: `Allocation completed! ${response.data.totalStudents || ''} students processed.` });
      fetchData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Allocation failed.' });
    } finally {
      setAllocating(false);
    }
  };

  const totalSeats = courses.reduce((sum, c) => sum + c.seat_capacity, 0);
  const totalEnrolled = courses.reduce((sum, c) => sum + c.enrolled_count, 0);
  const avgUtilization = totalSeats > 0 ? ((totalEnrolled / totalSeats) * 100).toFixed(1) : 0;

  const adminStats = [
    { label: 'Total Students', value: analytics?.overview?.total_students ?? '-', icon: '👥', color: 'from-pink-400 to-rose-500',    bg: 'bg-pink-50' },
    { label: 'Total Courses',  value: courses.length,                              icon: '📚', color: 'from-blue-400 to-indigo-500',  bg: 'bg-blue-50' },
    { label: 'Enrollments',    value: totalEnrolled,                               icon: '✅', color: 'from-teal-400 to-green-500',   bg: 'bg-teal-50' },
    { label: 'Utilization',    value: `${avgUtilization}%`,                        icon: '📊', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50' },
  ];

  const adminLinks = [
    { to: '/admin/courses',     label: 'Manage Courses',      icon: '📖', color: 'from-blue-500 to-indigo-500' },
    { to: '/admin/preferences', label: 'Student Preferences', icon: '📝', color: 'from-pink-500 to-rose-500' },
    { to: '/admin/reports',     label: 'View Reports',        icon: '📈', color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 relative overflow-hidden">
      <ParallaxBackground />
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">

        {/* Hero Banner */}
        <div className="relative mb-10 rounded-3xl overflow-hidden animate-fadeIn"
          style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #FF9AB7 60%, #FDE68A 100%)' }}>
          <div className="absolute inset-0 stripe-bg opacity-30" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-10 gap-6">
            <div>
              <p className="text-white/80 font-medium mb-1 text-sm uppercase tracking-widest">Admin Control Panel</p>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow">
                Welcome, {user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-white/90 text-lg">Manage courses, preferences and allocations</p>
            </div>
            <button onClick={handleRunAllocation} disabled={allocating}
              className="flex items-center gap-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/40 rounded-2xl px-8 py-5 text-white font-black text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:opacity-50">
              {allocating ? (
                <><div className="spinner w-6 h-6 border-2 border-white/30 border-t-white" /><span>Running...</span></>
              ) : (
                <><span className="text-3xl">⚡</span><span>Run Allocation</span></>
              )}
            </button>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blob-shape" />
          <div className="absolute -bottom-8 left-20 w-28 h-28 bg-white/10 rounded-full blob-shape" style={{ animationDelay: '2s' }} />
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-5 rounded-2xl animate-fadeIn flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 border-2 border-green-200 text-green-800' : 'bg-red-50 border-2 border-red-200 text-red-800'
          }`}>
            <span className="text-2xl">{message.type === 'success' ? '✅' : '❌'}</span>
            <p className="font-semibold">{message.text}</p>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          {adminStats.map((s, i) => (
            <div key={s.label}
              className={`relative overflow-hidden rounded-3xl p-6 tilt-card animate-fadeIn ${s.bg} border border-white shadow-soft`}
              style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${s.color} opacity-20 blob-shape`} />
              <div className="relative z-10">
                <span className="text-3xl mb-3 block">{s.icon}</span>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">{s.label}</p>
                <p className={`text-4xl font-black mt-1 bg-gradient-to-br ${s.color} bg-clip-text text-transparent`}>
                  {loading ? '-' : s.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {adminLinks.map((l, i) => (
            <Link key={l.to} to={l.to}
              className={`group relative overflow-hidden rounded-3xl p-8 text-white shadow-xl tilt-card animate-fadeIn bg-gradient-to-br ${l.color}`}
              style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blob-shape group-hover:scale-125 transition-transform duration-500" />
              <div className="relative z-10">
                <span className="text-5xl mb-4 block">{l.icon}</span>
                <h3 className="text-2xl font-black mb-1">{l.label}</h3>
                <div className="mt-4 flex items-center gap-2 text-white/90 text-sm font-semibold group-hover:gap-4 transition-all duration-300">
                  <span>Open</span><span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Popular Courses */}
          <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="px-6 py-5 border-b border-gray-100"
              style={{ background: 'linear-gradient(135deg,rgba(147,197,253,0.15),rgba(255,154,183,0.1))' }}>
              <h2 className="text-xl font-black text-gray-900">🔥 Popular Courses</h2>
            </div>
            <div className="p-6 space-y-3">
              {analytics?.popularCourses?.length > 0 ? analytics.popularCourses.map((c: any, i: number) => (
                <div key={c.course_code}
                  className="stagger-item flex items-center gap-4 p-4 rounded-2xl hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg,rgba(147,197,253,0.08),rgba(255,154,183,0.06))', animationDelay: `${i * 0.08}s` }}>
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#93C5FD,#FF9AB7)' }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{c.course_code}</p>
                    <p className="text-xs text-gray-500 truncate">{c.course_name}</p>
                  </div>
                  <span className="text-xs bg-pink-100 text-pink-700 px-3 py-1 rounded-full font-bold flex-shrink-0">
                    {c.preference_count} prefs
                  </span>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-400">
                  <span className="text-4xl block mb-2">📭</span>
                  <p className="text-sm">No preference data yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Course Utilization */}
          <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden animate-fadeIn" style={{ animationDelay: '0.15s' }}>
            <div className="px-6 py-5 border-b border-gray-100"
              style={{ background: 'linear-gradient(135deg,rgba(52,211,153,0.1),rgba(16,185,129,0.05))' }}>
              <h2 className="text-xl font-black text-gray-900">📊 Course Utilization</h2>
            </div>
            <div className="p-6 space-y-4">
              {courses.slice(0, 6).map((c, i) => {
                const pct = Math.round((c.enrolled_count / c.seat_capacity) * 100);
                return (
                  <div key={c.id} className="stagger-item" style={{ animationDelay: `${i * 0.07}s` }}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold text-gray-800">{c.course_code}</span>
                      <span className="text-gray-500 font-medium">{c.enrolled_count}/{c.seat_capacity} ({pct}%)</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: pct > 80
                            ? 'linear-gradient(90deg,#FF9AB7,#FF7096)'
                            : pct > 50
                            ? 'linear-gradient(90deg,#FDE68A,#F59E0B)'
                            : 'linear-gradient(90deg,#93C5FD,#34D399)'
                        }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
