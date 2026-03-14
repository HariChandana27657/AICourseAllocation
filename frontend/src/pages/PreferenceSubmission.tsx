import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { courseAPI, preferenceAPI } from '../services/api';
import { getUser } from '../utils/auth';
import type { Course, Preference } from '../types';

export default function PreferenceSubmission() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [, setExistingPreferences] = useState<Preference[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const user = getUser();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, prefsRes] = await Promise.all([
        courseAPI.getAll(),
        preferenceAPI.get(),
      ]);

      setCourses(coursesRes.data);
      setExistingPreferences(prefsRes.data);

      if (prefsRes.data.length > 0) {
        const prefCourses = prefsRes.data
          .sort((a, b) => a.preference_rank - b.preference_rank)
          .map((pref) => coursesRes.data.find((c: Course) => c.id === pref.course_id))
          .filter(Boolean) as Course[];
        setSelectedCourses(prefCourses);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = (course: Course) => {
    if (!selectedCourses.find((c) => c.id === course.id)) {
      setSelectedCourses([...selectedCourses, course]);
      setMessage(null);
    }
  };

  const handleRemoveCourse = (courseId: number) => {
    setSelectedCourses(selectedCourses.filter((c) => c.id !== courseId));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newCourses = [...selectedCourses];
    const draggedCourse = newCourses[draggedIndex];
    newCourses.splice(draggedIndex, 1);
    newCourses.splice(index, 0, draggedCourse);

    setSelectedCourses(newCourses);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newCourses = [...selectedCourses];
      [newCourses[index - 1], newCourses[index]] = [newCourses[index], newCourses[index - 1]];
      setSelectedCourses(newCourses);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < selectedCourses.length - 1) {
      const newCourses = [...selectedCourses];
      [newCourses[index], newCourses[index + 1]] = [newCourses[index + 1], newCourses[index]];
      setSelectedCourses(newCourses);
    }
  };

  const handleSubmit = async () => {
    if (selectedCourses.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one course' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const preferences = selectedCourses.map((course, index) => ({
        course_id: course.id,
        preference_rank: index + 1,
      }));

      await preferenceAPI.submit(preferences);
      setMessage({ type: 'success', text: '✅ Preferences submitted successfully!' });
      fetchData();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to submit preferences',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const availableCourses = courses.filter(
    (course) => {
      const notSelected = !selectedCourses.find((sc) => sc.id === course.id);
      const matchesSearch = searchTerm === '' || 
        course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.course_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = departmentFilter === '' || course.department === departmentFilter;
      return notSelected && matchesSearch && matchesDept;
    }
  );

  const departments = Array.from(new Set(courses.map((c) => c.department)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="ribbon-blue top-[-10%] left-[-8%] animate-wave"></div>
      <div className="ribbon-pink bottom-[-10%] right-[-8%] animate-float"></div>
      <div className="ribbon-yellow top-[35%] left-[10%] animate-float" style={{animationDelay: '2.5s'}}></div>
      
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Submit Course Preferences</h1>
          <p className="text-gray-600 text-lg">Drag and drop to rank your course choices</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl animate-fadeIn ${
              message.type === 'success'
                ? 'bg-green-50 border-2 border-green-200 text-green-800'
                : 'bg-red-50 border-2 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <p className="font-semibold">{message.text}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Courses */}
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Available Courses
            </h2>

            {/* Search and Filter */}
            <div className="mb-4 space-y-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search courses..."
                className="form-input w-full"
              />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="form-input w-full"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="spinner mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {availableCourses.map((course) => (
                  <div
                    key={course.id}
                    className="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-400 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{course.course_code}</h3>
                        <p className="text-sm text-gray-600">{course.course_name}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{course.time_slot}</span>
                          <span className={`px-2 py-1 rounded-full ${
                            course.available_seats > 10 ? 'bg-green-100 text-green-800' :
                            course.available_seats > 0 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {course.available_seats} seats
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddCourse(course)}
                        className="btn-gradient text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Your Preferences */}
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn" style={{animationDelay: '0.1s'}}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Your Preferences ({selectedCourses.length})
            </h2>

            {selectedCourses.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-lg">No courses selected</p>
                <p className="text-gray-400 text-sm mt-2">Add courses from the left panel</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6 max-h-[500px] overflow-y-auto">
                  {selectedCourses.map((course, index) => (
                    <div
                      key={course.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-4 cursor-move hover:shadow-lg transition ${
                        draggedIndex === index ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Rank Badge */}
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {index + 1}
                        </div>

                        {/* Course Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900">{course.course_code}</h3>
                          <p className="text-sm text-gray-600 truncate">{course.course_name}</p>
                          <p className="text-xs text-gray-500 mt-1">{course.time_slot}</p>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            className="p-1 text-gray-600 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleMoveDown(index)}
                            disabled={index === selectedCourses.length - 1}
                            className="p-1 text-gray-600 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleRemoveCourse(course.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Remove"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-4 rounded-xl shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="spinner w-5 h-5 border-2"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Submit Preferences</span>
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-500 mt-3">
                  💡 Drag courses to reorder, or use arrow buttons
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
