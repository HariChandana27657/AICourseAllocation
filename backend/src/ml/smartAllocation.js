/**
 * AI-Enhanced Smart Allocation Algorithm
 * Uses machine learning to optimize course allocation
 */

const brain = require('brain.js');

class SmartAllocationEngine {
  constructor() {
    // Neural network for allocation optimization
    this.network = new brain.NeuralNetwork({
      hiddenLayers: [15, 10, 8],
      activation: 'sigmoid'
    });

    this.trained = false;
  }

  /**
   * Prepare training data from successful past allocations
   */
  prepareTrainingData(historicalAllocations) {
    const trainingData = [];

    for (const allocation of historicalAllocations) {
      const input = {
        studentGPA: allocation.student_gpa / 4.0,
        preferenceRank: allocation.preference_rank / 10.0,
        seatAvailability: allocation.available_seats / allocation.total_seats,
        sameDepartment: allocation.same_department ? 1 : 0,
        prerequisitesMet: allocation.prerequisites_met ? 1 : 0,
        timeConflict: allocation.time_conflict ? 0 : 1,
      };

      // Output: success score (1 = allocated successfully, 0 = failed)
      const output = {
        success: allocation.allocated ? 1 : 0
      };

      trainingData.push({ input, output });
    }

    return trainingData;
  }

  /**
   * Train the allocation model
   */
  async train(trainingData) {
    if (trainingData.length < 20) {
      console.log('⚠️  Insufficient data for ML allocation. Using rule-based algorithm.');
      return;
    }

    console.log(`Training smart allocation model with ${trainingData.length} samples...`);

    const result = this.network.train(trainingData, {
      iterations: 2000,
      errorThresh: 0.005,
      log: true,
      logPeriod: 100
    });

    this.trained = true;
    console.log('✓ Smart allocation model trained successfully');
    console.log(`  Final error: ${result.error}`);
  }

  /**
   * Calculate allocation score using ML
   */
  calculateAllocationScore(student, course, preferenceRank, availableSeats, prerequisitesMet, hasTimeConflict) {
    if (!this.trained) {
      return this.ruleBasedScore(student, course, preferenceRank, availableSeats, prerequisitesMet, hasTimeConflict);
    }

    const input = {
      studentGPA: student.gpa / 4.0,
      preferenceRank: preferenceRank / 10.0,
      seatAvailability: availableSeats / course.seat_capacity,
      sameDepartment: student.department === course.department ? 1 : 0,
      prerequisitesMet: prerequisitesMet ? 1 : 0,
      timeConflict: hasTimeConflict ? 0 : 1,
    };

    const prediction = this.network.run(input);
    return prediction.success;
  }

  /**
   * Rule-based scoring (fallback)
   */
  ruleBasedScore(student, course, preferenceRank, availableSeats, prerequisitesMet, hasTimeConflict) {
    let score = 0;

    // GPA weight (30%)
    score += (student.gpa / 4.0) * 0.3;

    // Preference rank weight (25%)
    score += (1 - (preferenceRank - 1) / 10) * 0.25;

    // Seat availability weight (15%)
    score += (availableSeats / course.seat_capacity) * 0.15;

    // Department match weight (10%)
    if (student.department === course.department) {
      score += 0.1;
    }

    // Prerequisites weight (15%)
    if (prerequisitesMet) {
      score += 0.15;
    }

    // Time conflict penalty (5%)
    if (!hasTimeConflict) {
      score += 0.05;
    }

    return score;
  }

