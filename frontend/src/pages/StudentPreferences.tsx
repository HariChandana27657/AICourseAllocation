import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { reportAPI } from '../services/api';
import { getUser } from '../utils/auth';

interface StudentPreference {
  student_id: number;
  student_name: string;
  email: string;
  department: string;
  gpa: number;
  preferences: Array<{
    rank: number;
    course_code: string;
    course_name: string;
    course_department: string;
    time_slot: string;
    seat_capacity: number;
    enrolled_count: number;
  }>;
}

export default function StudentPreferences() {
  const [studentPreferences, setStudentPreferences] = useState<StudentPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const user = getUser();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await reportAPI.getAllPreferences();
      setStudentPreferences(response.data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = studentPreferences.filter((student) => {
    const matchesSearch =
      searchTerm === '' ||
      student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === '' || student.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const departments = Array.from(new Set(studentPreferences.map((s) => s.department)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="ribbon-pink top-[-10%] right-[-8%] animate-float"></div>
      <div className="ribbon-blue bottom-[-10%] left-[-8%] animate-wave"></div>
      <div className="ribbon-yellow top-[35%] right-[10%] animate-float" style={{animationDelay: '1.5s'}}></div>
      
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Student Preferences</h1>
          <p className="text-gray-600 text-lg">View all student course preference submissions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{studentPreferences.length}</p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Avg Preferences</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {studentPreferences.length > 0
                    ? (
                        studentPreferences.reduce((sum, s) => sum + s.preferences.length, 0) /
                        studentPreferences.length
                      ).toFixed(1)
                    : 0}
                </p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Submissions</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {studentPreferences.reduce((sum, s) => sum + s.preferences.length, 0)}
                </p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search Students</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="form-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
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
        </div>

        {/* Student Preferences List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading preferences...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-lg">No student preferences found</p>
            <p className="text-gray-400 text-sm mt-2">Students haven't submitted their preferences yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredStudents.map((student, index) => (
              <div
                key={student.student_id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fadeIn"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Student Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">{student.student_name}</h3>
                      <p className="text-purple-100 mt-1">{student.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-purple-100">Department</p>
                      <p className="text-lg font-bold">{student.department}</p>
                      <p className="text-sm text-purple-100 mt-2">GPA: {student.gpa}</p>
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className="p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">
                    Course Preferences ({student.preferences.length})
                  </h4>
                  <div className="space-y-3">
                    {student.preferences.map((pref) => (
                      <div
                        key={pref.rank}
                        className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl"
                      >
                        {/* Rank Badge */}
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {pref.rank}
                        </div>

                        {/* Course Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-bold text-gray-900">{pref.course_code}</h5>
                              <p className="text-sm text-gray-600">{pref.course_name}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {pref.time_slot}
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  {pref.course_department}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  pref.seat_capacity - pref.enrolled_count > 10
                                    ? 'bg-green-100 text-green-800'
                                    : pref.seat_capacity - pref.enrolled_count > 0
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {pref.seat_capacity - pref.enrolled_count} / {pref.seat_capacity} seats
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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
