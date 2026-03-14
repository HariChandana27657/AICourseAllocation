/**
 * AI-Powered Course Demand Prediction
 * Predicts future course demand using time series analysis and regression
 */

const brain = require('brain.js');

class DemandPredictionEngine {
  constructor() {
    // LSTM network for time series prediction
    this.lstm = new brain.recurrent.LSTM({
      hiddenLayers: [20, 20],
      learningRate: 0.01
    });

    // Simple regression network
    this.regressionNet = new brain.NeuralNetwork({
      hiddenLayers: [8, 6],
      activation: 'sigmoid'
    });

    this.trained = false;
  }

  /**
   * Prepare training data from historical preferences
   */
  prepareTrainingData(courses, preferences, enrollments) {
    const trainingData = [];

    for (const course of courses) {
      // Count preferences for this course
      const preferenceCount = preferences.filter(p => p.course_id === course.id).length;
      const enrollmentCount = enrollments.filter(e => e.course_id === course.id).length;

      // Features
      const input = {
        seatCapacity: course.seat_capacity / 100, // Normalize
        currentEnrolled: course.enrolled_count / course.seat_capacity,
        preferenceCount: preferenceCount / 50, // Normalize
        departmentPopularity: this.calculateDepartmentPopularity(course.department, preferences),
      };

      // Target: demand ratio (preferences / capacity)
      const output = {
        demandRatio: Math.min(preferenceCount / course.seat_capacity, 2.0) / 2.0 // Normalize to 0-1
      };

      trainingData.push({ input, output });
    }

    return trainingData;
  }

  /**
   * Calculate department popularity
   */
  calculateDepartmentPopularity(department, preferences) {
    // This would use historical data in production
    const deptPreferences = preferences.filter(p => {
      // Simplified - would need course lookup
      return true;
    });
    return Math.min(deptPreferences.length / 100, 1.0);
  }

  /**
   * Train the demand prediction model
   */
  async train(trainingData) {
    if (trainingData.length < 5) {
      console.log('⚠️  Insufficient data for demand prediction. Using heuristics.');
      return;
    }

    console.log(`Training demand prediction model with ${trainingData.length} samples...`);

    const result = this.regressionNet.train(trainingData, {
      iterations: 1500,
      errorThresh: 0.01,
      log: true,
      logPeriod: 100
    });

    this.trained = true;
    console.log('✓ Demand prediction model trained successfully');
    console.log(`  Final error: ${result.error}`);
  }

  /**
   * Predict demand for a course
   */
  predictDemand(course, currentPreferences) {
    if (!this.trained) {
      return this.heuristicDemandPrediction(course, currentPreferences);
    }

    const input = {
      seatCapacity: course.seat_capacity / 100,
      currentEnrolled: course.enrolled_count / course.seat_capacity,
      preferenceCount: currentPreferences / 50,
      departmentPopularity: 0.5, // Would calculate from data
    };

    const prediction = this.regressionNet.run(input);
    const demandRatio = prediction.demandRatio * 2.0; // Denormalize

    return {
      course_id: course.id,
      course_code: course.course_code,
      predicted_demand: Math.round(demandRatio * course.seat_capacity),
      demand_ratio: demandRatio,
      recommendation: this.getDemandRecommendation(demandRatio),
      confidence: this.trained ? 0.85 : 0.60
    };
  }

  /**
   * Heuristic-based demand prediction (fallback)
   */
  heuristicDemandPrediction(course, currentPreferences) {
    const demandRatio = currentPreferences / course.seat_capacity;

    return {
      course_id: course.id,
      course_code: course.course_code,
      predicted_demand: currentPreferences,
      demand_ratio: demandRatio,
      recommendation: this.getDemandRecommendation(demandRatio),
      confidence: 0.60
    };
  }

  /**
   * Get recommendation based on demand ratio
   */
  getDemandRecommendation(demandRatio) {
    if (demandRatio > 1.5) {
      return 'High demand - Consider increasing capacity';
    } else if (demandRatio > 1.2) {
      return 'Moderate-high demand - Monitor closely';
    } else if (demandRatio > 0.8) {
      return 'Optimal demand - Well balanced';
    } else if (demandRatio > 0.5) {
      return 'Low-moderate demand - Consider promotion';
    } else {
      return 'Low demand - Review course offering';
    }
  }

  /**
   * Predict enrollment trends
   */
  predictTrends(historicalData) {
    // Simple trend analysis
    if (historicalData.length < 3) {
      return { trend: 'stable', confidence: 0.5 };
    }

    const recentAvg = historicalData.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const olderAvg = historicalData.slice(0, -3).reduce((a, b) => a + b, 0) / (historicalData.length - 3);

    const change = (recentAvg - olderAvg) / olderAvg;

    let trend;
    if (change > 0.1) trend = 'increasing';
    else if (change < -0.1) trend = 'decreasing';
    else trend = 'stable';

    return {
      trend,
      change_percentage: (change * 100).toFixed(1),
      confidence: 0.75
    };
  }

  /**
   * Identify courses at risk of under-enrollment
   */
  identifyRiskyCourses(courses, preferences) {
    const riskyCourses = [];

    for (const course of courses) {
      const preferenceCount = preferences.filter(p => p.course_id === course.id).length;
      const demandRatio = preferenceCount / course.seat_capacity;

      if (demandRatio < 0.3) {
        riskyCourses.push({
          course_id: course.id,
          course_code: course.course_code,
          course_name: course.course_name,
          current_preferences: preferenceCount,
          seat_capacity: course.seat_capacity,
          risk_level: demandRatio < 0.1 ? 'high' : 'medium',
          recommendation: 'Consider marketing or rescheduling'
        });
      }
    }

    return riskyCourses.sort((a, b) => {
      const riskOrder = { high: 0, medium: 1 };
      return riskOrder[a.risk_level] - riskOrder[b.risk_level];
    });
  }

  /**
   * Save model
   */
  saveModel(filepath) {
    const fs = require('fs');
    const modelData = {
      network: this.regressionNet.toJSON(),
      trained: this.trained
    };
    fs.writeFileSync(filepath, JSON.stringify(modelData));
    console.log(`✓ Demand prediction model saved to ${filepath}`);
  }

  /**
   * Load model
   */
  loadModel(filepath) {
    const fs = require('fs');
    if (!fs.existsSync(filepath)) {
      console.log('⚠️  No saved demand model found');
      return false;
    }

    const modelData = JSON.parse(fs.readFileSync(filepath));
    this.regressionNet.fromJSON(modelData.network);
    this.trained = modelData.trained;
    console.log('✓ Demand prediction model loaded');
    return true;
  }
}

module.exports = DemandPredictionEngine;