  /**
   * Optimize allocation using genetic algorithm
   */
  geneticOptimization(students, courses, preferences, generations = 50) {
    console.log('🧬 Running genetic algorithm for optimal allocation...');

    let population = this.initializePopulation(students, courses, preferences, 20);
    
    for (let gen = 0; gen < generations; gen++) {
      // Evaluate fitness
      const fitness = population.map(individual => ({
        individual,
        fitness: this.evaluateFitness(individual, students, courses, preferences)
      }));

      // Sort by fitness
      fitness.sort((a, b) => b.fitness - a.fitness);

      // Selection - keep top 50%
      const selected = fitness.slice(0, Math.floor(fitness.length / 2));

      // Crossover and mutation
      const newPopulation = selected.map(s => s.individual);
      while (newPopulation.length < population.length) {
        const parent1 = selected[Math.floor(Math.random() * selected.length)].individual;
        const parent2 = selected[Math.floor(Math.random() * selected.length)].individual;
        const child = this.crossover(parent1, parent2);
        this.mutate(child);
        newPopulation.push(child);
      }

      population = newPopulation;

      if (gen % 10 === 0) {
        console.log(`  Generation ${gen}: Best fitness = ${fitness[0].fitness.toFixed(4)}`);
      }
    }

    // Return best solution
    const finalFitness = population.map(individual => ({
      individual,
      fitness: this.evaluateFitness(individual, students, courses, preferences)
    }));
    finalFitness.sort((a, b) => b.fitness - a.fitness);

    console.log(`✓ Genetic optimization complete. Best fitness: ${finalFitness[0].fitness.toFixed(4)}`);
    return finalFitness[0].individual;
  }

  /**
   * Initialize random population
   */
  initializePopulation(students, courses, preferences, size) {
    const population = [];
    for (let i = 0; i < size; i++) {
      const individual = {};
      for (const student of students) {
        const studentPrefs = preferences.filter(p => p.student_id === student.id);
        if (studentPrefs.length > 0) {
          const randomPref = studentPrefs[Math.floor(Math.random() * studentPrefs.length)];
          individual[student.id] = randomPref.course_id;
        }
      }
      population.push(individual);
    }
    return population;
  }

  /**
   * Evaluate fitness of allocation
   */
  evaluateFitness(individual, students, courses, preferences) {
    let totalScore = 0;
    let allocations = 0;

    for (const studentId in individual) {
      const courseId = individual[studentId];
      const student = students.find(s => s.id == studentId);
      const course = courses.find(c => c.id == courseId);
      const pref = preferences.find(p => p.student_id == studentId && p.course_id == courseId);

      if (!student || !course || !pref) continue;

      // Score based on preference rank (lower is better)
      const prefScore = 1 - (pref.preference_rank - 1) / 10;
      
      // Score based on GPA
      const gpaScore = student.gpa / 4.0;

      totalScore += (prefScore * 0.7 + gpaScore * 0.3);
      allocations++;
    }

    return allocations > 0 ? totalScore / allocations : 0;
  }

  /**
   * Crossover two individuals
   */
  crossover(parent1, parent2) {
    const child = {};
    const keys = Object.keys(parent1);
    
    for (const key of keys) {
      child[key] = Math.random() < 0.5 ? parent1[key] : parent2[key];
    }

    return child;
  }

  /**
   * Mutate individual
   */
  mutate(individual, mutationRate = 0.1) {
    for (const key in individual) {
      if (Math.random() < mutationRate) {
        // Random mutation - would need course list
        // Simplified for now
      }
    }
  }

  /**
   * Predict allocation success probability
   */
  predictAllocationSuccess(student, course, preferenceRank) {
    const score = this.calculateAllocationScore(
      student,
      course,
      preferenceRank,
      course.seat_capacity - course.enrolled_count,
      true, // Assume prerequisites met
      false // Assume no time conflict
    );

    return {
      probability: score,
      confidence: this.trained ? 'high' : 'medium',
      recommendation: score > 0.7 ? 'Likely to be allocated' : 
                      score > 0.4 ? 'Moderate chance' : 
                      'Low probability'
    };
  }

  /**
   * Save model
   */
  saveModel(filepath) {
    const fs = require('fs');
    const modelData = {
      network: this.network.toJSON(),
      trained: this.trained
    };
    fs.writeFileSync(filepath, JSON.stringify(modelData));
    console.log(`✓ Smart allocation model saved to ${filepath}`);
  }

  /**
   * Load model
   */
  loadModel(filepath) {
    const fs = require('fs');
    if (!fs.existsSync(filepath)) {
      console.log('⚠️  No saved allocation model found');
      return false;
    }

    const modelData = JSON.parse(fs.readFileSync(filepath));
    this.network.fromJSON(modelData.network);
    this.trained = modelData.trained;
    console.log('✓ Smart allocation model loaded');
    return true;
  }
}

module.exports = SmartAllocationEngine;
