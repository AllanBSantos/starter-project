/**
 * Database migration script
 * Executes schema.sql to create tables
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';
import { logger } from '../utils/logger';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/auto_quality';

async function migrate() {
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    logger.info('Connecting to database...');
    await client.connect();

    logger.info('Reading schema.sql...');
    const schemaPath = join(__dirname, 'schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf-8');

    logger.info('Executing migration...');
    await client.query(schemaSql);

    logger.info('✅ Migration completed successfully!');
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run if called directly
if (require.main === module) {
  migrate();
}

export default migrate;
