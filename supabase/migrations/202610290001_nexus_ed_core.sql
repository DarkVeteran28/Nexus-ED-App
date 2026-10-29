-- Nexus-Ed core schema. Apply once to the intended Supabase project before using
-- the registration, enrollment, progress, or class chat workflows.
create extension if not exists pgcrypto;

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 160),
  code text not null unique check (code = upper(trim(code))),
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  full_name text not null check (length(trim(full_name)) between 2 and 160),
  roll_number integer not null check (roll_number > 0),
  unique_id text not null unique,
  class_id text not null check (length(trim(class_id)) between 1 and 80),
  guardian_email text,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  unique (school_id, class_id, roll_number)
);

create table if not exists public.school_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  role text not null check (role in ('student', 'teacher', 'parent', 'admin')),
  display_name text not null check (length(trim(display_name)) between 1 and 160),
  email text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.teacher_classes (
  teacher_id uuid not null references auth.users(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id text not null check (length(trim(class_id)) between 1 and 80),
  subject text not null check (length(trim(subject)) between 1 and 100),
  created_at timestamptz not null default now(),
  primary key (teacher_id, class_id, subject)
);

create table if not exists public.parent_students (
  parent_id uuid not null references auth.users(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (parent_id, student_id)
);

create table if not exists public.registration_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique check (code_hash ~ '^[0-9a-f]{64}$'),
  school_id uuid not null references public.schools(id) on delete cascade,
  role text not null check (role in ('student', 'parent', 'teacher')),
  linked_student_id uuid references public.students(id) on delete cascade,
  intended_email text,
  class_id text,
  subject text,
  expires_at timestamptz not null default (now() + interval '90 days'),
  max_uses integer not null default 1 check (max_uses > 0),
  use_count integer not null default 0 check (use_count >= 0 and use_count <= max_uses),
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  check (
    (role in ('student', 'parent') and linked_student_id is not null and intended_email is null)
    or (role = 'teacher' and linked_student_id is null and intended_email is not null and class_id is not null and subject is not null)
  )
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  subject text not null check (length(trim(subject)) between 1 and 100),
  score integer not null check (score between 0 and 100),
  timestamp timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null default auth.uid()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id text not null check (length(trim(class_id)) between 1 and 80),
  author_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  text text not null check (length(trim(text)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists students_school_class_idx on public.students(school_id, class_id);
create index if not exists assessments_student_timestamp_idx on public.assessments(student_id, timestamp);
create index if not exists messages_school_class_created_idx on public.messages(school_id, class_id, created_at);
create index if not exists registration_codes_school_role_idx on public.registration_codes(school_id, role, is_active);
create index if not exists parent_students_student_idx on public.parent_students(student_id);

create or replace function public.current_role()
returns text language sql stable security definer set search_path = public, auth
as $$
  select role from public.school_members where user_id = auth.uid() and is_active limit 1
$$;

create or replace function public.current_school_id()
returns uuid language sql stable security definer set search_path = public, auth
as $$
  select school_id from public.school_members where user_id = auth.uid() and is_active limit 1
$$;

create or replace function public.current_student_id()
returns uuid language sql stable security definer set search_path = public, auth
as $$
  select id from public.students where auth_user_id = auth.uid() limit 1
$$;

create or replace function public.can_access_student(target_student_id uuid)
returns boolean language sql stable security definer set search_path = public, auth
as $$
  select exists (
    select 1 from public.students s
    where s.id = target_student_id
      and s.school_id = public.current_school_id()
      and (
        (public.current_role() = 'admin')
        or (public.current_role() = 'student' and s.auth_user_id = auth.uid())
        or (public.current_role() = 'parent' and exists (
          select 1 from public.parent_students ps where ps.parent_id = auth.uid() and ps.student_id = s.id
        ))
        or (public.current_role() = 'teacher' and exists (
          select 1 from public.teacher_classes tc
          where tc.teacher_id = auth.uid() and tc.school_id = s.school_id and tc.class_id = s.class_id
        ))
      )
  )
$$;

create or replace function public.can_access_class(target_class_id text)
returns boolean language sql stable security definer set search_path = public, auth
as $$
  select case public.current_role()
    when 'admin' then exists (select 1 from public.school_members m where m.user_id = auth.uid() and m.school_id = public.current_school_id() and m.is_active)
    when 'teacher' then exists (select 1 from public.teacher_classes tc where tc.teacher_id = auth.uid() and tc.school_id = public.current_school_id() and tc.class_id = target_class_id)
    when 'student' then exists (select 1 from public.students s where s.auth_user_id = auth.uid() and s.school_id = public.current_school_id() and s.class_id = target_class_id)
    when 'parent' then exists (
      select 1 from public.parent_students ps join public.students s on s.id = ps.student_id
      where ps.parent_id = auth.uid() and ps.school_id = public.current_school_id() and s.class_id = target_class_id
    )
    else false
  end
$$;

create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public, auth
as $$
declare
  requested_role text := new.raw_app_meta_data ->> 'role';
  requested_school uuid := nullif(new.raw_app_meta_data ->> 'school_id', '')::uuid;
  requested_name text := coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), new.email);
begin
  if requested_role in ('student', 'teacher', 'parent', 'admin') and requested_school is not null then
    insert into public.school_members(user_id, school_id, role, display_name, email)
    values (new.id, requested_school, requested_role, requested_name, coalesce(new.email, ''));
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_nexus_ed on auth.users;
create trigger on_auth_user_created_nexus_ed
after insert on auth.users for each row execute function public.handle_new_auth_user();

create or replace function public.complete_account_registration(
  p_code_hash text,
  p_role text,
  p_user_id uuid,
  p_email text,
  p_student_id uuid default null
)
returns void language plpgsql security definer set search_path = public, auth
as $$
declare
  invitation public.registration_codes%rowtype;
  learner public.students%rowtype;
begin
  select * into invitation from public.registration_codes
  where code_hash = p_code_hash and role = p_role and is_active
    and expires_at > now() and use_count < max_uses
  for update;
  if not found then raise exception 'Registration code is invalid, expired, or already used'; end if;

  if p_role in ('student', 'parent') then
    if invitation.linked_student_id is null or invitation.linked_student_id <> p_student_id then
      raise exception 'Registration code does not match this student';
    end if;
    select * into learner from public.students where id = p_student_id and school_id = invitation.school_id for update;
    if not found then raise exception 'Student record was not found'; end if;
    if p_role = 'student' then
      if learner.auth_user_id is not null then raise exception 'Student account is already activated'; end if;
      update public.students set auth_user_id = p_user_id where id = learner.id;
    else
      if learner.guardian_email is null or lower(learner.guardian_email) <> lower(p_email) then
        raise exception 'Email does not match the guardian contact on file';
      end if;
      insert into public.parent_students(parent_id, school_id, student_id)
      values (p_user_id, invitation.school_id, learner.id);
    end if;
  elsif p_role = 'teacher' then
    if lower(coalesce(invitation.intended_email, '')) <> lower(p_email) then
      raise exception 'Email does not match the teacher invitation';
    end if;
    insert into public.teacher_classes(teacher_id, school_id, class_id, subject)
    values (p_user_id, invitation.school_id, invitation.class_id, invitation.subject)
    on conflict do nothing;
  end if;

  update public.registration_codes set use_count = use_count + 1 where id = invitation.id;
end;
$$;

alter table public.schools enable row level security;
alter table public.students enable row level security;
alter table public.school_members enable row level security;
alter table public.teacher_classes enable row level security;
alter table public.parent_students enable row level security;
alter table public.registration_codes enable row level security;
alter table public.assessments enable row level security;
alter table public.messages enable row level security;

drop policy if exists schools_read_member on public.schools;
create policy schools_read_member on public.schools for select to authenticated using (id = public.current_school_id());

drop policy if exists members_read_self_or_admin on public.school_members;
create policy members_read_self_or_admin on public.school_members for select to authenticated
using (user_id = auth.uid() or (public.current_role() = 'admin' and school_id = public.current_school_id()));

drop policy if exists students_read_authorized on public.students;
create policy students_read_authorized on public.students for select to authenticated using (public.can_access_student(id));
drop policy if exists students_insert_staff on public.students;
create policy students_insert_staff on public.students for insert to authenticated
with check (
  school_id = public.current_school_id()
  and public.current_role() in ('admin', 'teacher')
  and (public.current_role() = 'admin' or public.can_access_class(class_id))
);
drop policy if exists students_update_staff on public.students;
create policy students_update_staff on public.students for update to authenticated
using (school_id = public.current_school_id() and public.current_role() in ('admin', 'teacher') and (public.current_role() = 'admin' or public.can_access_class(class_id)))
with check (school_id = public.current_school_id() and public.current_role() in ('admin', 'teacher') and (public.current_role() = 'admin' or public.can_access_class(class_id)));
drop policy if exists students_delete_admin on public.students;
create policy students_delete_admin on public.students for delete to authenticated using (school_id = public.current_school_id() and public.current_role() = 'admin');

drop policy if exists teacher_classes_read_self_or_admin on public.teacher_classes;
create policy teacher_classes_read_self_or_admin on public.teacher_classes for select to authenticated
using (teacher_id = auth.uid() or (public.current_role() = 'admin' and school_id = public.current_school_id()));
drop policy if exists teacher_classes_admin_manage on public.teacher_classes;
create policy teacher_classes_admin_manage on public.teacher_classes for all to authenticated
using (public.current_role() = 'admin' and school_id = public.current_school_id())
with check (public.current_role() = 'admin' and school_id = public.current_school_id());

drop policy if exists parent_students_read_self_or_admin on public.parent_students;
create policy parent_students_read_self_or_admin on public.parent_students for select to authenticated
using (parent_id = auth.uid() or (public.current_role() = 'admin' and school_id = public.current_school_id()));

drop policy if exists registration_codes_insert_staff on public.registration_codes;
create policy registration_codes_insert_staff on public.registration_codes for insert to authenticated
with check (
  school_id = public.current_school_id()
  and (
    (public.current_role() = 'admin')
    or (public.current_role() = 'teacher' and role in ('student', 'parent') and linked_student_id is not null and public.can_access_student(linked_student_id))
  )
);
drop policy if exists registration_codes_admin_manage on public.registration_codes;
create policy registration_codes_admin_manage on public.registration_codes for update to authenticated
using (public.current_role() = 'admin' and school_id = public.current_school_id())
with check (public.current_role() = 'admin' and school_id = public.current_school_id());

drop policy if exists assessments_read_authorized on public.assessments;
create policy assessments_read_authorized on public.assessments for select to authenticated using (public.can_access_student(student_id));
drop policy if exists assessments_insert_staff on public.assessments;
create policy assessments_insert_staff on public.assessments for insert to authenticated
with check (public.current_role() in ('admin', 'teacher') and public.can_access_student(student_id));
drop policy if exists assessments_update_staff on public.assessments;
create policy assessments_update_staff on public.assessments for update to authenticated
using (public.current_role() in ('admin', 'teacher') and public.can_access_student(student_id))
with check (public.current_role() in ('admin', 'teacher') and public.can_access_student(student_id));
drop policy if exists assessments_delete_admin on public.assessments;
create policy assessments_delete_admin on public.assessments for delete to authenticated
using (public.current_role() = 'admin' and public.can_access_student(student_id));

drop policy if exists messages_read_class_member on public.messages;
create policy messages_read_class_member on public.messages for select to authenticated
using (school_id = public.current_school_id() and public.can_access_class(class_id));
drop policy if exists messages_insert_class_member on public.messages;
create policy messages_insert_class_member on public.messages for insert to authenticated
with check (school_id = public.current_school_id() and author_id = auth.uid() and public.can_access_class(class_id));

revoke all on function public.complete_account_registration(text, text, uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.complete_account_registration(text, text, uuid, text, uuid) to service_role;
grant execute on function public.current_role() to authenticated, service_role;
grant execute on function public.current_school_id() to authenticated, service_role;
grant execute on function public.current_student_id() to authenticated, service_role;
grant execute on function public.can_access_student(uuid) to authenticated, service_role;
grant execute on function public.can_access_class(text) to authenticated, service_role;

grant select on public.schools, public.school_members, public.students, public.teacher_classes, public.parent_students, public.assessments, public.messages to authenticated;
grant insert, update, delete on public.students, public.assessments to authenticated;
grant insert on public.messages to authenticated;
grant insert, update on public.registration_codes to authenticated;
grant insert, update, delete on public.teacher_classes to authenticated;
grant all on all tables in schema public to service_role;
