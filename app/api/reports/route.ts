import { NextRequest, NextResponse } from 'next/server';
import { CreateReportDTO } from '@/types';
import { logger } from '@/utils/logger';
import { ReportService } from '@/services/report.service';
import { reportQueue } from '@/workers/queue';

/**
 * POST /api/reports
 * Create a new problem report
 */
export async function POST(request: NextRequest) {
  try {
    const dto: CreateReportDTO = await request.json();

    // TODO: Validate DTO with Zod schema

    // Save report to database
    const report = await ReportService.create(dto);

    // Add to processing queue
    await reportQueue.add('process-report', { reportId: report.id });

    logger.info('Report created', { reportId: report.id });

    return NextResponse.json(
      {
        success: true,
        message: 'Report created successfully',
        data: report,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Failed to create report:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create report',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reports
 * List all reports with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const problem_type = searchParams.get('problem_type');
    const limit = parseInt(searchParams.get('limit') || '50');

    const reports = await ReportService.findAll({
      status: status || undefined,
      problem_type: problem_type || undefined,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    logger.error('Failed to list reports:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to list reports',
      },
      { status: 500 }
    );
  }
}
