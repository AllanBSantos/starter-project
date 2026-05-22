/**
 * Core types for the Auto Quality System
 */

export type ProblemType = 'video' | 'subtitle' | 'exercise' | 'canvas' | 'other';

export type ReportStatus =
  | 'pending'
  | 'processing'
  | 'auto_resolved'
  | 'escalated'
  | 'failed';

export interface Lesson {
  id: string;
  title: string;
  video_url: string;
  subtitle_url: string;
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
}

export interface ReportMetadata {
  timestamp?: number;
  exercise_id?: string;
  browser?: string;
  connection_speed?: number;
  device?: string;
  error_code?: string;
  [key: string]: unknown;
}

export interface Report {
  id: string;
  student_id: string;
  lesson_id: string;
  problem_type: ProblemType;
  description: string;
  metadata: ReportMetadata;
  status: ReportStatus;
  created_at: Date;
  updated_at: Date;
  resolution?: ResolutionResult;
}

export interface ResolutionResult {
  success: boolean;
  strategy: string;
  message: string;
  actions_taken: string[];
  resolved_at: Date;
  auto_resolved: boolean;
}

export interface ResolutionStrategy {
  name: string;
  canHandle(report: Report): boolean;
  execute(report: Report): Promise<ResolutionResult>;
}

export interface CreateReportDTO {
  student_id: string;
  lesson_id: string;
  problem_type?: ProblemType; // TODO: CANDIDATO - Será classificado automaticamente se não fornecido
  description: string;
  metadata: ReportMetadata;
}

/**
 * TODO: CANDIDATO - Implementar em src/services/classifier.service.ts
 */
export interface ClassificationResult {
  problem_type: ProblemType;
  confidence: number;
  keywords: string[];
  isFalsePositive: boolean;
}

/**
 * TODO: CANDIDATO - Implementar em src/services/validator.service.ts
 */
export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  checks: Array<{
    name: string;
    passed: boolean;
    details?: string;
  }>;
}

/**
 * TODO: CANDIDATO - Implementar em src/services/escalation.service.ts
 */
export type Priority = 'P0' | 'P1' | 'P2' | 'P3';

export interface EscalationDecision {
  shouldEscalate: boolean;
  priority: Priority;
  reason: string;
  assignTo?: string;
}
