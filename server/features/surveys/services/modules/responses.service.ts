import * as repository from '../../repository/index.js';
import type { SurveyResponse } from '../../types/surveys.types.js';

export function getResponses(filters?: { distributionId?: string; studentId?: string }) {
  return repository.loadSurveyResponses(filters);
}

export function createResponse(response: Partial<SurveyResponse>) {
  repository.saveSurveyResponse(response);
}

export function updateResponse(id: string, response: Partial<SurveyResponse>) {
  repository.updateSurveyResponse(id, response);
}

export function deleteResponse(id: string) {
  repository.deleteSurveyResponse(id);
}
