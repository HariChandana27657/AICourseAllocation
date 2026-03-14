import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { allocationAPI } from '../services/api';
import { getUser } from '../utils/auth';
import type { Enrollment } from '../types';

export default function AllocationResults() {
  const [allocations, setAllocations] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await allocationAPI.getResults();
      setAllocations(response.data.allocatedCourses);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadSchedule = () => {
    const scheduleText = allocations.map((alloc, index) => 
      `${index + 1}. ${alloc.course_code} - ${alloc.course_name}\n   Instructor: ${alloc.instructor}\n   Time: ${alloc.time_slot}\n`
    ).join('\n');

    const blob = new Blob([`My Course Schedule\n\nStudent: ${user?.name}\nDepartment: ${user?.department}\n\n${scheduleText}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-course-schedule.txt';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="ribbon-pink top-[-12%] right-[-6%] animate-float"></div>
      <div className="ribbon-blue bottom-[-12%] left-[-6%] animate-wave"></div>
      <div className="ribbon-yellow top-[45%] right-[8%] animate-float" style={{animationDelay: '1s'}}></div>
      
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Allocation Results</h1>
          <p className="text-gray-600 text-lg">Your allocated courses for this semester</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading results...</p>
          </div>
        ) : allocations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center animate-fadeIn">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">No Allocations Yet</h2>
            <p className="text-gray-600 text-lg mb-6">
              Course allocation has not been run yet. Please check back later or contact your administrator.
            </p>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 max-w-md mx-auto">
              <p className="text-blue-800 font-medium">💡 What to do next:</p>
              <ul className="text-left text-blue-700 mt-3 space-y-2">
                <li>• Make sure you've submitted your preferences</li>
                <li>• Wait for the admin to run allocation</li>
                <li>• Check back here for results</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            {/* Success Message */}
            <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl shadow-xl p-8 mb-8 text-white animate-fadeIn">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    🎉 Congratulations! You've been allocated {allocations.length} course{allocations.length !== 1 ? 's' : ''}
                  </h2>
                  <p className="text-green-100 text-lg">
                    Please review your schedule below and note the time slots
                  </p>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="flex justify-end mb-6 animate-fadeIn">
              <button
                onClick={downloadSchedule}
                className="btn-gradient text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Schedule
              </button>
            </div>

            {/* Courses Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fadeIn">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">#</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Course Code</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Course Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Department</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Instructor</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Time Slot</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {allocations.map((allocation, index) => (
                      <tr key={allocation.id} className="hover:bg-purple-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-bold text-purple-600">{allocation.course_code}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{allocation.course_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {allocation.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {allocation.instructor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-gray-700">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {allocation.time_slot}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-4 py-2 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800">
                            ✓ {allocation.allocation_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Important Notes */}
            <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 animate-fadeIn">
              <h3 className="font-bold text-blue-900 text-lg mb-3 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Important Notes
              </h3>
              <ul className="list-disc list-inside text-blue-800 space-y-2">
                <li>Please verify your schedule for any time conflicts</li>
                <li>Contact your department if you have any concerns about your allocation</li>
                <li>Course registration will open soon - check your email for details</li>
                <li>Keep this schedule for your records</li>
                <li>Attend the first class of each course to confirm your enrollment</li>
              </ul>
            </div>

            {/* Weekly Schedule View */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Your Weekly Schedule
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allocations.map((alloc, index) => (
                  <div
                    key={alloc.id}
                    className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-4 hover:shadow-lg transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900">{alloc.course_code}</h4>
                        <p className="text-sm text-gray-600 truncate">{alloc.course_name}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {alloc.time_slot}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {alloc.instructor}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
