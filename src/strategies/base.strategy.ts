import { Report, ResolutionResult, ResolutionStrategy } from '../types';

/**
 * Base class for resolution strategies
 * Each strategy handles a specific type of problem
 */
export abstract class BaseResolutionStrategy implements ResolutionStrategy {
  abstract name: string;

  /**
   * Determines if this strategy can handle the given report
   */
  abstract canHandle(report: Report): boolean;

  /**
   * Executes the resolution logic
   */
  abstract execute(report: Report): Promise<ResolutionResult>;

  /**
   * Helper to create success result
   */
  protected createSuccessResult(
    message: string,
    actions: string[]
  ): ResolutionResult {
    return {
      success: true,
      strategy: this.name,
      message,
      actions_taken: actions,
      resolved_at: new Date(),
      auto_resolved: true,
    };
  }

  /**
   * Helper to create failure result
   */
  protected createFailureResult(
    message: string,
    actions: string[] = []
  ): ResolutionResult {
    return {
      success: false,
      strategy: this.name,
      message,
      actions_taken: actions,
      resolved_at: new Date(),
      auto_resolved: false,
    };
  }
}
