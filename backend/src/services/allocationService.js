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
  } catch (e) { /* silent */ }
};

function getCGPATier(gpa) {
  if (gpa >= 8.0) return 1;
  if (gpa >= 7.5) return 2;
  if (gpa >= 7.0) return 3;
  return 4;
}

function timesConflict(slot1, slot2) {
  if (!slot1 || !slot2) return false;
  const days1 = slot1.split(' ')[0].split('/');
  const days2 = slot2.split(' ')[0].split('/');
  return days1.some(d => days2.includes(d));
}

class AllocationService {

  async runAllocation() {
    console.log('🚀 Starting bulk CGPA-priority elective allocation...');
    const startTime = Date.now();

    // ── Step 1: Clear existing allocations ──
    await execute('DELETE FROM enrollments', []);
    await execute('UPDATE courses SET enrolled_count = 0', []);

    // ── Step 2: Load ALL data into memory (one query each) ──
    const students = await query(
      `SELECT id, name, gpa, year_of_study FROM students ORDER BY gpa DESC, id ASC`
    );

    const courses = await query(
      `SELECT id, course_code, course_name, section, seat_capacity, enrolled_count, time_slot, year_of_study, course_type
       FROM courses WHERE course_type = 'elective'`
    );

    const allPrefs = await query(
      `SELECT student_id, course_id, preference_rank FROM preferences ORDER BY student_id, preference_rank`
    );

    const completedRows = await query(
      `SELECT student_id, course_id FROM completed_courses`
    );

    console.log(`📊 Students: ${students.length} | Courses: ${courses.length} | Preferences: ${allPrefs.length}`);

    // ── Step 3: Build in-memory maps ──
    // course map: id → course object (with live seat tracking)
    const courseMap = {};
    courses.forEach(c => { courseMap[c.id] = { ...c, available: c.seat_capacity - c.enrolled_count }; });

    // preferences map: student_id → sorted array of course_ids
    const prefMap = {};
    allPrefs.forEach(p => {
      if (!prefMap[p.student_id]) prefMap[p.student_id] = [];
      prefMap[p.student_id].push(p.course_id);
    });

    // completed set: "studentId_courseId"
    const completedSet = new Set(completedRows.map(r => `${r.student_id}_${r.course_id}`));

    // ── Step 4: Allocate in memory ──
    const allocations = []; // { student_id, course_id }
    const results = [];
    let totalAllocated = 0;

    for (const student of students) {
      const prefs = prefMap[student.id] || [];
      let allocated = false;

      for (const courseId of prefs) {
        const course = courseMap[courseId];
        if (!course) continue;

        // Skip if wrong year
        if (course.year_of_study && course.year_of_study !== student.year_of_study) continue;

        // Skip if already completed
        if (completedSet.has(`${student.id}_${courseId}`)) continue;

        // Skip if no seats
        if (course.available <= 0) continue;

        // Allocate!
        course.available--;
        course.enrolled_count++;
        allocations.push([student.id, courseId]);
        totalAllocated++;
        allocated = true;

        results.push({
          studentId: student.id,
          studentName: student.name,
          gpa: student.gpa,
          tier: getCGPATier(student.gpa),
          allocatedCourse: {
            courseCode: course.course_code,
            section: course.section,
            courseName: course.course_name
          }
        });
        break; // ONE elective only
      }

      if (!allocated && prefs.length > 0) {
        results.push({
          studentId: student.id,
          studentName: student.name,
          gpa: student.gpa,
          tier: getCGPATier(student.gpa),
          allocatedCourse: null
        });
      }
    }

    // ── Step 5: Bulk insert allocations ──
    console.log(`💾 Saving ${allocations.length} allocations to database...`);

    if (allocations.length > 0) {
      // Insert in batches of 500
      const BATCH = 500;
      for (let i = 0; i < allocations.length; i += BATCH) {
        const batch = allocations.slice(i, i + BATCH);
        const placeholders = batch.map(() => '(?,?,?)').join(',');
        const values = batch.flatMap(([sid, cid]) => [sid, cid, 'allocated']);
        await execute(
          `INSERT OR IGNORE INTO enrollments (student_id, course_id, allocation_status) VALUES ${placeholders}`,
          values
        );
      }
    }

    // ── Step 6: Bulk update enrolled_count ──
    for (const course of courses) {
      const updated = courseMap[course.id];
      if (updated.enrolled_count !== course.enrolled_count) {
        await execute(
          `UPDATE courses SET enrolled_count = ? WHERE id = ?`,
          [updated.enrolled_count, course.id]
        );
      }
    }

    // ── Step 7: Notify students (batch, limit to 1000 to avoid timeout) ──
    const notifyLimit = Math.min(allocations.length, 1000);
    for (let i = 0; i < notifyLimit; i++) {
      const [studentId, courseId] = allocations[i];
      const course = courseMap[courseId];
      await createNotification(studentId, 'student', 'allocation_result',
        '🎯 Elective Course Allocated!',
        `You have been allocated: ${course.course_code}-${course.section} — ${course.course_name}.`
      );
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Allocation done in ${elapsed}s — ${totalAllocated}/${students.length} students allocated`);

    // Tier summary
    const tierSummary = [1, 2, 3, 4].map(tier => {
      const ts = results.filter(s => s.tier === tier);
      const alloc = ts.filter(s => s.allocatedCourse).length;
      return { tier, total: ts.length, allocated: alloc, unallocated: ts.length - alloc };
    });

    return {
      success: true,
      message: `Allocation completed in ${elapsed}s`,
      totalStudents: students.length,
      totalAllocated,
      tierSummary,
      results: results.slice(0, 100) // return first 100 for display
    };
  }

  async getStudentAllocation(studentId) {
    return await query(
      `SELECT e.*, c.course_code, c.course_name, c.department,
              c.instructor, c.time_slot, c.seat_capacity, c.section, c.course_type
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.student_id = ? AND e.allocation_status = 'allocated'`,
      [studentId]
    );
  }
}

module.exports = new AllocationService();
