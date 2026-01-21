-- Update RLS policies to enforce "approved" status for public access

-- Organizations
DROP POLICY IF EXISTS "Organizations are viewable by everyone." ON organizations;
CREATE POLICY "Approved organizations are viewable by everyone." ON organizations
  FOR SELECT USING (status = 'approved');
CREATE POLICY "Admins can view all organizations." ON organizations
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'));
CREATE POLICY "Owners can view their own organization." ON organizations
  FOR SELECT USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = id AND user_id = auth.uid()));

-- Jobs (includes Quests)
DROP POLICY IF EXISTS "Jobs are viewable by everyone." ON jobs;
CREATE POLICY "Jobs of approved organizations are viewable by everyone." ON jobs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = jobs.organization_id
      AND organizations.status = 'approved'
    )
  );
CREATE POLICY "Admins can view all jobs." ON jobs
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'));
CREATE POLICY "Owners can view their own jobs." ON jobs
  FOR SELECT USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_id = jobs.organization_id AND user_id = auth.uid()));

-- Media Library
DROP POLICY IF EXISTS "Media is viewable by everyone." ON media_library;
CREATE POLICY "Media of approved organizations are viewable by everyone." ON media_library
  FOR SELECT USING (
    (organization_id IS NULL AND job_id IS NULL) OR -- Official/General media
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = media_library.organization_id
      AND organizations.status = 'approved'
    ) OR
    EXISTS (
        SELECT 1 FROM jobs
        JOIN organizations ON jobs.organization_id = organizations.id
        WHERE jobs.id = media_library.job_id
        AND organizations.status = 'approved'
    )
  );
CREATE POLICY "Admins can view all media." ON media_library
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'));
CREATE POLICY "Owners can view their own media." ON media_library
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = media_library.organization_id AND user_id = auth.uid())
  );
