-- =====================================================
-- 講師アカウント機能 マイグレーション
-- 講師テーブル、profiles拡張、course_curriculums拡張
-- =====================================================

-- =====================================================
-- 1. 講師テーブルの作成
-- =====================================================
CREATE TABLE IF NOT EXISTS instructors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  bio TEXT,
  specialization TEXT,  -- 専門分野
  profile_image TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')) DEFAULT 'pending',
  is_official BOOLEAN DEFAULT FALSE, -- 公式講師フラグ
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS有効化
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;

-- 講師情報は誰でも閲覧可能（承認済みのみ）
CREATE POLICY "Approved instructors are viewable by everyone" ON instructors
  FOR SELECT USING (status = 'approved');

-- 自分の講師プロフィールは自分で確認可能
CREATE POLICY "Users can view own instructor profile" ON instructors
  FOR SELECT USING (user_id = auth.uid());

-- 自分の講師プロフィールは自分で更新可能
CREATE POLICY "Users can update own instructor profile" ON instructors
  FOR UPDATE USING (user_id = auth.uid());

-- 講師申請は認証ユーザーが作成可能
CREATE POLICY "Authenticated users can apply as instructor" ON instructors
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 管理者は全ての講師情報を管理可能
CREATE POLICY "Admins can manage all instructors" ON instructors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

-- =====================================================
-- 2. profiles テーブルの user_type 拡張
-- =====================================================
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS profiles_user_type_check;
  
ALTER TABLE profiles 
  ADD CONSTRAINT profiles_user_type_check 
    CHECK (user_type IN ('student', 'company', 'specialist', 'admin', 'instructor'));

-- =====================================================
-- 3. course_curriculums テーブルの拡張
-- =====================================================

-- 作成者ID（誰がこのカリキュラムを作成したか）
ALTER TABLE course_curriculums ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- 講師ID（コースを担当する講師）
ALTER TABLE course_curriculums ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES instructors(id);

-- 組織ID（企業によるコース作成の場合）
ALTER TABLE course_curriculums ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- 公式コースフラグ
ALTER TABLE course_curriculums ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT FALSE;

-- =====================================================
-- 4. course_lessons テーブルの拡張
-- =====================================================

-- 作成者ID
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- =====================================================
-- 5. 講師・企業によるコース作成権限のRLS
-- =====================================================

-- 承認済み講師は自分のコースを管理可能
CREATE POLICY "Approved instructors can manage own curriculums" ON course_curriculums
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM instructors 
      WHERE instructors.id = course_curriculums.instructor_id 
      AND instructors.user_id = auth.uid()
      AND instructors.status = 'approved'
    )
  );

-- 承認済み企業は自社のコースを管理可能
CREATE POLICY "Approved organizations can manage own curriculums" ON course_curriculums
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_members.organization_id = course_curriculums.organization_id 
      AND organization_members.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM organizations 
      WHERE organizations.id = course_curriculums.organization_id 
      AND organizations.status = 'approved'
    )
  );

-- レッスン作成権限も同様
CREATE POLICY "Course owners can manage lessons" ON course_lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM course_curriculums cc
      WHERE cc.id = course_lessons.curriculum_id
      AND (
        -- 管理者
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
        -- または講師
        OR EXISTS (
          SELECT 1 FROM instructors 
          WHERE instructors.id = cc.instructor_id 
          AND instructors.user_id = auth.uid()
          AND instructors.status = 'approved'
        )
        -- または企業メンバー
        OR EXISTS (
          SELECT 1 FROM organization_members 
          WHERE organization_members.organization_id = cc.organization_id 
          AND organization_members.user_id = auth.uid()
        )
      )
    )
  );

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_instructors_user_id ON instructors(user_id);
CREATE INDEX IF NOT EXISTS idx_instructors_status ON instructors(status);
CREATE INDEX IF NOT EXISTS idx_course_curriculums_instructor_id ON course_curriculums(instructor_id);
CREATE INDEX IF NOT EXISTS idx_course_curriculums_organization_id ON course_curriculums(organization_id);
