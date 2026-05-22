-- Update problem_type constraint to include 'canvas'

ALTER TABLE reports
DROP CONSTRAINT IF EXISTS reports_problem_type_check;

ALTER TABLE reports
ADD CONSTRAINT reports_problem_type_check
CHECK (problem_type IN ('video', 'subtitle', 'exercise', 'canvas', 'other'));
