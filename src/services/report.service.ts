import { Pool } from 'pg';
import { Report, CreateReportDTO, ResolutionResult } from '../types';
import { logger } from '../utils/logger';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/auto_quality',
});

export class ReportService {
  /**
   * Create a new report
   */
  static async create(dto: CreateReportDTO): Promise<Report> {
    const query = `
      INSERT INTO reports (student_id, lesson_id, problem_type, description, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      dto.student_id,
      dto.lesson_id,
      dto.problem_type,
      dto.description,
      JSON.stringify(dto.metadata),
    ];

    const result = await pool.query(query, values);
    return this.mapRow(result.rows[0]);
  }

  /**
   * Find report by ID
   */
  static async findById(id: string): Promise<Report | null> {
    const query = 'SELECT * FROM reports WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRow(result.rows[0]);
  }

  /**
   * Find all reports with optional filters
   */
  static async findAll(filters: {
    status?: string;
    problem_type?: string;
    limit?: number;
  } = {}): Promise<Report[]> {
    let query = 'SELECT * FROM reports WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.problem_type) {
      query += ` AND problem_type = $${paramCount}`;
      values.push(filters.problem_type);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
    }

    const result = await pool.query(query, values);
    return result.rows.map(row => this.mapRow(row));
  }

  /**
   * Update report status
   */
  static async updateStatus(id: string, status: string): Promise<void> {
    const query = 'UPDATE reports SET status = $1, updated_at = NOW() WHERE id = $2';
    await pool.query(query, [status, id]);
    logger.info(`Report ${id} status updated to ${status}`);
  }

  /**
   * Update report problem_type
   * TODO: CANDIDATO - Usar após classificação automática
   */
  static async updateProblemType(id: string, problemType: string): Promise<void> {
    const query = 'UPDATE reports SET problem_type = $1, updated_at = NOW() WHERE id = $2';
    await pool.query(query, [problemType, id]);
    logger.info(`Report ${id} problem_type updated to ${problemType}`);
  }

  /**
   * Update report with resolution result
   */
  static async updateResolution(
    reportId: string,
    resolution: ResolutionResult,
    newStatus: string
  ): Promise<void> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update report status
      await client.query(
        'UPDATE reports SET status = $1, updated_at = NOW() WHERE id = $2',
        [newStatus, reportId]
      );

      // Insert resolution result
      await client.query(
        `INSERT INTO resolution_results
         (report_id, success, strategy, message, actions_taken, auto_resolved)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          reportId,
          resolution.success,
          resolution.strategy,
          resolution.message,
          JSON.stringify(resolution.actions_taken),
          resolution.auto_resolved,
        ]
      );

      await client.query('COMMIT');
      logger.info(`Report ${reportId} resolution saved`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get statistics
   */
  static async getStats(): Promise<{
    total: number;
    pending: number;
    auto_resolved: number;
    escalated: number;
    failed: number;
    success_rate: number;
  }> {
    const query = `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'auto_resolved') as auto_resolved,
        COUNT(*) FILTER (WHERE status = 'escalated') as escalated,
        COUNT(*) FILTER (WHERE status = 'failed') as failed
      FROM reports
    `;

    const result = await pool.query(query);
    const stats = result.rows[0];

    const total = parseInt(stats.total);
    const autoResolved = parseInt(stats.auto_resolved);
    const successRate = total > 0 ? Math.round((autoResolved / total) * 100) : 0;

    return {
      total,
      pending: parseInt(stats.pending),
      auto_resolved: autoResolved,
      escalated: parseInt(stats.escalated),
      failed: parseInt(stats.failed),
      success_rate: successRate,
    };
  }

  /**
   * Map database row to Report type
   */
  private static mapRow(row: any): Report {
    return {
      id: row.id,
      student_id: row.student_id,
      lesson_id: row.lesson_id,
      problem_type: row.problem_type,
      description: row.description,
      metadata: row.metadata || {},
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
