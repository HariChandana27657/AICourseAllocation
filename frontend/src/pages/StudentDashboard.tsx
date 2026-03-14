import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ParallaxBackground from '../components/ParallaxBackground';
import { preferenceAPI, allocationAPI, courseAPI } from '../services/api';
import type { User, Preference, Enrollment, Course } from '../types';

interface StudentDashboardProps {
  user: User | null;
}

const statCards = [
  { key: 'courses',     label: 'Total Courses',  color: 'from-pink-400 to-rose-500',    icon: '📚', bg: 'bg-pink-50' },
  { key: 'preferences', label: 'Preferences',    color: 'from-blue-400 to-indigo-500',  icon: '📝', bg: 'bg-blue-50' },
  { key: 'allocated',   label: 'Allocated',      color: 'from-teal-400 to-green-500',   icon: '✅', bg: 'bg-teal-50' },
  { key: 'gpa',         label: 'Your GPA',       color: 'from-amber-400 to-orange-500', icon: '🎓', bg: 'bg-amber-50' },
];

const quickLinks = [
  { to: '/student/courses',     label: 'Browse Courses',     sub: 'Explore all available courses',  color: 'from-pink-500 to-rose-500',   icon: '🔍', delay: '0s' },
  { to: '/student/preferences', label: 'Submit Preferences', sub: 'Rank your top course choices',   color: 'from-blue-500 to-indigo-500', icon: '📋', delay: '0.1s' },
  { to: '/student/results',     label: 'View Results',       sub: 'Check your allocated courses',   color: 'from-teal-500 to-green-500',  icon: '🎯', delay: '0.2s' },
];

