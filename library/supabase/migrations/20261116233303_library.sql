-- 日南書架借還書系統：資料表、權限規則、借還書函式
-- 原則：
--   1. 所有資料表都開啟列級權限（RLS），預設誰都讀不到。
--   2. 寫入一律透過下方的函式（RPC），函式內檢查身分、規則並寫稽核紀錄；
--      一般登入者沒有任何資料表的直接寫入權。
--   3. 會員只讀得到自己的那一筆會員資料與自己的借閱紀錄。
--   4. 電話欄位不對外開放，只能透過 reveal_phone() 讀取，且每次都留稽核紀錄。

-- ---------------------------------------------------------------- 清掉 Supabase 預設給的寬鬆權限
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

-- ---------------------------------------------------------------- 資料表
create type public.staff_role as enum ('staff', 'director');

create table public.staff (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  email        text not null,
  role         public.staff_role not null default 'staff',
  created_at   timestamptz not null default now()
);

create table public.settings (
  id            int primary key default 1 check (id = 1),
  library_name  text not null default '日南書架',
  loan_days     int  not null default 14 check (loan_days between 1 and 120),
  max_loans     int  not null default 3  check (max_loans between 1 and 50),
  updated_at    timestamptz not null default now()
);
insert into public.settings (id) values (1);

create sequence public.book_code_seq start 117;

create table public.books (
  code        text primary key,
  title       text not null check (length(title) between 1 and 200),
  subtitle    text not null default '',
  author      text not null default '',
  publisher   text not null default '',
  category    text not null default '',
  location    text not null default '',
  planted     text not null default '',
  isbn        text unique check (isbn is null or isbn ~ '^[0-9]{9}[0-9X]$|^[0-9]{13}$'),
  created_at  timestamptz not null default now()
);

create table public.card_counters (
  year  int primary key,
  n     int not null default 0
);

create table public.members (
  card_no       text primary key,
  name          text not null check (length(name) between 1 and 60),
  email         text unique check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone         text not null default '',
  phone_masked  text generated always as (
                  case when length(phone) >= 7
                       then left(phone, 4) || repeat('*', length(phone) - 7) || right(phone, 3)
                       when phone = '' then ''
                       else repeat('*', length(phone)) end) stored,
  note          text not null default '',
  user_id       uuid unique references auth.users (id) on delete set null,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

create table public.loans (
  id           bigint generated always as identity primary key,
  book_code    text not null references public.books (code),
  card_no      text not null references public.members (card_no),
  out_at       timestamptz not null default now(),
  due_at       timestamptz not null,
  returned_at  timestamptz,
  out_by       uuid,
  in_by        uuid
);
create unique index loans_one_open_per_book on public.loans (book_code) where returned_at is null;
create index loans_card on public.loans (card_no, out_at desc);

create table public.audit_log (
  id      bigint generated always as identity primary key,
  at      timestamptz not null default now(),
  actor   uuid,
  action  text not null,
  target  text not null default '',
  detail  jsonb not null default '{}'::jsonb
);
create index audit_at on public.audit_log (at desc);

alter table public.staff         enable row level security;
alter table public.settings      enable row level security;
alter table public.books         enable row level security;
alter table public.card_counters enable row level security;
alter table public.members       enable row level security;
alter table public.loans         enable row level security;
alter table public.audit_log     enable row level security;

-- ---------------------------------------------------------------- 身分判斷（security definer：可查 staff/members，不受 RLS 遞迴影響）
create function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff where user_id = auth.uid());
$$;

create function public.is_director() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff where user_id = auth.uid() and role = 'director');
$$;

create function public.my_card() returns text
language sql stable security definer set search_path = public as $$
  select card_no from public.members where user_id = auth.uid() and active;
$$;

create function public.log(p_action text, p_target text, p_detail jsonb default '{}'::jsonb) returns void
language sql security definer set search_path = public as $$
  insert into public.audit_log (actor, action, target, detail) values (auth.uid(), p_action, coalesce(p_target, ''), coalesce(p_detail, '{}'::jsonb));
