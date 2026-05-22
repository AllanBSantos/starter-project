/**
 * Seed database with sample data
 *
 * Usage: npm run seed
 */

import { Client } from 'pg';
import { logger } from '../utils/logger';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/auto_quality';

async function seed() {
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    logger.info('Starting database seed...');
    await client.connect();

    // Sample lessons
    const sampleLessons = [
      {
        title: 'Lógica de programação',
        video_url: 'https://cdn.example.com/videos/lesson_001.mp4',
        subtitle_url: 'https://cdn.example.com/subtitles/lesson_001_pt.vtt',
      },
      {
        title: 'Variáveis e tipos de dados',
        video_url: 'https://cdn.example.com/videos/lesson_002.mp4',
        subtitle_url: 'https://cdn.example.com/subtitles/lesson_002_pt.vtt',
      },
    ];

    logger.info('Seeding lessons...');
    for (const lesson of sampleLessons) {
      await client.query(
        'INSERT INTO lessons (title, video_url, subtitle_url) VALUES ($1, $2, $3)',
        [lesson.title, lesson.video_url, lesson.subtitle_url]
      );
    }

    // Get lesson IDs for reports
    const lessonsResult = await client.query('SELECT id FROM lessons ORDER BY created_at ASC');
    const lessonIds = lessonsResult.rows.map(row => row.id);

    // Sample reports
    const sampleReports = [
      {
        student_id: '550e8400-e29b-41d4-a716-446655440001',
        lesson_id: lessonIds[0],
        problem_type: 'video',
        description: 'Video keeps buffering every few seconds',
        metadata: {
          connection_speed: 1.2,
          browser: 'Chrome 120',
          device: 'mobile',
        },
      },
      {
        student_id: '550e8400-e29b-41d4-a716-446655440002',
        lesson_id: lessonIds[0],
        problem_type: 'subtitle',
        description: 'Legenda está adiantada em relação ao vídeo',
        metadata: {
          timestamp: 45.5,
          browser: 'Firefox 121',
        },
      },
      {
        student_id: '550e8400-e29b-41d4-a716-446655440003',
        lesson_id: lessonIds[1] || lessonIds[0],
        problem_type: 'exercise',
        description: 'A resposta marcada como correta está errada',
        metadata: {
          exercise_id: 'ex_456',
          selected_answer: 'B',
        },
      },
    ];

    logger.info('Seeding reports...');
    for (const report of sampleReports) {
      await client.query(
        'INSERT INTO reports (student_id, lesson_id, problem_type, description, metadata) VALUES ($1, $2, $3, $4, $5)',
        [report.student_id, report.lesson_id, report.problem_type, report.description, JSON.stringify(report.metadata)]
      );
    }

    logger.info(`✅ Seeded ${sampleLessons.length} lessons`);
    logger.info(`✅ Seeded ${sampleReports.length} reports`);
    logger.info('✅ Seed completed successfully!');
  } catch (error) {
    logger.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run if called directly
if (require.main === module) {
  seed();
}

export default seed;
