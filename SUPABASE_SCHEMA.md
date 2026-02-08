# Supabase Database Schema for Bug Tracker

## Overview
Complete database schema for the bug tracker application. Create all tables in your Supabase project.

---

## 1. **Users Table**
Stores user account information. Supabase Auth will handle authentication.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'developer', -- 'admin', 'manager', 'developer', 'viewer'
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all users
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (
    -- If you store the Auth user id in `auth_id` (UUID), compare by casting `auth.uid()` to UUID:
    auth.uid()::uuid = auth_id
  );

-- Alternate: if your `users.id` column stores the Auth user id (common pattern), use this instead:
-- CREATE POLICY "Users can update own profile" ON users
--   FOR UPDATE
--   USING (auth.uid()::uuid = id);

-- Note: If you see "column does not exist" errors, confirm which column holds the Auth user id
-- in your actual database (`auth_id` vs `id`) and run the corresponding CREATE TABLE block before
-- creating policies. Also ensure types match (cast `auth.uid()` to UUID when comparing to UUID columns).
```

---

## 2. **Projects Table**
Store project information and metadata.

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  key VARCHAR(10) NOT NULL UNIQUE, -- Project key like "BT" for Bug Tracker
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'archived'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view projects they're members of
CREATE POLICY "Users can view their projects" ON projects 
FOR SELECT USING (
  auth.uid() IN (
    SELECT pm.user_id FROM project_members pm WHERE pm.project_id = projects.id
  ) OR owner_id = auth.uid()
);

-- Policy: Only owner can update
CREATE POLICY "Only owner can update project" ON projects 
FOR UPDATE USING (owner_id = auth.uid());

-- Policy: Only owner can delete
CREATE POLICY "Only owner can delete project" ON projects 
FOR DELETE USING (owner_id = auth.uid());

-- Policy: Authenticated users can create
CREATE POLICY "Authenticated users can create projects" ON projects 
FOR INSERT WITH CHECK (auth.uid() = owner_id);
```

---

## 3. **Project Members Table**
Tracks which users are members of which projects and their roles.

```sql
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'developer', -- 'admin', 'manager', 'developer', 'viewer'
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Enable RLS
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view members of their projects
CREATE POLICY "Users can view project members" ON project_members 
FOR SELECT USING (
  auth.uid() IN (
    SELECT pm.user_id FROM project_members pm WHERE pm.project_id = project_members.project_id
  )
);

-- Policy: Project admin can manage members
CREATE POLICY "Project admin can manage members" ON project_members 
FOR ALL USING (
  auth.uid() IN (
    SELECT pm.user_id FROM project_members pm 
    WHERE pm.project_id = project_members.project_id AND pm.role = 'admin'
  )
);
```

---

## 4. **Issues/Tickets Table**
Main table for bugs and feature requests.

```sql
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  issue_type VARCHAR(50) NOT NULL, -- 'bug', 'feature', 'task', 'improvement'
  status VARCHAR(50) DEFAULT 'todo', -- 'todo', 'in_progress', 'in_review', 'done'
  priority VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  due_date DATE,
  estimated_hours INT,
);
);

-- Create indexes for better query performance
CREATE INDEX idx_issues_project_id ON issues(project_id);
CREATE INDEX idx_issues_assignee_id ON issues(assignee_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_priority ON issues(priority);

-- Enable RLS
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Policy: Members can view issues in their projects
CREATE POLICY "Project members can view issues" ON issues 
FOR SELECT USING (
  auth.uid() IN (
    SELECT pm.user_id FROM project_members pm WHERE pm.project_id = issues.project_id
  )
);

-- Policy: Project members can create issues
CREATE POLICY "Project members can create issues" ON issues 
FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT pm.user_id FROM project_members pm WHERE pm.project_id = issues.project_id
  )
);

-- Policy: Members can update issues
CREATE POLICY "Project members can update issues" ON issues 
FOR UPDATE USING (
  auth.uid() IN (
    SELECT pm.user_id FROM project_members pm WHERE pm.project_id = issues.project_id
  )
);

-- Policy: Reporters and assignees can delete
CREATE POLICY "Reporters can delete issues" ON issues 
FOR DELETE USING (reporter_id = auth.uid());
```

---

## 5. **Comments Table**
Store comments/discussions on issues.

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
);
);

