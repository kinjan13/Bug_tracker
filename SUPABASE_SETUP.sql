-- ============================================================================
-- BUG TRACKER DATABASE SETUP - Run all SQL in Supabase SQL Editor
-- ============================================================================

-- STEP 1: USERS TABLE
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

create policy "Users can view all users"
on users for select
using (true);

create policy "Users can insert own profile"
on users for insert
with check (auth.uid() = id);

create policy "Users can update own profile"
on users for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- ============================================================================
-- STEP 2: PROJECTS TABLE
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

create policy "Users can create projects"
on projects for insert
with check (auth.uid() = owner_id);

create policy "Only owner can update project"
on projects for update
using (auth.uid() = owner_id);

create policy "Only owner can delete project"
on projects for delete
using (auth.uid() = owner_id);

-- ============================================================================
-- STEP 3: PROJECT_MEMBERS TABLE
create table project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role varchar(50) default 'developer',
  joined_at timestamp default now(),
  unique (project_id, user_id)
);

alter table project_members enable row level security;

create policy "Users can view project members"
on project_members for select
using (
  auth.uid() in (
    select user_id
    from project_members
    where project_id = project_members.project_id
  )
);

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

-- ============================================================================
-- STEP 4: ISSUES TABLE
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

create policy "Project members can view issues"
on issues for select
using (
  auth.uid() in (
    select user_id
    from project_members
    where project_id = issues.project_id
  )
);

create policy "Project members can create issues"
on issues for insert
with check (
  auth.uid() in (
    select user_id
    from project_members
    where project_id = issues.project_id
  )
);

create policy "Project members can update issues"
on issues for update
using (
  auth.uid() in (
    select user_id
    from project_members
    where project_id = issues.project_id
  )
);

create policy "Reporter can delete issue"
on issues for delete
using (auth.uid() = reporter_id);

-- ============================================================================
-- STEP 5: COMMENTS TABLE
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

create policy "Authors can update comments"
on comments for update
using (auth.uid() = author_id);

create policy "Authors can delete comments"
on comments for delete
using (auth.uid() = author_id);

-- ============================================================================
-- STEP 6: ATTACHMENTS TABLE
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

-- ============================================================================
-- STEP 7: ACTIVITY LOGS TABLE
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

-- ============================================================================
-- STEP 8: OPTIONAL - CREATE STORAGE BUCKET FOR ATTACHMENTS
-- Run these in the SQL Editor if you want file uploads:

-- insert into storage.buckets (id, name, public) values ('issue-attachments', 'issue-attachments', true);
--
-- create policy "Allow authenticated uploads" on storage.objects
-- for insert to authenticated
-- with check (bucket_id = 'issue-attachments');
--
-- create policy "Allow public read" on storage.objects
-- for select using (bucket_id = 'issue-attachments');

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Copy all SQL above and run in Supabase → SQL Editor
-- 2. Enable Email authentication in Supabase → Authentication → Providers
-- 3. Create a test user (sign up via your app or use Supabase UI)
-- 4. Insert user profile into `users` table with their Auth UID:
--
--    insert into users (id, email, full_name)
--    values ('<USER_AUTH_UID>'::uuid, 'test@example.com', 'Test User');
--
-- 5. Test RLS by logging in and verifying data access
