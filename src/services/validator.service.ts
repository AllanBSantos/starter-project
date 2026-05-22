import { Report, ResolutionResult, ValidationResult } from '../types';

/**
 * TODO: CANDIDATO - Implementar validação de resoluções automáticas
 *
 * Confirma se a resolução automática realmente funcionou.
 */
export class ResolutionValidator {
  /**
   * TODO: CANDIDATO - Implementar
   *
   * Valida se a resolução automática foi bem-sucedida
   */
  static async validate(
    report: Report,
    resolution: ResolutionResult
  ): Promise<ValidationResult> {
    // TODO: CANDIDATO - Implementar validação de resolução
    throw new Error('ResolutionValidator.validate() not implemented - CANDIDATO DEVE IMPLEMENTAR');
  }

  /**
   * TODO: CANDIDATO - Implementar
   *
   * Determina se deve fazer retry da resolução
   */
  static shouldRetry(report: Report, attempts: number, lastError?: Error): boolean {
    // TODO: CANDIDATO - Implementar lógica de retry
    throw new Error('ResolutionValidator.shouldRetry() not implemented - CANDIDATO DEVE IMPLEMENTAR');
  }
}