-- Create indexes for better query performance
CREATE INDEX idx_comments_issue_id ON comments(issue_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy: Project members can view comments
CREATE POLICY "Project members can view comments" ON comments 
FOR SELECT USING (
  auth.uid() IN (
    SELECT pm.user_id FROM project_members pm 
    WHERE pm.project_id = (SELECT project_id FROM issues WHERE id = comments.issue_id)
  )
);

-- Policy: Members can create comments
CREATE POLICY "Project members can create comments" ON comments 
FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT pm.user_id FROM project_members pm 
    WHERE pm.project_id = (SELECT project_id FROM issues WHERE id = comments.issue_id)
  )
);

-- Policy: Authors can update their comments
CREATE POLICY "Authors can update comments" ON comments 
FOR UPDATE USING (author_id = auth.uid());

-- Policy: Authors can delete their comments
CREATE POLICY "Authors can delete comments" ON comments 
FOR DELETE USING (author_id = auth.uid());
```

---

## 6. **Attachments Table**
Store file attachments for issues (screenshots, documents, etc.).

```sql
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size INT,
  file_type VARCHAR(100),
  file_url TEXT NOT NULL,
  storage_path TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
);
);

-- Create index for better query performance
CREATE INDEX idx_attachments_issue_id ON attachments(issue_id);

-- Enable RLS
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

# Supabase Database Schema for Bug Tracker

## Overview
Complete database schema for the bug tracker application. Create all tables in your Supabase project.

---

## 1. USERS TABLE (FINAL)
```sql
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email varchar(255) not null unique,
  full_name varchar(255),
  avatar_url text,
  role varchar(50) default 'developer',
  status varchar(50) default 'active',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table users enable row level security;

-- Read all users (needed for assignees, mentions, etc.)
create policy "Users can view all users"
on users for select
using (true);

-- Insert own profile
create policy "Users can insert own profile"
on users for insert
with check (auth.uid() = id);

-- Update own profile
create policy "Users can update own profile"
on users for update
using (auth.uid() = id)
with check (auth.uid() = id);
```

---

## 2. PROJECTS TABLE (FINAL)
```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  name varchar(255) not null,
  description text,
  key varchar(10) not null unique,
  owner_id uuid not null references users(id) on delete cascade,
  status varchar(50) default 'active',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table projects enable row level security;

-- View own or member projects
create policy "Users can view their projects"
on projects for select
using (
  auth.uid() = owner_id
  or auth.uid() in (
    select user_id
    from project_members
    where project_id = projects.id
  )
);

-- Create project
create policy "Users can create projects"
on projects for insert
with check (auth.uid() = owner_id);

-- Update project
create policy "Only owner can update project"
on projects for update
using (auth.uid() = owner_id);

-- Delete project
create policy "Only owner can delete project"
on projects for delete
using (auth.uid() = owner_id);
```

---

## 3. PROJECT_MEMBERS TABLE (FINAL)
```sql
create table project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role varchar(50) default 'developer',
  joined_at timestamp default now(),
  unique (project_id, user_id)
);

alter table project_members enable row level security;

-- View members
create policy "Users can view project members"
on project_members for select
using (
  auth.uid() in (
    select user_id
    from project_members
    where project_id = project_members.project_id
  )
);

-- Admin manage members
create policy "Project admin can manage members"
on project_members for all
using (
  auth.uid() in (
    select user_id
    from project_members
    where project_id = project_members.project_id
      and role = 'admin'
  )
);
```

---

## 4. ISSUES TABLE (FINAL)
```sql
create table issues (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title varchar(500) not null,
  description text,
  issue_type varchar(50) not null,
  status varchar(50) default 'todo',
  priority varchar(50) default 'medium',
  reporter_id uuid not null references users(id) on delete cascade,
  assignee_id uuid references users(id) on delete set null,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  due_date date,
  estimated_hours int
);

create index idx_issues_project_id on issues(project_id);
create index idx_issues_assignee_id on issues(assignee_id);
create index idx_issues_status on issues(status);
create index idx_issues_priority on issues(priority);

alter table issues enable row level security;

-- View issues
create policy "Project members can view issues"
on issues for select
using (
  auth.uid() in (
    select user_id
    from project_members
    where project_id = issues.project_id
  )
);

-- Create issue
create policy "Project members can create issues"
on issues for insert
with check (
  auth.uid() in (
    select user_id
    from project_members
    where project_id = issues.project_id
  )
);

-- Update issue
create policy "Project members can update issues"
on issues for update
using (
  auth.uid() in (
    select user_id
    from project_members
    where project_id = issues.project_id
  )
);

-- Delete issue (reporter only)
create policy "Reporter can delete issue"
on issues for delete
using (auth.uid() = reporter_id);
```

