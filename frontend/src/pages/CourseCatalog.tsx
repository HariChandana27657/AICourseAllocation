import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { courseAPI } from '../services/api';
import { getUser } from '../utils/auth';
import type { Course } from '../types';

export default function CourseCatalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const user = getUser();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchTerm, departmentFilter, courses]);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data);
      setFilteredCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.instructor?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter((course) => course.department === departmentFilter);
    }

    setFilteredCourses(filtered);
  };

  const departments = Array.from(new Set(courses.map((c) => c.department)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="ribbon-pink top-[-15%] right-[-10%] animate-float"></div>
      <div className="ribbon-blue bottom-[-15%] left-[-10%] animate-wave"></div>
      <div className="ribbon-yellow top-[50%] right-[5%] animate-float" style={{animationDelay: '1.5s'}}></div>
      
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Course Catalog</h1>
          <p className="text-gray-600 text-lg">Explore and discover available courses</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Courses
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by code, name, or instructor..."
                  className="form-input pl-12 w-full"
                />
              </div>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Department
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="form-input w-full"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* View Toggle & Stats */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredCourses.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{courses.length}</span> courses
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-lg">No courses found matching your criteria</p>
          </div>
        ) : (
          /* Course Grid/List */
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredCourses.map((course, index) => (
              <div
                key={course.id}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden card-hover animate-fadeIn ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Course Header */}
                <div className={`bg-gradient-to-br from-purple-600 to-blue-600 p-6 text-white ${viewMode === 'list' ? 'w-1/3' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-bold">{course.course_code}</h3>
                      <p className="text-purple-100 text-sm mt-1">{course.department}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        course.available_seats > 10
                          ? 'bg-green-400 text-green-900'
                          : course.available_seats > 0
                          ? 'bg-yellow-400 text-yellow-900'
                          : 'bg-red-400 text-red-900'
                      }`}
                    >
                      {course.available_seats} seats
                    </span>
                  </div>
                  <h4 className="font-semibold text-lg leading-tight">{course.course_name}</h4>
                </div>

                {/* Course Body */}
                <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm font-medium">{course.instructor}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">{course.time_slot}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-sm font-medium">
                        {course.enrolled_count}/{course.seat_capacity} enrolled
                      </span>
                    </div>

                    {course.description && (
                      <p className="text-sm text-gray-600 mt-3 line-clamp-2">{course.description}</p>
                    )}

                    {course.prerequisites && course.prerequisites.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Prerequisites:</p>
                        <div className="flex flex-wrap gap-2">
                          {course.prerequisites.map((prereq: any) => (
                            <span
                              key={prereq.id}
                              className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium"
                            >
                              {prereq.course_code}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Capacity</span>
                        <span>{Math.round((course.enrolled_count / course.seat_capacity) * 100)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${(course.enrolled_count / course.seat_capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
