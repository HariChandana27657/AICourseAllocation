const allocationService = require('../services/allocationService');

// Run allocation algorithm (Admin only)
const runAllocation = async (req, res) => {
  try {
    const result = await allocationService.runAllocation();
    res.json(result);
  } catch (error) {
    console.error('Allocation error:', error);
    res.status(500).json({ error: 'Allocation failed', details: error.message });
  }
};

// Get allocation results for student
const getStudentAllocation = async (req, res) => {
  try {
    const studentId = req.user.id;
    const allocations = await allocationService.getStudentAllocation(studentId);
    
    res.json({
      studentId,
      allocatedCourses: allocations
    });
  } catch (error) {
    console.error('Get allocation error:', error);
    res.status(500).json({ error: 'Failed to fetch allocation results' });
  }
};

module.exports = {
  runAllocation,
  getStudentAllocation
};
