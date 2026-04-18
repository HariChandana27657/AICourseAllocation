import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { courseAPI } from '../services/api';
import { getUser } from '../utils/auth';
import type { Course } from '../types';

export default function CourseManagement() {

  // ── College Departments ──
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

  // ── College Time Slots (from timetable image) ──
  // Periods: 8:15-9:05, 9:05-9:55, 9:55-10:10(break), 10:10-11:00, 11:00-11:50, 11:50-12:40, 12:40-1:40(break), 1:40-2:30, 2:30-3:20, 3:30-4:30
  const TIME_SLOTS = [
    // Single period slots
    { label: 'MON  8:15 - 9:05  (Period 1)', value: 'MON 8:15-9:05' },
    { label: 'MON  9:05 - 9:55  (Period 2)', value: 'MON 9:05-9:55' },
    { label: 'MON  10:10 - 11:00 (Period 3)', value: 'MON 10:10-11:00' },
    { label: 'MON  11:00 - 11:50 (Period 4)', value: 'MON 11:00-11:50' },
    { label: 'MON  11:50 - 12:40 (Period 5)', value: 'MON 11:50-12:40' },
    { label: 'MON  1:40 - 2:30  (Period 6)', value: 'MON 1:40-2:30' },
    { label: 'MON  2:30 - 3:20  (Period 7)', value: 'MON 2:30-3:20' },
    { label: 'MON  3:30 - 4:30  (Period 8)', value: 'MON 3:30-4:30' },
    { label: 'TUE  8:15 - 9:05  (Period 1)', value: 'TUE 8:15-9:05' },
    { label: 'TUE  9:05 - 9:55  (Period 2)', value: 'TUE 9:05-9:55' },
    { label: 'TUE  10:10 - 11:00 (Period 3)', value: 'TUE 10:10-11:00' },
    { label: 'TUE  11:00 - 11:50 (Period 4)', value: 'TUE 11:00-11:50' },
    { label: 'TUE  11:50 - 12:40 (Period 5)', value: 'TUE 11:50-12:40' },
    { label: 'TUE  1:40 - 2:30  (Period 6)', value: 'TUE 1:40-2:30' },
    { label: 'TUE  2:30 - 3:20  (Period 7)', value: 'TUE 2:30-3:20' },
    { label: 'TUE  3:30 - 4:30  (Period 8)', value: 'TUE 3:30-4:30' },
    { label: 'WED  8:15 - 9:05  (Period 1)', value: 'WED 8:15-9:05' },
    { label: 'WED  9:05 - 9:55  (Period 2)', value: 'WED 9:05-9:55' },
    { label: 'WED  10:10 - 11:00 (Period 3)', value: 'WED 10:10-11:00' },
    { label: 'WED  11:00 - 11:50 (Period 4)', value: 'WED 11:00-11:50' },
    { label: 'WED  11:50 - 12:40 (Period 5)', value: 'WED 11:50-12:40' },
    { label: 'WED  1:40 - 2:30  (Period 6)', value: 'WED 1:40-2:30' },
    { label: 'WED  2:30 - 3:20  (Period 7)', value: 'WED 2:30-3:20' },
    { label: 'WED  3:30 - 4:30  (Period 8)', value: 'WED 3:30-4:30' },
    { label: 'THU  8:15 - 9:05  (Period 1)', value: 'THU 8:15-9:05' },
    { label: 'THU  9:05 - 9:55  (Period 2)', value: 'THU 9:05-9:55' },
    { label: 'THU  10:10 - 11:00 (Period 3)', value: 'THU 10:10-11:00' },
    { label: 'THU  11:00 - 11:50 (Period 4)', value: 'THU 11:00-11:50' },
    { label: 'THU  11:50 - 12:40 (Period 5)', value: 'THU 11:50-12:40' },
    { label: 'THU  1:40 - 2:30  (Period 6)', value: 'THU 1:40-2:30' },
    { label: 'THU  2:30 - 3:20  (Period 7)', value: 'THU 2:30-3:20' },
    { label: 'THU  3:30 - 4:30  (Period 8)', value: 'THU 3:30-4:30' },
    { label: 'FRI  8:15 - 9:05  (Period 1)', value: 'FRI 8:15-9:05' },
    { label: 'FRI  9:05 - 9:55  (Period 2)', value: 'FRI 9:05-9:55' },
    { label: 'FRI  10:10 - 11:00 (Period 3)', value: 'FRI 10:10-11:00' },
    { label: 'FRI  11:00 - 11:50 (Period 4)', value: 'FRI 11:00-11:50' },
    { label: 'FRI  11:50 - 12:40 (Period 5)', value: 'FRI 11:50-12:40' },
    { label: 'FRI  1:40 - 2:30  (Period 6)', value: 'FRI 1:40-2:30' },
    { label: 'FRI  2:30 - 3:20  (Period 7)', value: 'FRI 2:30-3:20' },
    { label: 'FRI  3:30 - 4:30  (Period 8)', value: 'FRI 3:30-4:30' },
    { label: 'SAT  8:15 - 9:05  (Period 1)', value: 'SAT 8:15-9:05' },
    { label: 'SAT  9:05 - 9:55  (Period 2)', value: 'SAT 9:05-9:55' },
    { label: 'SAT  10:10 - 11:00 (Period 3)', value: 'SAT 10:10-11:00' },
    { label: 'SAT  11:00 - 11:50 (Period 4)', value: 'SAT 11:00-11:50' },
    { label: 'SAT  11:50 - 12:40 (Period 5)', value: 'SAT 11:50-12:40' },
    { label: 'SAT  1:40 - 2:30  (Period 6)', value: 'SAT 1:40-2:30' },
    { label: 'SAT  2:30 - 3:20  (Period 7)', value: 'SAT 2:30-3:20' },
    { label: 'SAT  3:30 - 4:30  (Period 8)', value: 'SAT 3:30-4:30' },
    // Double period (lab) slots
    { label: 'MON  8:15 - 9:55  (Periods 1-2)', value: 'MON 8:15-9:55' },
    { label: 'MON  10:10 - 11:50 (Periods 3-4)', value: 'MON 10:10-11:50' },
    { label: 'MON  11:50 - 1:40  (Periods 5-6)', value: 'MON 11:50-1:40' },
    { label: 'MON  1:40 - 3:20  (Periods 6-7)', value: 'MON 1:40-3:20' },
    { label: 'TUE  8:15 - 9:55  (Periods 1-2)', value: 'TUE 8:15-9:55' },
    { label: 'TUE  10:10 - 11:50 (Periods 3-4)', value: 'TUE 10:10-11:50' },
    { label: 'TUE  11:50 - 1:40  (Periods 5-6)', value: 'TUE 11:50-1:40' },
    { label: 'TUE  1:40 - 3:20  (Periods 6-7)', value: 'TUE 1:40-3:20' },
    { label: 'WED  8:15 - 9:55  (Periods 1-2)', value: 'WED 8:15-9:55' },
    { label: 'WED  10:10 - 11:50 (Periods 3-4)', value: 'WED 10:10-11:50' },
    { label: 'THU  8:15 - 9:55  (Periods 1-2)', value: 'THU 8:15-9:55' },
    { label: 'THU  10:10 - 11:50 (Periods 3-4)', value: 'THU 10:10-11:50' },
    { label: 'FRI  8:15 - 9:55  (Periods 1-2)', value: 'FRI 8:15-9:55' },
    { label: 'FRI  10:10 - 11:50 (Periods 3-4)', value: 'FRI 10:10-11:50' },
    { label: 'SAT  8:15 - 9:55  (Periods 1-2)', value: 'SAT 8:15-9:55' },
    { label: 'SAT  10:10 - 11:50 (Periods 3-4)', value: 'SAT 10:10-11:50' },
  ];
  const [courses, setCourses] = useState<Course[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const user = getUser();

  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    department: '',
    instructor: '',
    seat_capacity: 30,
    time_slot: '',
    description: '',
    prerequisites: [] as never[],
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        course_code: course.course_code,
        course_name: course.course_name,
        department: course.department,
        instructor: course.instructor || '',
        seat_capacity: course.seat_capacity,
        time_slot: course.time_slot,
        description: course.description || '',
        prerequisites: course.prerequisites ? [] : [],
      });
    } else {
      setEditingCourse(null);
      setFormData({
        course_code: '',
        course_name: '',
        department: '',
        instructor: '',
        seat_capacity: 30,
        time_slot: '',
        description: '',
        prerequisites: [],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCourse(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingCourse) {
        await courseAPI.update(editingCourse.id, formData);
      } else {
        await courseAPI.create(formData);
      }
      fetchCourses();
      handleCloseModal();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, courseName: string) => {
    if (!confirm(`Are you sure you want to delete "${courseName}"?`)) {
      return;
    }

    try {
      await courseAPI.delete(id);
      fetchCourses();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete course');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="ribbon-blue top-[-10%] left-[-7%] animate-wave"></div>
      <div className="ribbon-pink bottom-[-10%] right-[-7%] animate-float"></div>
      <div className="ribbon-yellow top-[40%] left-[12%] animate-float" style={{animationDelay: '2s'}}></div>
      
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fadeIn">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Course Management</h1>
            <p className="text-gray-600 text-lg">Create, edit, and manage courses</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="btn-gradient text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Course
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Courses</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{courses.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Seats</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {courses.reduce((sum, c) => sum + c.seat_capacity, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Enrolled</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {courses.reduce((sum, c) => sum + c.enrolled_count, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Departments</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {new Set(courses.map(c => c.department)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Table */}
        {loading ? (
          <div className="text-center py-20">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading courses...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fadeIn">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Code</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Course Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Department</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Instructor</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Capacity</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Enrolled</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Time Slot</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-purple-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-purple-600">{course.course_code}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{course.course_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{course.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{course.instructor}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-900">{course.seat_capacity}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-green-600">{course.enrolled_count}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{course.time_slot}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenModal(course)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(course.id, course.course_name)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
            <h2 className="text-3xl font-bold mb-6 gradient-text">
              {editingCourse ? 'Edit Course' : 'Add New Course'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Course Code *</label>
                  <input
                    type="text"
                    value={formData.course_code}
                    onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                    className="form-input"
                    required
                    placeholder="e.g., CS101"
                  />
                </div>

                <div>
                  <label className="form-label">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="form-input"
                    required
                  >
                    <option value="">-- Select Department --</option>
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Course Name *</label>
                <input
                  type="text"
                  value={formData.course_name}
                  onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                  className="form-input"
                  required
                  placeholder="e.g., Introduction to Programming"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Instructor</label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    className="form-input"
                    placeholder="e.g., Dr. Smith"
                  />
                </div>

                <div>
                  <label className="form-label">Seat Capacity *</label>
                  <input
                    type="number"
                    value={formData.seat_capacity}
                    onChange={(e) => setFormData({ ...formData, seat_capacity: parseInt(e.target.value) })}
                    className="form-input"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Time Slot * <span className="text-xs text-gray-400 font-normal">(College Schedule)</span></label>
                <select
                  value={formData.time_slot}
                  onChange={(e) => setFormData({ ...formData, time_slot: e.target.value })}
                  className="form-input"
                  required
                >
                  <option value="">-- Select Time Slot --</option>
                  <optgroup label="── Single Period ──">
                    {TIME_SLOTS.filter(t => !t.label.includes('Periods')).map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="── Double Period (Lab) ──">
                    {TIME_SLOTS.filter(t => t.label.includes('Periods')).map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </optgroup>
                </select>
                {formData.time_slot && (
                  <p className="text-xs text-green-600 mt-1 font-medium">✓ Selected: {formData.time_slot}</p>
                )}
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="form-input"
                  placeholder="Course description..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 btn-gradient text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
