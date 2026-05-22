import { Report, ResolutionResult, ResolutionStrategy } from '../types';

/**
 * TODO: CANDIDATO - Implementar OtherStrategy
 *
 * Fallback para problemas não classificados ou genéricos.
 */
export const OtherStrategy: ResolutionStrategy = {
  name: 'other-resolution',

  canHandle: (report: Report): boolean => {
    return report.problem_type === 'other';
  },

  execute: async (report: Report): Promise<ResolutionResult> => {
    // TODO: CANDIDATO - Implementar resolução de problemas genéricos
    throw new Error('OtherStrategy.execute() not implemented - CANDIDATO DEVE IMPLEMENTAR');
  },
};
