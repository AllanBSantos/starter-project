import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';
import { ReportService } from '@/services/report.service';

/**
 * GET /api/reports/:id
 * Get a single report by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const report = await ReportService.findById(id);

    if (!report) {
      return NextResponse.json(
        {
          success: false,
          message: 'Report not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error('Failed to get report:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to get report',
      },
      { status: 500 }
    );
  }
}
