import { Report, ResolutionResult, ResolutionStrategy } from '../types';

/**
 * TODO: CANDIDATO - Implementar ExerciseStrategy
 *
 * Strategy para resolver problemas relacionados a exercícios.
 */
export const ExerciseStrategy: ResolutionStrategy = {
  name: 'exercise-resolution',

  canHandle: (report: Report): boolean => {
    return report.problem_type === 'exercise';
  },

  execute: async (report: Report): Promise<ResolutionResult> => {
    // TODO: CANDIDATO - Implementar resolução de problemas de exercício
    throw new Error('ExerciseStrategy.execute() not implemented - CANDIDATO DEVE IMPLEMENTAR');
  },
};
