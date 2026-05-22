import { Job } from 'bull';
import { findStrategy } from '../strategies';
import { logger } from '../utils/logger';
import { ReportService } from '../services/report.service';
// TODO: CANDIDATO - Descomentar imports após implementar services
// import { ReportClassifier } from '../services/classifier.service';
// import { ResolutionValidator } from '../services/validator.service';
// import { EscalationService } from '../services/escalation.service';

/**
 * Worker to process report resolution
 *
 * This worker:
 * 1. Receives a report from the queue
 * 2. Finds appropriate resolution strategy
 * 3. Executes the strategy
 * 4. Updates report status in database
 */
export async function processReport(job: Job<{ reportId: string }>) {
  const { reportId } = job.data;

  logger.info(`Processing report ${reportId}`);

  try {
    // Fetch report from database
    const report = await ReportService.findById(reportId);

    if (!report) {
      logger.error(`Report ${reportId} not found`);
      return { success: false, message: 'Report not found' };
    }

    // TODO: CANDIDATO - Implementar classificação se problem_type não fornecido
    // if (!report.problem_type) {
    //   const classification = await ReportClassifier.classify(report.description);
    //
    //   // Verificar se é false positive
    //   if (classification.isFalsePositive) {
    //     await ReportService.updateStatus(reportId, 'auto_resolved');
    //     return {
    //       success: true,
    //       message: 'False positive detected - not a real problem',
    //     };
    //   }
    //
    //   // Atualizar report com problem_type classificado
    //   report.problem_type = classification.problem_type;
    //   // await ReportService.updateProblemType(reportId, classification.problem_type);
    // }

    // TODO: CANDIDATO - Implementar verificação de escalação antes de processar
    // const classificationResult = { ... }; // Resultado da classificação acima
    // const escalationDecision = EscalationService.shouldEscalate(
    //   report,
    //   classificationResult,
    //   0 // número de tentativas
    // );
    //
    // if (escalationDecision.shouldEscalate) {
    //   await ReportService.updateStatus(reportId, 'escalated');
    //   logger.warn(`Report ${reportId} escalated: ${escalationDecision.reason}`);
    //   return {
    //     success: false,
    //     message: `Escalated: ${escalationDecision.reason}`,
    //   };
    // }

    // Update status to processing
    await ReportService.updateStatus(reportId, 'processing');

    // Find appropriate strategy
    const strategy = findStrategy(report);

    if (!strategy) {
      logger.warn(`No strategy found for report ${reportId} - staying as pending`);
      // Keep as pending - candidate needs to implement strategy
      await ReportService.updateStatus(reportId, 'pending');
      return {
        success: false,
        message: 'No strategy implemented yet - report stays pending',
      };
    }

    logger.info(`Using strategy: ${strategy.name}`);

    // Execute resolution
    const result = await strategy.execute(report);

    // TODO: CANDIDATO - Implementar validação de resolução
    // const validation = await ResolutionValidator.validate(report, result);
    //
    // if (!validation.isValid) {
    //   logger.warn(`Resolution validation failed for report ${reportId}`, validation);
    //
    //   // Verificar se deve fazer retry
    //   const attempts = job.attemptsMade || 0;
    //   if (ResolutionValidator.shouldRetry(report, attempts)) {
    //     throw new Error('Resolution validation failed - will retry');
    //   }
    //
    //   // Não deve retry - marcar como failed
    //   await ReportService.updateResolution(reportId, result, 'failed');
    //   return {
    //     success: false,
    //     message: 'Resolution validation failed',
    //   };
    // }

    // Update report with resolution
    if (result.success) {
      await ReportService.updateResolution(reportId, result, 'auto_resolved');
      logger.info(`Report ${reportId} auto-resolved successfully`);
    } else {
      await ReportService.updateResolution(reportId, result, 'failed');
      logger.warn(`Report ${reportId} resolution failed`);

      // TODO: CANDIDATO - Escalar se múltiplas falhas
      // const attempts = job.attemptsMade || 0;
      // if (attempts >= 2) {
      //   const escalationDecision = EscalationService.shouldEscalate(
      //     report,
      //     { ... }, // classification result
      //     attempts
      //   );
      //
      //   if (escalationDecision.shouldEscalate) {
      //     await ReportService.updateStatus(reportId, 'escalated');
      //     logger.warn(`Report ${reportId} escalated after ${attempts} failed attempts`);
      //   }
      // }
    }

    return result;
  } catch (error) {
    logger.error(`Error processing report ${reportId}:`, error);
    await ReportService.updateStatus(reportId, 'failed');
    throw error;
  }
}
