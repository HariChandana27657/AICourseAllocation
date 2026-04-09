export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'admin';
  department?: string;
  gpa?: number;
  cgpa?: number;
  yearOfStudy?: number;
  year_of_study?: number;
}

export interface Course {
  id: number;
  course_code: string;
  course_name: string;
  department: string;
  instructor?: string;
  section?: string;
  course_type?: 'core' | 'elective' | 'open';
  year_of_study?: number;
  seat_capacity: number;
  enrolled_count: number;
  available_seats: number;
  time_slot: string;
  description?: string;
  isCompleted?: boolean;
  prerequisites?: Prerequisite[];
}

export interface Prerequisite {
  id: number;
  course_code: string;
  course_name: string;
}

export interface Preference {
  id?: number;
  student_id?: number;
  course_id: number;
  preference_rank: number;
  course_code?: string;
  course_name?: string;
  department?: string;
  instructor?: string;
  time_slot?: string;
  available_seats?: number;
}

export interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  allocation_status: 'allocated' | 'waitlist' | 'dropped';
  allocated_at: string;
  course_code: string;
  course_name: string;
  department: string;
  instructor: string;
  time_slot: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AllocationResult {
  studentId: number;
  allocatedCourses: Enrollment[];
}

export interface Report {
  id: number;
  course_code: string;
  course_name: string;
  department: string;
  instructor?: string;
  seat_capacity: number;
  enrolled_count: number;
  available_seats: number;
  utilization_percentage?: number;
  total_preferences?: number;
  first_choice_count?: number;
  demand_ratio?: number;
}

export interface Analytics {
  overview: {
    total_students: number;
    total_courses: number;
    students_with_preferences: number;
    students_allocated: number;
    total_enrollments: number;
    total_capacity: number;
    avg_utilization: number;
  };
  popularCourses: Array<{
    course_code: string;
    course_name: string;
    preference_count: number;
  }>;
  departmentStats: Array<{
    department: string;
    course_count: number;
    total_enrolled: number;
  }>;
}
