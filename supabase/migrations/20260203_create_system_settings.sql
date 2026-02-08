-- Create system settings table for global app configurations
CREATE TABLE IF NOT EXISTS system_settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    description text,
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Admin can do everything
CREATE POLICY "Admins have full access to system_settings"
  ON system_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Policy: Authenticated users can read
CREATE POLICY "Anyone can read system_settings"
  ON system_settings
  FOR SELECT
  TO public
  USING (true);

-- Insert default setting for OUR VISION real data toggle
INSERT INTO system_settings (key, value, description)
VALUES ('show_real_stats', 'false'::jsonb, 'Toggle between real database stats and fixed demo stats on the top page')
ON CONFLICT (key) DO NOTHING;
