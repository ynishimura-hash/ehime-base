-- =====================================================
-- 監査ログ・論理削除マイグレーション
-- ソフトデリート、監査ログテーブル
-- =====================================================

-- =====================================================
-- 1. 論理削除カラムの追加
-- =====================================================

-- messages テーブル
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES profiles(id);

-- course_curriculums テーブル
ALTER TABLE course_curriculums ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE course_curriculums ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES profiles(id);

-- course_lessons テーブル
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES profiles(id);

-- =====================================================
-- 2. 監査ログテーブルの作成
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'restore', 'approve', 'reject')),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  description TEXT, -- 操作の説明
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS有効化
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 管理者のみ監査ログを閲覧可能
CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

-- システムは監査ログを作成可能（service_role経由）
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- 3. 削除されたデータを表示しないようにRLSを更新
-- =====================================================

-- coursesテーブルの削除フラグを追加
ALTER TABLE courses ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES profiles(id);

-- 既存のポリシーを更新（削除されたものは表示しない）
DROP POLICY IF EXISTS "Curriculums are viewable by everyone." ON course_curriculums;
CREATE POLICY "Curriculums are viewable by everyone (not deleted)" ON course_curriculums
  FOR SELECT USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Lessons are viewable by everyone." ON course_lessons;
CREATE POLICY "Lessons are viewable by everyone (not deleted)" ON course_lessons
  FOR SELECT USING (deleted_at IS NULL);

-- =====================================================
-- 4. 管理者向け: 削除済みデータ閲覧ポリシー
-- =====================================================

-- 管理者は削除済みカリキュラムも閲覧可能
CREATE POLICY "Admins can view all curriculums including deleted" ON course_curriculums
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

-- 管理者は削除済みレッスンも閲覧可能
CREATE POLICY "Admins can view all lessons including deleted" ON course_lessons
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

-- 管理者は削除済みメッセージも閲覧可能
CREATE POLICY "Admins can view all messages including deleted" ON messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

-- =====================================================
-- 5. インデックス
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_deleted_at ON messages(deleted_at);
CREATE INDEX IF NOT EXISTS idx_course_curriculums_deleted_at ON course_curriculums(deleted_at);
CREATE INDEX IF NOT EXISTS idx_course_lessons_deleted_at ON course_lessons(deleted_at);
