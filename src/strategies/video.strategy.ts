import { Report, ResolutionResult, ResolutionStrategy } from '../types';

/**
 * TODO: CANDIDATO - Implementar VideoStrategy
 *
 * Strategy para resolver problemas relacionados a vídeos.
 */
export const VideoStrategy: ResolutionStrategy = {
  name: 'video-resolution',

  canHandle: (report: Report): boolean => {
    return report.problem_type === 'video';
  },

  execute: async (report: Report): Promise<ResolutionResult> => {
    // TODO: CANDIDATO - Implementar resolução de problemas de vídeo
    throw new Error('VideoStrategy.execute() not implemented - CANDIDATO DEVE IMPLEMENTAR');
  },
};
