/**
 * AI-Powered Course Recommendation System
 * Uses collaborative filtering and content-based filtering
 */

const brain = require('brain.js');
const { Matrix } = require('ml-matrix');

class CourseRecommendationEngine {
  constructor() {
    // Neural network for student-course matching
    this.network = new brain.NeuralNetwork({
      hiddenLayers: [10, 8, 6],
      activation: 'sigmoid'
    });
    
    this.trained = false;
  }

  /**
   * Prepare training data from historical enrollments and preferences
   */
  prepareTrainingData(students, courses, enrollments, preferences) {
    const trainingData = [];

    for (const enrollment of enrollments) {
      const student = students.find(s => s.id === enrollment.student_id);
      const course = courses.find(c => c.id === enrollment.course_id);
      
      if (!student || !course) continue;

      // Normalize features
      const input = {
        gpa: student.gpa / 4.0,
        sameDepartment: student.department === course.department ? 1 : 0,
        seatAvailability: (course.seat_capacity - course.enrolled_count) / course.seat_capacity,
        // Add more features
      };

      // Output: 1 if successfully enrolled, 0 otherwise
      const output = { enrolled: enrollment.allocation_status === 'allocated' ? 1 : 0 };

      trainingData.push({ input, output });
    }

    return trainingData;
  }

  /**
   * Train the recommendation model
   */
  async train(trainingData) {
    if (trainingData.length < 10) {
      console.log('⚠️  Insufficient training data. Using rule-based recommendations.');
      return;
    }

    console.log(`Training recommendation model with ${trainingData.length} samples...`);
    
    const result = this.network.train(trainingData, {
      iterations: 2000,
      errorThresh: 0.005,
      log: true,
      logPeriod: 100
    });

    this.trained = true;
    console.log('✓ Recommendation model trained successfully');
    console.log(`  Final error: ${result.error}`);
    console.log(`  Iterations: ${result.iterations}`);
  }

  /**
   * Get personalized course recommendations for a student
   */
  recommendCourses(student, courses, topN = 5) {
    const recommendations = [];

    for (const course of courses) {
      let score;

      if (this.trained) {
        // Use neural network prediction
        const input = {
          gpa: student.gpa / 4.0,
          sameDepartment: student.department === course.department ? 1 : 0,
          seatAvailability: (course.seat_capacity - course.enrolled_count) / course.seat_capacity,
        };

        const prediction = this.network.run(input);
        score = prediction.enrolled;
      } else {
        // Fallback to rule-based scoring
        score = this.calculateRuleBasedScore(student, course);
      }

      recommendations.push({
        course_id: course.id,
        course_code: course.course_code,
        course_name: course.course_name,
        department: course.department,
        score: score,
        reason: this.generateReason(student, course, score)
      });
    }

    // Sort by score and return top N
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);
  }

  /**
   * Rule-based scoring (fallback when ML model not trained)
   */
  calculateRuleBasedScore(student, course) {
    let score = 0.5; // Base score

    // Same department bonus
    if (student.department === course.department) {
      score += 0.3;
    }

    // GPA-based scoring
    if (student.gpa >= 3.5) {
      score += 0.15;
    } else if (student.gpa >= 3.0) {
      score += 0.1;
    }

    // Seat availability
    const availability = (course.seat_capacity - course.enrolled_count) / course.seat_capacity;
    score += availability * 0.2;

    // Normalize to 0-1
    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Generate explanation for recommendation
   */
  generateReason(student, course, score) {
    const reasons = [];

    if (student.department === course.department) {
      reasons.push('Matches your department');
    }

    if (score > 0.8) {
      reasons.push('Highly recommended based on your profile');
    } else if (score > 0.6) {
      reasons.push('Good match for your interests');
    }

    const availability = (course.seat_capacity - course.enrolled_count) / course.seat_capacity;
    if (availability > 0.5) {
      reasons.push('Good seat availability');
    } else if (availability > 0) {
      reasons.push('Limited seats available');
    }

    return reasons.join(', ');
  }

  /**
   * Collaborative filtering - find similar students
   */
  findSimilarStudents(targetStudent, allStudents, topN = 5) {
    const similarities = [];

    for (const student of allStudents) {
      if (student.id === targetStudent.id) continue;

      // Calculate similarity based on GPA and department
      let similarity = 0;

      // GPA similarity (inverse of difference)
      const gpaDiff = Math.abs(targetStudent.gpa - student.gpa);
      similarity += (1 - gpaDiff / 4.0) * 0.5;

      // Department match
      if (targetStudent.department === student.department) {
        similarity += 0.5;
      }

      similarities.push({
        student_id: student.id,
        name: student.name,
        similarity: similarity
      });
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topN);
  }

  /**
   * Save model to file
   */
  saveModel(filepath) {
    const fs = require('fs');
    const modelData = {
      network: this.network.toJSON(),
      trained: this.trained
    };
    fs.writeFileSync(filepath, JSON.stringify(modelData));
    console.log(`✓ Model saved to ${filepath}`);
  }

  /**
   * Load model from file
   */
  loadModel(filepath) {
    const fs = require('fs');
    if (!fs.existsSync(filepath)) {
      console.log('⚠️  No saved model found');
      return false;
    }

    const modelData = JSON.parse(fs.readFileSync(filepath));
    this.network.fromJSON(modelData.network);
    this.trained = modelData.trained;
    console.log('✓ Model loaded successfully');
    return true;
  }
}

module.exports = CourseRecommendationEngine;
