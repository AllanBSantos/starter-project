import { NextResponse } from 'next/server';
import { logger } from '@/utils/logger';
import { ReportService } from '@/services/report.service';

/**
 * GET /api/reports/stats
 * Get statistics about reports
 */
export async function GET() {
  try {
    const stats = await ReportService.getStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Failed to get stats:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to get stats',
      },
      { status: 500 }
    );
  }
}
