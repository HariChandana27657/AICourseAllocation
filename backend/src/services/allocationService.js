const db = require('../config/db');

const query = async (sql, params = []) => {
  const r = await db.query(sql, params);
  return r.rows || r;
};

const execute = async (sql, params = []) => {
  if (typeof db.execute === 'function') return await db.execute(sql, params);
  return await db.query(sql, params);
};

// Internal helper — no circular import
const createNotification = async (userId, userRole, type, title, message) => {
  try {
    await execute(
      `INSERT INTO notifications (user_id, user_role, type, title, message) VALUES (?, ?, ?, ?, ?)`,
      [userId, userRole, type, title, message]
    );
  } catch (e) {
    console.error('Notification insert error:', e.message);
  }
};

/**
 * Automated Course Allocation Algorithm
 * 
 * Algorithm: Priority-based Weighted Preference Matching
 * 
 * Steps:
 * 1. Sort students by GPA (higher GPA = higher priority)
 * 2. For each student in priority order:
 *    - Iterate through their ranked preferences
 *    - Check seat availability and time conflicts
 *    - Allocate first available course
 * 3. Update enrollment counts
 * 4. Generate allocation report
 */

class AllocationService {
  
  // Check for time slot conflicts
  async checkTimeConflicts(studentId, timeSlot) {
    const result = await query(`
      SELECT c.time_slot, c.course_code
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.student_id = ? AND e.allocation_status = 'allocated'
    `, [studentId]);

    const enrollments = result.rows || result;

    for (const enrollment of enrollments) {
      if (this.timeSlotsOverlap(enrollment.time_slot, timeSlot)) {
        return {
          hasConflict: true,
          conflictingCourse: enrollment.course_code
        };
      }
    }

    return { hasConflict: false, conflictingCourse: null };
  }

  // Simple time slot overlap detection
  timeSlotsOverlap(slot1, slot2) {
    // Extract days from time slots (e.g., "Mon/Wed 9:00-10:30")
    const days1 = slot1.split(' ')[0].split('/');
    const days2 = slot2.split(' ')[0].split('/');

    // Check if any days overlap
    const hasCommonDay = days1.some(day => days2.includes(day));
    
    if (!hasCommonDay) {
      return false;
    }

    // If same day, check time overlap (simplified - assumes conflict if same day)
    return true;
  }

  // Main allocation algorithm
  async runAllocation() {
    try {
      console.log('🚀 Starting course allocation...');

      // Clear existing allocations
      await execute('DELETE FROM enrollments', []);
      await execute('UPDATE courses SET enrolled_count = 0', []);

      // Get all students sorted by GPA (descending)
      const studentsResult = await query(`
        SELECT id, name, email, gpa, department
        FROM students
        ORDER BY gpa DESC, id ASC
      `, []);

      const students = studentsResult.rows || studentsResult;
      const allocationResults = [];

      console.log(`📊 Processing ${students.length} students...`);

      // Process each student
      for (const student of students) {
        console.log(`👤 Processing student: ${student.name} (GPA: ${student.gpa})`);
        
        const studentAllocation = {
          studentId: student.id,
          studentName: student.name,
          gpa: student.gpa,
          allocatedCourses: [],
          failedAllocations: []
        };

        // Get student preferences
        const preferencesResult = await query(`
          SELECT p.course_id, p.preference_rank, c.course_code, c.course_name, 
                 c.seat_capacity, c.enrolled_count, c.time_slot, c.department
          FROM preferences p
          JOIN courses c ON p.course_id = c.id
          WHERE p.student_id = ?
          ORDER BY p.preference_rank
        `, [student.id]);

        const preferences = preferencesResult.rows || preferencesResult;
        console.log(`  📝 Found ${preferences.length} preferences`);

        // Try to allocate courses based on preferences
        for (const pref of preferences) {
          const courseId = pref.course_id;
          const availableSeats = pref.seat_capacity - pref.enrolled_count;

          console.log(`    🎯 Trying ${pref.course_code} (Rank ${pref.preference_rank}, ${availableSeats} seats available)`);

          // Check seat availability
          if (availableSeats <= 0) {
            studentAllocation.failedAllocations.push({
              courseCode: pref.course_code,
              reason: 'No available seats',
              rank: pref.preference_rank
            });
            console.log(`      ❌ No seats available`);
            continue;
          }

          // Check time conflicts
          const conflictCheck = await this.checkTimeConflicts(student.id, pref.time_slot);
          if (conflictCheck.hasConflict) {
            studentAllocation.failedAllocations.push({
              courseCode: pref.course_code,
              reason: `Time conflict with ${conflictCheck.conflictingCourse}`,
              rank: pref.preference_rank
            });
            console.log(`      ❌ Time conflict`);
            continue;
          }

          // Allocate course
          await execute(
            'INSERT INTO enrollments (student_id, course_id, allocation_status) VALUES (?, ?, ?)',
            [student.id, courseId, 'allocated']
          );

          // Update enrolled count
          await execute(
            'UPDATE courses SET enrolled_count = enrolled_count + 1 WHERE id = ?',
            [courseId]
          );

          studentAllocation.allocatedCourses.push({
            courseCode: pref.course_code,
            courseName: pref.course_name,
            rank: pref.preference_rank,
            timeSlot: pref.time_slot
          });

          console.log(`      ✅ Allocated successfully`);
        }

        allocationResults.push(studentAllocation);
      }

      console.log('✅ Allocation completed successfully!');

      // ── Notify each student of their results ──
      for (const result of allocationResults) {
        const allocated = result.allocatedCourses;
        if (allocated.length > 0) {
          const courseList = allocated.map(c => `${c.courseCode} - ${c.courseName}`).join(', ');
          await createNotification(
            result.studentId, 'student', 'allocation_result',
            '🎯 Course Allocation Complete!',
            `You have been allocated ${allocated.length} course(s): ${courseList}. Visit the Results page to view your full schedule.`
          );
        } else {
          await createNotification(
            result.studentId, 'student', 'allocation_result',
            '⚠️ Allocation Complete — No Courses Assigned',
            `The allocation has been completed but no courses were assigned to you. This may be due to seat availability or time conflicts. Please contact your admin.`
          );
        }
      }

      return {
        success: true,
        message: 'Allocation completed successfully',
        totalStudents: students.length,
        results: allocationResults
      };

    } catch (error) {
      console.error('Allocation error:', error);
      throw error;
    }
  }

  // Get allocation results for a student
  async getStudentAllocation(studentId) {
    const result = await query(`
      SELECT e.*, c.course_code, c.course_name, c.department, 
             c.instructor, c.time_slot, c.seat_capacity
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.student_id = ? AND e.allocation_status = 'allocated'
      ORDER BY c.course_code
    `, [studentId]);

    return result.rows || result;
  }
}

module.exports = new AllocationService();