$$;

-- ---------------------------------------------------------------- 讀取規則
-- 館藏：登入者都能看書目（不含任何個資）
create policy books_read on public.books for select to authenticated using (true);

-- 設定：登入者都能讀（借期、本數上限、館名）
create policy settings_read on public.settings for select to authenticated using (true);

-- 職員名單：館長看全部，職員只看到自己
create policy staff_read on public.staff for select to authenticated
  using (public.is_director() or user_id = auth.uid());

-- 會員：職員看全部；會員只看自己那一筆
create policy members_read on public.members for select to authenticated
  using (public.is_staff() or user_id = auth.uid());

-- 借閱：職員看全部；會員只看自己的
create policy loans_read on public.loans for select to authenticated
  using (public.is_staff() or card_no = public.my_card());

-- 稽核紀錄：只有館長
create policy audit_read on public.audit_log for select to authenticated
  using (public.is_director());

-- 欄位層級：電話原文不開放直接讀取（只有 phone_masked）
grant select on public.books, public.settings, public.staff, public.loans, public.audit_log to authenticated;
grant select (card_no, name, email, phone_masked, note, user_id, active, created_at) on public.members to authenticated;
-- anon（未登入）沒有任何資料表權限。

-- ---------------------------------------------------------------- 共用：目前身分
create function public.whoami() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'role', case when exists (select 1 from staff where user_id = auth.uid() and role = 'director') then 'director'
                 when exists (select 1 from staff where user_id = auth.uid()) then 'staff'
                 when exists (select 1 from members where user_id = auth.uid() and active) then 'member'
                 else 'none' end,
    'card_no', (select card_no from members where user_id = auth.uid() and active),
    'email', auth.jwt() ->> 'email');
$$;

-- 會員第一次登入：用已驗證的 email 認領行政人員建好的借書證
create function public.claim_membership() returns text
language plpgsql security definer set search_path = public as $$
declare v_email text := lower(auth.jwt() ->> 'email'); v_card text;
begin
  if auth.uid() is null or v_email is null then return null; end if;
  select card_no into v_card from members where user_id = auth.uid();
  if v_card is not null then return v_card; end if;
  update members set user_id = auth.uid()
   where lower(email) = v_email and user_id is null and active
   returning card_no into v_card;
  if v_card is not null then perform log('member.claim', v_card); end if;
  return v_card;
end $$;

-- ---------------------------------------------------------------- 會員管理（職員）
create function public.create_member(p_name text, p_email text default null, p_phone text default '', p_note text default '')
returns text
language plpgsql security definer set search_path = public as $$
declare v_year int := extract(year from now() at time zone 'Asia/Taipei'); v_n int; v_card text;
        v_email text := nullif(lower(trim(coalesce(p_email, ''))), '');
begin
  if not is_staff() then raise exception '沒有權限' using errcode = '42501'; end if;
  if coalesce(trim(p_name), '') = '' then raise exception '請填姓名' using errcode = '22023'; end if;
  if v_email is not null and exists (select 1 from members where lower(email) = v_email) then
    raise exception '這個 email 已經辦過借書證' using errcode = '23505'; end if;
  insert into card_counters (year, n) values (v_year, 1)
    on conflict (year) do update set n = card_counters.n + 1
    returning n into v_n;
  v_card := 'RN' || lpad((v_year % 100)::text, 2, '0') || '-' || lpad(v_n::text, 4, '0');
  insert into members (card_no, name, email, phone, note)
    values (v_card, trim(p_name), v_email, trim(coalesce(p_phone, '')), trim(coalesce(p_note, '')));
  perform log('member.create', v_card, jsonb_build_object('name', trim(p_name)));
  return v_card;
end $$;

