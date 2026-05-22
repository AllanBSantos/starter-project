-- Database schema for Auto Quality System

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  lesson_id UUID NOT NULL,
  -- TODO: CANDIDATO - problem_type é nullable pois será classificado automaticamente
  -- Se não for fornecido pelo frontend, o worker deve classificar usando ReportClassifier
  problem_type VARCHAR(50) CHECK (problem_type IN ('video', 'subtitle', 'exercise', 'canvas', 'other')),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'auto_resolved', 'escalated', 'failed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Resolution results table
CREATE TABLE IF NOT EXISTS resolution_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  success BOOLEAN NOT NULL,
  strategy VARCHAR(100) NOT NULL,
  message TEXT,
  actions_taken JSONB DEFAULT '[]',
  resolved_at TIMESTAMP DEFAULT NOW(),
  auto_resolved BOOLEAN DEFAULT true
);

-- Lessons table (for reference)
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  video_url TEXT NOT NULL,
  subtitle_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_problem_type ON reports(problem_type);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_student_id ON reports(student_id);
CREATE INDEX IF NOT EXISTS idx_reports_lesson_id ON reports(lesson_id);

CREATE INDEX IF NOT EXISTS idx_resolution_report_id ON resolution_results(report_id);
CREATE INDEX IF NOT EXISTS idx_resolution_success ON resolution_results(success);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
