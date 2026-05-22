import { ResolutionStrategy, Report } from '../types';

// TODO: CANDIDATO - Descomentar imports após implementar strategies
// import { VideoStrategy } from './video.strategy';
// import { ExerciseStrategy } from './exercise.strategy';
// import { CanvasStrategy } from './canvas.strategy';
// import { OtherStrategy } from './other.strategy';

/**
 * Registry of all available resolution strategies
 *
 * TODO: CANDIDATO - Adicionar strategies implementadas ao array abaixo
 *
 * Ordem importa: strategies mais específicas primeiro, fallback por último
 *
 * Exemplo após implementação:
 * export const RESOLUTION_STRATEGIES: ResolutionStrategy[] = [
 *   VideoStrategy,      // Problemas de vídeo
 *   ExerciseStrategy,   // Problemas de exercício
 *   CanvasStrategy,     // Problemas de lousa
 *   OtherStrategy,      // Fallback para problemas não classificados
 * ];
 */
export const RESOLUTION_STRATEGIES: ResolutionStrategy[] = [
  // TODO: CANDIDATO - Adicionar strategies aqui após implementar
  // VideoStrategy,
  // ExerciseStrategy,
  // CanvasStrategy,
  // OtherStrategy,
];

/**
 * Find the first strategy that can handle the given report
 *
 * Retorna a primeira strategy que pode resolver o report (canHandle = true)
 * Retorna null se nenhuma strategy pode resolver
 */
export function findStrategy(report: Report): ResolutionStrategy | null {
  const strategy = RESOLUTION_STRATEGIES.find((s) => s.canHandle(report));

  if (!strategy) {
    console.warn(`No strategy found for report ${report.id} (type: ${report.problem_type})`);
  }

  return strategy || null;
}
