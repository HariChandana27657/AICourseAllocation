import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ParallaxBackground from '../components/ParallaxBackground';
import { courseAPI } from '../services/api';
import { getUser } from '../utils/auth';
import type { Course } from '../types';

// ── Constants outside component ──────────────────────────────────────────────

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Computer Science & Engineering (AI & ML)',
  'Computer Science & Engineering (Data Science)',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
  'Chemical Engineering',
  'Biotechnology',
  'Mathematics',
  'Physics',
  'Chemistry',
  'MBA',
  'MCA',
];

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// College periods from timetable
const PERIODS = [
  { label: 'Period 1  (8:15 – 9:05)',   value: '8:15-9:05' },
  { label: 'Period 2  (9:05 – 9:55)',   value: '9:05-9:55' },
  { label: 'Period 3  (10:10 – 11:00)', value: '10:10-11:00' },
  { label: 'Period 4  (11:00 – 11:50)', value: '11:00-11:50' },
  { label: 'Period 5  (11:50 – 12:40)', value: '11:50-12:40' },
  { label: 'Period 6  (1:40 – 2:30)',   value: '1:40-2:30' },
  { label: 'Period 7  (2:30 – 3:20)',   value: '2:30-3:20' },
  { label: 'Period 8  (3:30 – 4:30)',   value: '3:30-4:30' },
  { label: 'Lab 1-2   (8:15 – 9:55)',   value: '8:15-9:55' },
  { label: 'Lab 3-4   (10:10 – 11:50)', value: '10:10-11:50' },
  { label: 'Lab 5-6   (11:50 – 1:40)',  value: '11:50-1:40' },
  { label: 'Lab 6-7   (1:40 – 3:20)',   value: '1:40-3:20' },
];