---

## 5. COMMENTS TABLE (FINAL)
```sql
create table comments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references issues(id) on delete cascade,
  author_id uuid not null references users(id) on delete cascade,
  content text not null,
  parent_comment_id uuid references comments(id) on delete cascade,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create index idx_comments_issue_id on comments(issue_id);
create index idx_comments_author_id on comments(author_id);

alter table comments enable row level security;

-- View comments
create policy "Project members can view comments"
on comments for select
using (
  auth.uid() in (
    select user_id
    from project_members
    where project_id = (
      select project_id from issues where id = comments.issue_id
    )
  )
);

-- Create comments
create policy "Project members can create comments"
on comments for insert
with check (
  auth.uid() in (
    select user_id
    from project_members
    where project_id = (
      select project_id from issues where id = comments.issue_id
    )
  )
);

-- Update own comment
create policy "Authors can update comments"
on comments for update
using (auth.uid() = author_id);

-- Delete own comment
create policy "Authors can delete comments"
on comments for delete
using (auth.uid() = author_id);
```

---

## 6. ATTACHMENTS TABLE (FINAL)
```sql
create table attachments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references issues(id) on delete cascade,
  uploaded_by uuid not null references users(id) on delete cascade,
  file_name varchar(255) not null,
  file_size int,
  file_type varchar(100),
  file_url text not null,
  storage_path text,
  created_at timestamp default now()
);

create index idx_attachments_issue_id on attachments(issue_id);

alter table attachments enable row level security;

-- View attachments
create policy "Project members can view attachments"
on attachments for select
using (
  auth.uid() in (
    select user_id
    from project_members
    where project_id = (
      select project_id from issues where id = attachments.issue_id
    )
  )
);

-- Upload attachments
create policy "Project members can upload attachments"
on attachments for insert
with check (
  auth.uid() in (
    select user_id
    from project_members
    where project_id = (
      select project_id from issues where id = attachments.issue_id
    )
  )
);
```

---

## 7. ACTIVITY LOGS TABLE (FINAL)
```sql
create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references issues(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  action varchar(100) not null,
  previous_value text,
  new_value text,
  field_changed varchar(100),
  created_at timestamp default now()
);

create index idx_activity_logs_issue_id on activity_logs(issue_id);
create index idx_activity_logs_user_id on activity_logs(user_id);

alter table activity_logs enable row level security;

-- View logs
create policy "Project members can view activity logs"
on activity_logs for select
using (
  auth.uid() in (
    select user_id
    from project_members
    where project_id = (
      select project_id from issues where id = activity_logs.issue_id
    )
  )
);
```

---

## Next steps after adding the tables

- Open the Supabase project SQL Editor and run the contents of this file as a single script (tables, indexes, then policies).
- If you get "permission denied" errors when creating policies, ensure you are running as the service_role key or use the Supabase SQL editor (web UI runs with sufficient privileges).
- Create a storage bucket for attachments and add the two policies below if you want public access:

```sql
insert into storage.buckets (id, name, public) values ('issue-attachments', 'issue-attachments', true);

-- Allow authenticated uploads
create policy "Allow authenticated uploads" on storage.objects
for insert to authenticated
with check (bucket_id = 'issue-attachments');

-- Allow public read
create policy "Allow public read" on storage.objects
for select using (bucket_id = 'issue-attachments');
```

- Configure Authentication: enable Email provider in Supabase Auth, then sign up a test user through the app or Supabase UI.
- After a user signs up, insert their profile into users linking id to auth.uid() (the recommended approach):

```sql
-- Example (run after the user signs up, replace <USER_UID> and fields):
insert into users (id, email, full_name)
values ('<USER_UID>'::uuid, 'alice@example.com', 'Alice');
```

- Test RLS: log in as the test user in your app and verify they can read/update their profile and cannot modify others.
- Optional: create a small seed script to create a demo project, members, and sample issues.

If you want, I can:
- add a ready-to-run seed SQL file that creates an admin user, project, and sample data, or
- generate a short step-by-step checklist for running and testing RLS in Supabase.