create function public.update_member(p_card text, p_name text, p_email text, p_phone text, p_note text, p_active boolean)
returns void
language plpgsql security definer set search_path = public as $$
declare v_email text := nullif(lower(trim(coalesce(p_email, ''))), '');
begin
  if not is_staff() then raise exception '沒有權限' using errcode = '42501'; end if;
  if coalesce(trim(p_name), '') = '' then raise exception '請填姓名' using errcode = '22023'; end if;
  update members set name = trim(p_name),
         -- email 改了就解除舊帳號綁定，讓新 email 重新認領
         user_id = case when email is distinct from v_email then null else user_id end,
         email = v_email, phone = trim(coalesce(p_phone, '')), note = trim(coalesce(p_note, '')),
         active = coalesce(p_active, true)
   where card_no = p_card;
  if not found then raise exception '找不到這張借書證' using errcode = 'P0002'; end if;
  perform log('member.update', p_card);
end $$;

-- 讀電話原文：職員可讀任何人（會留紀錄），會員可讀自己
create function public.reveal_phone(p_card text) returns text
language plpgsql security definer set search_path = public as $$
declare v_phone text;
begin
  if is_staff() then
    select phone into v_phone from members where card_no = p_card;
    perform log('member.reveal_phone', p_card);
    return v_phone;
  elsif p_card = my_card() then
    select phone into v_phone from members where card_no = p_card;
    return v_phone;
  end if;
  raise exception '沒有權限' using errcode = '42501';
end $$;

-- ---------------------------------------------------------------- 館藏管理（職員）
create function public.add_book(p_title text, p_author text default '', p_publisher text default '', p_isbn text default null,
                                p_category text default '', p_location text default '')
returns text
language plpgsql security definer set search_path = public as $$
declare v_code text; v_isbn text := nullif(upper(regexp_replace(coalesce(p_isbn, ''), '[^0-9Xx]', '', 'g')), '');
begin
  if not is_staff() then raise exception '沒有權限' using errcode = '42501'; end if;
  if coalesce(trim(p_title), '') = '' then raise exception '請填書名' using errcode = '22023'; end if;
  v_code := 'RNB-' || lpad(nextval('book_code_seq')::text, 4, '0');
  insert into books (code, title, author, publisher, isbn, category, location, planted)
    values (v_code, trim(p_title), trim(coalesce(p_author, '')), trim(coalesce(p_publisher, '')), v_isbn,
            trim(coalesce(p_category, '')), trim(coalesce(p_location, '')),
            to_char(now() at time zone 'Asia/Taipei', 'FMMM/FMDD'));
  perform log('book.add', v_code, jsonb_build_object('title', trim(p_title)));
  return v_code;
end $$;

create function public.set_book_isbn(p_code text, p_isbn text) returns void
language plpgsql security definer set search_path = public as $$
declare v_isbn text := nullif(upper(regexp_replace(coalesce(p_isbn, ''), '[^0-9Xx]', '', 'g')), '');
begin
  if not is_staff() then raise exception '沒有權限' using errcode = '42501'; end if;
  update books set isbn = v_isbn where code = p_code;
  if not found then raise exception '找不到這本書' using errcode = 'P0002'; end if;
  perform log('book.isbn', p_code, jsonb_build_object('isbn', v_isbn));
end $$;

-- ---------------------------------------------------------------- 借書、還書（職員）
-- 到期日 = 台北時間今天 + 借期天數，當天 23:59:59 截止
create function public.borrow_books(p_card text, p_codes text[]) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s settings; v_open int; v_due timestamptz; v_code text; v_done text[] := '{}';
begin
  if not is_staff() then raise exception '沒有權限' using errcode = '42501'; end if;
  select * into s from settings where id = 1;
  if not exists (select 1 from members where card_no = p_card and active) then
    raise exception '找不到這張借書證，或已停用' using errcode = 'P0002'; end if;
  if coalesce(array_length(p_codes, 1), 0) = 0 then raise exception '請選擇要借的書' using errcode = '22023'; end if;
  select count(*) into v_open from loans where card_no = p_card and returned_at is null;
  if v_open + array_length(p_codes, 1) > s.max_loans then
    raise exception '每人最多借 % 本，這位會員已借 % 本', s.max_loans, v_open using errcode = 'P0001'; end if;
  v_due := ((date_trunc('day', now() at time zone 'Asia/Taipei') + make_interval(days => s.loan_days + 1))
            at time zone 'Asia/Taipei') - interval '1 second';
  foreach v_code in array p_codes loop
    if not exists (select 1 from books where code = v_code) then
      raise exception '找不到館藏 %', v_code using errcode = 'P0002'; end if;
    if exists (select 1 from loans where book_code = v_code and returned_at is null) then
      raise exception '% 目前借出中', v_code using errcode = 'P0001'; end if;
    insert into loans (book_code, card_no, due_at, out_by) values (v_code, p_card, v_due, auth.uid());
    v_done := v_done || v_code;
  end loop;
  perform log('loan.borrow', p_card, jsonb_build_object('books', v_done, 'due_at', v_due));
  return jsonb_build_object('count', array_length(v_done, 1), 'due_at', v_due, 'at', now());