const emptyForm = {
  course_code: '',
  course_name: '',
  department: '',
  instructor: '',
  seat_capacity: 72,
  day: '',
  period: '',
  time_slot: '',
  description: '',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const user = getUser();

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (course?: Course) => {
    setError('');
    if (course) {
      setEditingCourse(course);
      // Parse existing time_slot back to day + period
      const parts = course.time_slot?.split(' ') || [];
      setFormData({
        course_code: course.course_code,
        course_name: course.course_name,
        department: course.department,
        instructor: course.instructor || '',
        seat_capacity: course.seat_capacity,
        day: parts[0] || '',
        period: parts.slice(1).join(' ') || '',
        time_slot: course.time_slot,
        description: course.description || '',
      });
    } else {
      setEditingCourse(null);
      setFormData(emptyForm);
    }
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingCourse(null); setError(''); };

  // Build time_slot from day + period selection
  const handleDayOrPeriod = (field: 'day' | 'period', value: string) => {
    const updated = { ...formData, [field]: value };
    updated.time_slot = updated.day && updated.period
      ? `${updated.day} ${updated.period}`
      : '';
    setFormData(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.day || !formData.period) {
      setError('Please select both a day and a period for the time slot.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        course_code: formData.course_code,
        course_name: formData.course_name,
        department: formData.department,
        instructor: formData.instructor,
        seat_capacity: formData.seat_capacity,
        time_slot: formData.time_slot,
        description: formData.description,
      };
      if (editingCourse) {
        await courseAPI.update(editingCourse.id, payload);
      } else {
        await courseAPI.create(payload);
      }
      await fetchCourses();
      closeModal();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save course. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await courseAPI.delete(id);
      fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete course');
    }
  };

  const totalSeats = courses.reduce((s, c) => s + c.seat_capacity, 0);
  const totalEnrolled = courses.reduce((s, c) => s + c.enrolled_count, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 relative overflow-hidden">
      <ParallaxBackground />
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">

        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fadeIn">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-1">Course Management</h1>
            <p className="text-gray-600">Add, edit and manage elective courses</p>
          </div>
          <button onClick={() => openModal()}
            className="btn-gradient text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Course
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Courses', value: courses.length, color: 'text-pink-600', bg: 'bg-pink-50' },
            { label: 'Total Seats', value: totalSeats, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Enrolled', value: totalEnrolled, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Departments', value: new Set(courses.map(c => c.department)).size, color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-5 shadow-soft tilt-card`}>
              <p className="text-gray-500 text-sm font-medium">{s.label}</p>
              <p className={`text-3xl font-black mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Course Table */}
        <div className="bg-white rounded-3xl shadow-soft overflow-hidden animate-fadeIn">
          {loading ? (
            <div className="text-center py-20"><div className="spinner mx-auto" /></div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">📚</p>
              <p className="text-gray-500 text-lg font-medium">No courses yet</p>
              <button onClick={() => openModal()}
                className="mt-4 btn-gradient text-white px-6 py-2 rounded-full font-semibold">
                Add First Course
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead style={{ background: 'linear-gradient(135deg, #FF9AB7, #93C5FD)' }}>
                  <tr>
                    {['Code', 'Course Name', 'Department', 'Instructor', 'Time Slot', 'Seats', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-4 text-left text-sm font-bold text-white">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {courses.map((c, i) => (
                    <tr key={c.id} className="hover:bg-pink-50/30 transition"
                      style={{ animationDelay: `${i * 0.03}s` }}>
                      <td className="px-5 py-4">
                        <span className="font-bold text-pink-600">{c.course_code}</span>
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-900">{c.course_name}</td>
                      <td className="px-5 py-4 text-gray-600 text-sm">{c.department}</td>
                      <td className="px-5 py-4 text-gray-600 text-sm">{c.instructor}</td>
                      <td className="px-5 py-4">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                          {c.time_slot}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-green-600">{c.enrolled_count}</span>
                        <span className="text-gray-400 text-sm">/{c.seat_capacity}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => openModal(c)}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-sm px-3 py-1 rounded-lg hover:bg-blue-50 transition">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(c.id, c.course_name)}
                            className="text-red-500 hover:text-red-700 font-semibold text-sm px-3 py-1 rounded-lg hover:bg-red-50 transition">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100"
              style={{ background: 'linear-gradient(135deg, rgba(255,154,183,0.1), rgba(147,197,253,0.1))' }}>
              <h2 className="text-2xl font-black text-gray-900">
                {editingCourse ? '✏️ Edit Course' : '➕ Add New Course'}
              </h2>
              <button onClick={closeModal}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium">
                  ❌ {error}
                </div>
              )}

              {/* Row 1: Code + Department */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Course Code *</label>
                  <input type="text" value={formData.course_code}
                    onChange={e => setFormData({ ...formData, course_code: e.target.value.toUpperCase() })}
                    className="form-input" placeholder="e.g. CS401" required />
                </div>
                <div>
                  <label className="form-label">Department *</label>
                  <select value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="form-input" required>
                    <option value="">-- Select Department --</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Course Name */}
              <div>
                <label className="form-label">Course Name *</label>
                <input type="text" value={formData.course_name}
                  onChange={e => setFormData({ ...formData, course_name: e.target.value })}
                  className="form-input" placeholder="e.g. Machine Learning" required />
              </div>

              {/* Row 2: Instructor + Seats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Instructor</label>
                  <input type="text" value={formData.instructor}
                    onChange={e => setFormData({ ...formData, instructor: e.target.value })}
                    className="form-input" placeholder="e.g. Dr. Jhansi Lakshmi" />
                </div>
                <div>
                  <label className="form-label">Seat Capacity *</label>
                  <input type="number" value={formData.seat_capacity}
                    onChange={e => setFormData({ ...formData, seat_capacity: parseInt(e.target.value) || 1 })}
                    className="form-input" min="1" required />
                </div>
              </div>

              {/* Time Slot — Day + Period picker */}
              <div>
                <label className="form-label">Time Slot * <span className="text-xs text-gray-400 font-normal">(Select day and period)</span></label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Day selector — visual buttons */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2 font-medium">Day</p>
                    <div className="grid grid-cols-3 gap-2">
                      {DAYS.map(day => (
                        <button key={day} type="button"
                          onClick={() => handleDayOrPeriod('day', day)}
                          className={`py-2 rounded-xl text-sm font-bold transition-all ${
                            formData.day === day
                              ? 'text-white shadow-lg scale-105'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          style={formData.day === day ? { background: 'linear-gradient(135deg, #FF9AB7, #93C5FD)' } : {}}>
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Period selector — dropdown */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2 font-medium">Period / Time</p>
                    <select value={formData.period}
                      onChange={e => handleDayOrPeriod('period', e.target.value)}
                      className="form-input h-full">
                      <option value="">-- Select Period --</option>
                      <optgroup label="── Single Period ──">
                        {PERIODS.filter(p => !p.label.startsWith('Lab')).map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </optgroup>
                      <optgroup label="── Lab (Double Period) ──">
                        {PERIODS.filter(p => p.label.startsWith('Lab')).map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* Preview */}
                {formData.time_slot && (
                  <div className="mt-3 flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-xl">
                    <span className="text-green-600">✓</span>
                    <span className="text-green-700 font-semibold text-sm">Time Slot: {formData.time_slot}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="form-label">Description</label>
                <textarea value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={2} className="form-input" placeholder="Brief course description..." />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 py-3 rounded-full border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 rounded-full text-white font-bold transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #FF9AB7, #93C5FD)' }}>
                  {saving ? <><div className="spinner w-4 h-4 border-2" /> Saving...</> : (editingCourse ? '✏️ Update Course' : '➕ Add Course')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
