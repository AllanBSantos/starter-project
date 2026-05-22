import { ClassificationResult } from '../types';

/**
 * TODO: CANDIDATO - Implementar classificação automática de reports
 *
 * Extrai problem_type de descrições em texto livre.
 */
export class ReportClassifier {
  /**
   * TODO: CANDIDATO - Implementar
   *
   * Classifica o tipo de problema baseado na descrição
   */
  static async classify(description: string): Promise<ClassificationResult> {
    // TODO: CANDIDATO - Implementar lógica de classificação
    throw new Error('ReportClassifier.classify() not implemented - CANDIDATO DEVE IMPLEMENTAR');
  }

  /**
   * TODO: CANDIDATO - Implementar
   *
   * Detecta se a descrição é um false positive
   */
  static isFalsePositive(description: string): boolean {
    // TODO: CANDIDATO - Implementar detecção de false positives
    throw new Error('ReportClassifier.isFalsePositive() not implemented - CANDIDATO DEVE IMPLEMENTAR');
  }
}
