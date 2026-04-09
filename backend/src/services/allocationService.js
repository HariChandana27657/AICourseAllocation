const db = require('../config/db');

const query = async (sql, params = []) => {
  const r = await db.query(sql, params);
  return r.rows || r;
};
const execute = async (sql, params = []) => {
  if (typeof db.execute === 'function') return await db.execute(sql, params);
  return await db.query(sql, params);
};

const createNotification = async (userId, userRole, type, title, message) => {
  try {
    await execute(
      `INSERT INTO notifications (user_id, user_role, type, title, message) VALUES (?, ?, ?, ?, ?)`,
      [userId, userRole, type, title, message]
    );
  } catch (e) {
    console.error('Notification error:', e.message);
  }
};

/**
 * CGPA Priority Tiers:
 *  Tier 1: CGPA >= 8.0  (highest priority)
 *  Tier 2: CGPA >= 7.5
 *  Tier 3: CGPA >= 7.0
 *  Tier 4: CGPA < 7.0   (lowest priority)
 *
 * Rules:
 *  1. Each student gets ONLY ONE elective course
 *  2. Students already enrolled in a course (completed_courses) cannot get it again
 *  3. Seat capacity strictly enforced per section
 *  4. If first choice full → try next preference
 *  5. Courses filtered by student's year_of_study
 */

class AllocationService {

  getCGPATier(gpa) {
    if (gpa >= 8.0) return 1;
    if (gpa >= 7.5) return 2;
    if (gpa >= 7.0) return 3;
    return 4;
  }

  async runAllocation() {
    console.log('🚀 Starting CGPA-priority elective allocation...');

    // Clear existing allocations
    await execute('DELETE FROM enrollments', []);
    await execute('UPDATE courses SET enrolled_count = 0', []);

    // Get all students sorted by CGPA desc, then id asc (tiebreaker)
    const students = await query(
      `SELECT id, name, email, gpa, department, year_of_study
       FROM students
       ORDER BY gpa DESC, id ASC`,
      []
    );

    console.log(`📊 Processing ${students.length} students in CGPA order...`);

    const allocationResults = [];

    for (const student of students) {
      const tier = this.getCGPATier(student.gpa);
      console.log(`👤 ${student.name} | CGPA: ${student.gpa} | Tier: ${tier} | Year: ${student.year_of_study}`);

      // Get completed course IDs (cannot be re-allocated)
      const completed = await query(
        `SELECT course_id FROM completed_courses WHERE student_id = ?`,
        [student.id]
      );
      const completedIds = new Set(completed.map(c => c.course_id));

      // Get student preferences — only for their year_of_study, excluding completed
      const prefs = await query(
        `SELECT p.course_id, p.preference_rank,
                c.course_code, c.course_name, c.section,
                c.seat_capacity, c.enrolled_count, c.time_slot,
                c.year_of_study, c.course_type
         FROM preferences p
         JOIN courses c ON p.course_id = c.id
         WHERE p.student_id = ?
           AND c.year_of_study = ?
           AND c.course_type = 'elective'
         ORDER BY p.preference_rank`,
        [student.id, student.year_of_study]
      );

      const studentResult = {
        studentId: student.id,
        studentName: student.name,
        gpa: student.gpa,
        tier,
        yearOfStudy: student.year_of_study,
        allocatedCourse: null,
        failedAllocations: []
      };

      let allocated = false;

      for (const pref of prefs) {
        // Rule: skip if already completed this course
        if (completedIds.has(pref.course_id)) {
          studentResult.failedAllocations.push({
            courseCode: `${pref.course_code}-${pref.section}`,
            reason: 'Already completed this course',
            rank: pref.preference_rank
          });
          console.log(`    ⛔ ${pref.course_code}-${pref.section} — already completed`);
          continue;
        }

        // Rule: check seat availability
        const available = pref.seat_capacity - pref.enrolled_count;
        if (available <= 0) {
          studentResult.failedAllocations.push({
            courseCode: `${pref.course_code}-${pref.section}`,
            reason: 'No seats available',
            rank: pref.preference_rank
          });
          console.log(`    ❌ ${pref.course_code}-${pref.section} — no seats`);
          continue;
        }

        // Allocate — ONE elective only
        await execute(
          `INSERT INTO enrollments (student_id, course_id, allocation_status) VALUES (?, ?, 'allocated')`,
          [student.id, pref.course_id]
        );
        await execute(
          `UPDATE courses SET enrolled_count = enrolled_count + 1 WHERE id = ?`,
          [pref.course_id]
        );

        studentResult.allocatedCourse = {
          courseCode: pref.course_code,
          section: pref.section,
          courseName: pref.course_name,
          rank: pref.preference_rank,
          timeSlot: pref.time_slot
        };
        allocated = true;
        console.log(`    ✅ Allocated: ${pref.course_code}-${pref.section} (Rank ${pref.preference_rank})`);
        break; // ONE elective only — stop after first successful allocation
      }

      // Notify student
      if (allocated) {
        const c = studentResult.allocatedCourse;
        await createNotification(
          student.id, 'student', 'allocation_result',
          '🎯 Elective Course Allocated!',
          `You have been allocated: ${c.courseCode} Section ${c.section} — ${c.courseName}. Check your Results page.`
        );
      } else {
        await createNotification(
          student.id, 'student', 'allocation_result',
          '⚠️ No Elective Allocated',
          `No elective could be allocated. All preferred courses are full or already completed. Please contact your admin.`
        );
      }

      allocationResults.push(studentResult);
    }

    // Summary by tier
    const tierSummary = [1, 2, 3, 4].map(tier => {
      const tierStudents = allocationResults.filter(s => s.tier === tier);
      const allocated = tierStudents.filter(s => s.allocatedCourse).length;
      return { tier, total: tierStudents.length, allocated, unallocated: tierStudents.length - allocated };
    });

    console.log('✅ Allocation completed!');
    console.log('📊 Tier Summary:', JSON.stringify(tierSummary));

    return {
      success: true,
      message: 'Elective allocation completed successfully',
      totalStudents: students.length,
      totalAllocated: allocationResults.filter(s => s.allocatedCourse).length,
      tierSummary,
      results: allocationResults
    };
  }

  async getStudentAllocation(studentId) {
    const result = await query(
      `SELECT e.*, c.course_code, c.course_name, c.department,
              c.instructor, c.time_slot, c.seat_capacity, c.section, c.course_type
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.student_id = ? AND e.allocation_status = 'allocated'`,
      [studentId]
    );
    return result;
  }
}

module.exports = new AllocationService();