end $$;

create function public.return_book(p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_id bigint; v_card text;
begin
  if not is_staff() then raise exception '沒有權限' using errcode = '42501'; end if;
  update loans set returned_at = now(), in_by = auth.uid()
   where book_code = p_code and returned_at is null
   returning id, card_no into v_id, v_card;
  if v_id is null then raise exception '這本書沒有借出紀錄' using errcode = 'P0002'; end if;
  perform log('loan.return', v_card, jsonb_build_object('book', p_code));
  return jsonb_build_object('card_no', v_card, 'at', now());
end $$;

-- ---------------------------------------------------------------- 館長專用
-- 指派或移除職員。對方必須先用這個 email 登入過一次（帳號存在）。
create function public.set_staff_role(p_email text, p_role text) returns void
language plpgsql security definer set search_path = public, auth as $$
declare v_uid uuid; v_email text := lower(trim(p_email));
begin
  if not is_director() then raise exception '只有館長可以管理職員' using errcode = '42501'; end if;
  select id into v_uid from auth.users where lower(email) = v_email;
  if v_uid is null then raise exception '這個 email 還沒登入過，請對方先登入一次' using errcode = 'P0002'; end if;
  if p_role = 'none' then
    if v_uid = auth.uid() then raise exception '不能移除自己' using errcode = 'P0001'; end if;
    delete from staff where user_id = v_uid;
  elsif p_role in ('staff', 'director') then
    if v_uid = auth.uid() and p_role = 'staff' then raise exception '不能把自己降為職員' using errcode = 'P0001'; end if;
    insert into staff (user_id, email, role) values (v_uid, v_email, p_role::staff_role)
      on conflict (user_id) do update set role = excluded.role, email = excluded.email;
  else
    raise exception '角色只能是 staff、director 或 none' using errcode = '22023';
  end if;
  perform log('staff.set_role', v_email, jsonb_build_object('role', p_role));
end $$;

create function public.update_settings(p_library_name text, p_loan_days int, p_max_loans int) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_director() then raise exception '只有館長可以修改規則' using errcode = '42501'; end if;
  update settings set library_name = coalesce(nullif(trim(p_library_name), ''), library_name),
         loan_days = p_loan_days, max_loans = p_max_loans, updated_at = now() where id = 1;
  perform log('settings.update', 'settings', jsonb_build_object('loan_days', p_loan_days, 'max_loans', p_max_loans));
end $$;

-- ---------------------------------------------------------------- 函式執行權
revoke execute on all functions in schema public from public, anon;
grant execute on function
  public.whoami(), public.claim_membership(), public.my_card(), public.is_staff(), public.is_director(),
  public.create_member(text, text, text, text), public.update_member(text, text, text, text, text, boolean),
  public.reveal_phone(text), public.add_book(text, text, text, text, text, text), public.set_book_isbn(text, text),
  public.borrow_books(text, text[]), public.return_book(text),
  public.set_staff_role(text, text), public.update_settings(text, int, int)
  to authenticated;
-- log() 只供上方函式內部使用，不開放直接呼叫
revoke execute on function public.log(text, text, jsonb) from authenticated;
