import * as progressRepository from '../repository/progress.repository.js';
import type { Progress, AcademicGoal } from '../types/progress.types.js';
import { ERROR_MESSAGES } from '../../../constants/errors.js';

export function getAllProgress(): Progress[] {
  return progressRepository.getAllProgress();
}

export function getProgressByStudent(studentId: string): Progress[] {
  if (!studentId) {
    throw new Error('Student ID is required');
  }
  return progressRepository.getProgressByStudent(studentId);
}

export function saveProgress(progress: Progress[]): void {
  if (!Array.isArray(progress)) {
    throw new Error(ERROR_MESSAGES.EXPECTED_ARRAY_OF_PROGRESS);
  }
  
  progressRepository.saveProgress(progress);
}

export function getAcademicGoalsByStudent(studentId: string): AcademicGoal[] {
  if (!studentId) {
    throw new Error('Student ID is required');
  }
  return progressRepository.getAcademicGoalsByStudent(studentId);
}

export function saveAcademicGoals(goals: AcademicGoal[], options?: { studentIds?: string[], clearAll?: boolean }): void {
  if (!Array.isArray(goals)) {
    throw new Error(ERROR_MESSAGES.EXPECTED_ARRAY_OF_ACADEMIC_GOALS);
  }
  
  progressRepository.saveAcademicGoals(goals, options);
}
