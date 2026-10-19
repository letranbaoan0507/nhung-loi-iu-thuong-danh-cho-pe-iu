-- Run in Supabase SQL Editor once. Private schema, not exposed through Data API.
CREATE SCHEMA IF NOT EXISTS loithuong;
REVOKE ALL ON SCHEMA loithuong FROM PUBLIC, anon, authenticated;
CREATE TABLE IF NOT EXISTS loithuong.gifts (
 id text PRIMARY KEY, owner_id text NOT NULL, title text NOT NULL,
 envelope text NOT NULL, revision integer NOT NULL DEFAULT 1,
 created_at text NOT NULL, updated_at text NOT NULL
);
CREATE TABLE IF NOT EXISTS loithuong.assets (
 id text PRIMARY KEY, owner_id text NOT NULL,
 gift_id text REFERENCES loithuong.gifts(id), storage_key text NOT NULL,
 mime text NOT NULL, bytes integer NOT NULL, created_at text NOT NULL
);
CREATE TABLE IF NOT EXISTS loithuong.upload_tickets (
 id text PRIMARY KEY, owner_id text NOT NULL, storage_key text NOT NULL,
 mime text NOT NULL, bytes integer NOT NULL, expires_at text NOT NULL,
 cancelled integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS gifts_owner_updated ON loithuong.gifts(owner_id,updated_at);
CREATE INDEX IF NOT EXISTS assets_owner ON loithuong.assets(owner_id);
CREATE INDEX IF NOT EXISTS assets_gift ON loithuong.assets(gift_id);
CREATE INDEX IF NOT EXISTS tickets_expiry ON loithuong.upload_tickets(owner_id,expires_at);
ALTER TABLE loithuong.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loithuong.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE loithuong.upload_tickets ENABLE ROW LEVEL SECURITY;
-- No public table policies. Only the trusted server DB role can query these tables.
INSERT INTO storage.buckets (id,name,public,file_size_limit)
VALUES ('loi-thuong','loi-thuong',false,12582944)
ON CONFLICT (id) DO UPDATE SET public=false,file_size_limit=12582944;
-- Do not add public Storage policies. Server issues scoped, expiring upload/download URLs.