export default function StudentDashboard({ user }: StudentDashboardProps) {
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [allocations, setAllocations] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [prefRes, allocRes, coursesRes] = await Promise.all([
        preferenceAPI.get(),
        allocationAPI.getResults(),
        courseAPI.getAll(),
      ]);
      setPreferences(prefRes.data);
      setAllocations(allocRes.data.allocatedCourses);
      setCourses(coursesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statValues: Record<string, string | number> = {
    courses: courses.length,
    preferences: preferences.length,
    allocated: allocations.length,
    gpa: user?.gpa ?? 0,
  };

  return (    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 relative overflow-hidden">
      <ParallaxBackground />
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">

        {/* -- Hero Welcome Banner -- */}
        <div className="relative mb-10 rounded-3xl overflow-hidden animate-fadeIn"
          style={{ background: 'linear-gradient(135deg, #FF9AB7 0%, #93C5FD 60%, #FDE68A 100%)' }}>
          <div className="absolute inset-0 stripe-bg opacity-30" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-10 gap-6">
            <div>
              <p className="text-white/80 font-medium mb-1 text-sm uppercase tracking-widest">Student Portal</p>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow">
                Hello, {user?.name?.split(' ')[0]}! 
              </h1>
              <p className="text-white/90 text-lg">{user?.department} &nbsp;&nbsp; GPA: <strong>{user?.gpa}</strong></p>
            </div>
            <div className="flex gap-4">
              {quickLinks.map(q => (
                <Link key={q.to} to={q.to}
                  className="flex flex-col items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl px-5 py-4 text-white transition-all duration-300 hover:scale-110 hover:shadow-xl">
                  <span className="text-3xl">{q.icon}</span>
                  <span className="text-xs font-semibold whitespace-nowrap">{q.label.split(' ')[0]}</span>
                </Link>
              ))}
            </div>
          </div>
          {/* Decorative blobs inside banner */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blob-shape" />
          <div className="absolute -bottom-8 left-20 w-28 h-28 bg-white/10 rounded-full blob-shape" style={{animationDelay:'2s'}} />
        </div>

        {/*  Stat Cards  */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          {statCards.map((s, i) => (
            <div key={s.key}
              className={`relative overflow-hidden rounded-3xl p-6 tilt-card animate-fadeIn ${s.bg} border border-white shadow-soft`}
              style={{ animationDelay: `${i * 0.1}s` }}>
              {/* Background blob */}
              <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${s.color} opacity-20 blob-shape`} />
              <div className="relative z-10">
                <span className="text-3xl mb-3 block">{s.icon}</span>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">{s.label}</p>
                <p className={`text-4xl font-black mt-1 bg-gradient-to-br ${s.color} bg-clip-text text-transparent`}>
                  {loading ? '�' : statValues[s.key]}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/*  Quick Action Cards  */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {quickLinks.map((q) => (
            <Link key={q.to} to={q.to}
              className={`group relative overflow-hidden rounded-3xl p-8 text-white shadow-xl tilt-card animate-fadeIn bg-gradient-to-br ${q.color}`}
              style={{ animationDelay: q.delay }}>
              {/* Animated background shape */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blob-shape group-hover:scale-125 transition-transform duration-500" />
              <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full" />
              <div className="relative z-10">
                <span className="text-5xl mb-4 block">{q.icon}</span>
                <h3 className="text-2xl font-black mb-1">{q.label}</h3>
                <p className="text-white/80 text-sm">{q.sub}</p>
                <div className="mt-4 flex items-center gap-2 text-white/90 text-sm font-semibold group-hover:gap-4 transition-all duration-300">
                  <span>Go now</span>
                  <span></span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/*  Bottom Panels  */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Preferences Panel */}
          <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100"
              style={{ background: 'linear-gradient(135deg, rgba(255,154,183,0.1), rgba(147,197,253,0.1))' }}>
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                 <span>Your Preferences</span>
              </h2>
              <Link to="/student/preferences"
                className="text-xs font-bold px-4 py-2 rounded-full text-white transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#FF9AB7,#93C5FD)' }}>
                {preferences.length > 0 ? 'Edit' : 'Add'}
              </Link>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 rounded-2xl shimmer" />)}</div>
              ) : preferences.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-pink-50 flex items-center justify-center text-4xl"></div>
                  <p className="text-gray-500 font-medium">No preferences yet</p>
                  <Link to="/student/preferences" className="mt-3 inline-block text-sm font-bold text-pink-500 hover:underline">Submit now </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {preferences.slice(0, 5).map((pref, i) => (
                    <div key={pref.id}
                      className="stagger-item flex items-center gap-4 p-4 rounded-2xl hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                      style={{ background: 'linear-gradient(135deg,rgba(255,154,183,0.08),rgba(147,197,253,0.08))', animationDelay: `${i*0.08}s` }}>
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#FF9AB7,#93C5FD)' }}>
                        {pref.preference_rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm">{pref.course_code}</p>
                        <p className="text-xs text-gray-500 truncate">{pref.course_name}</p>
                      </div>
                      <span className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-full text-gray-600 font-medium flex-shrink-0">
                        {pref.available_seats} seats
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Allocated Courses Panel */}
          <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden animate-fadeIn" style={{animationDelay:'0.15s'}}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100"
              style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.1), rgba(16,185,129,0.05))' }}>
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                 <span>Allocated Courses</span>
              </h2>
              {allocations.length > 0 && (
                <Link to="/student/results"
                  className="text-xs font-bold px-4 py-2 rounded-full text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg,#34D399,#059669)' }}>
                  View All
                </Link>
              )}
            </div>
            <div className="p-6">
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 rounded-2xl shimmer" />)}</div>
              ) : allocations.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-teal-50 flex items-center justify-center text-4xl"></div>
                  <p className="text-gray-500 font-medium">Allocation pending</p>
                  <p className="text-xs text-gray-400 mt-1">Results will appear here after allocation runs</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allocations.map((alloc, i) => (
                    <div key={alloc.id}
                      className="stagger-item flex items-center gap-4 p-4 rounded-2xl hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                      style={{ background: 'linear-gradient(135deg,rgba(52,211,153,0.08),rgba(16,185,129,0.05))', animationDelay: `${i*0.08}s` }}>
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-green-500 flex items-center justify-center text-white text-lg flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm">{alloc.course_code}</p>
                        <p className="text-xs text-gray-500 truncate">{alloc.course_name}</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold flex-shrink-0">Allocated</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}