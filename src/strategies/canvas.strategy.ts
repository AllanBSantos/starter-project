import { Report, ResolutionResult, ResolutionStrategy } from '../types';

/**
 * TODO: CANDIDATO - Implementar CanvasStrategy
 *
 * Strategy para resolver problemas relacionados à lousa interativa.
 */
export const CanvasStrategy: ResolutionStrategy = {
  name: 'canvas-resolution',

  canHandle: (report: Report): boolean => {
    return report.problem_type === 'canvas';
  },

  execute: async (report: Report): Promise<ResolutionResult> => {
    // TODO: CANDIDATO - Implementar resolução de problemas de canvas
    throw new Error('CanvasStrategy.execute() not implemented - CANDIDATO DEVE IMPLEMENTAR');
  },
};
