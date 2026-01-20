-- 既存のテーブルを削除してリセットする（データも消えます）
drop table if exists course_progress cascade;
drop table if exists view_logs cascade;
drop table if exists bookmarks cascade;
drop table if exists media_library cascade;
drop table if exists jobs cascade;
drop table if exists organization_members cascade;
drop table if exists organizations cascade;
-- profiles は auth.users と紐付いているため慎重に扱う必要がありますが、今回は再構築のためDropします
drop table if exists profiles cascade;
