import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { reportAPI } from '../services/api';
import { getUser } from '../utils/auth';
import type { Report } from '../types';

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'enrollment' | 'demand' | 'unallocated'>('enrollment');
  const [enrollmentData, setEnrollmentData] = useState<Report[]>([]);
  const [demandData, setDemandData] = useState<Report[]>([]);
  const [unallocatedData, setUnallocatedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [enrollment, demand, unallocated] = await Promise.all([
        reportAPI.getEnrollment(),
        reportAPI.getDemand(),
        reportAPI.getUnallocated(),
      ]);

      setEnrollmentData(enrollment.data);
      setDemandData(demand.data);
      setUnallocatedData(unallocated.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="ribbon-blue top-[-12%] left-[-6%] animate-wave"></div>
      <div className="ribbon-pink bottom-[-12%] right-[-6%] animate-float"></div>
      <div className="ribbon-yellow top-[40%] left-[8%] animate-float" style={{animationDelay: '2.5s'}}></div>
      
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
          <p className="text-gray-600 text-lg">View system reports and insights</p>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('enrollment')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'enrollment'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Enrollment Report
              </button>
              <button
                onClick={() => setActiveTab('demand')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'demand'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Course Demand
              </button>
              <button
                onClick={() => setActiveTab('unallocated')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'unallocated'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Unallocated Students
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : (
              <>
                {activeTab === 'enrollment' && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Course Enrollment Report</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Course Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Course Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Department
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Capacity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Enrolled
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Available
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Utilization
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {enrollmentData.map((course) => (
                            <tr key={course.id}>
                              <td className="px-6 py-4 whitespace-nowrap font-medium">
                                {course.course_code}
                              </td>
                              <td className="px-6 py-4">{course.course_name}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{course.department}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{course.seat_capacity}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{course.enrolled_count}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {course.available_seats}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                    <div
                                      className="bg-primary-600 h-2 rounded-full"
                                      style={{
                                        width: `${course.utilization_percentage || 0}%`,
                                      }}
                                    />
                                  </div>
                                  <span className="text-sm">
                                    {course.utilization_percentage?.toFixed(0)}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'demand' && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Course Demand Analysis</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Course Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Course Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Capacity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Total Preferences
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              1st Choice
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Demand Ratio
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {demandData.map((course) => (
                            <tr key={course.id}>
                              <td className="px-6 py-4 whitespace-nowrap font-medium">
                                {course.course_code}
                              </td>
                              <td className="px-6 py-4">{course.course_name}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{course.seat_capacity}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {course.total_preferences || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {course.first_choice_count || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    (course.demand_ratio || 0) > 1.5
                                      ? 'bg-red-100 text-red-800'
                                      : (course.demand_ratio || 0) > 1
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-green-100 text-green-800'
                                  }`}
                                >
                                  {course.demand_ratio?.toFixed(2) || '0.00'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'unallocated' && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Unallocated Students</h2>
                    {unallocatedData.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-green-600 text-5xl mb-4">✓</div>
                        <p className="text-gray-600">
                          All students with preferences have been allocated courses!
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Email
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Department
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                GPA
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Preferences
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {unallocatedData.map((student) => (
                              <tr key={student.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">
                                  {student.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{student.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {student.department}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {student.gpa?.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {student.preferences_submitted}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
