-- =====================================================================
-- setup.sql — створює таблицю заявок і правила безпеки.
-- Виконується ОДИН раз у Supabase: SQL Editor -> New query -> вставити -> Run.
-- Ідея безпеки:
--   * будь-який відвідувач сайту (роль anon) може ТІЛЬКИ додати заявку;
--   * читати, змінювати і видаляти заявки може тільки адмін (ти);
--   * ніхто не може вставити статус/нотатки, змінити дату або завалити базу сміттям.
-- =====================================================================

-- 1. Хто адмін (порожня таблиця; через API до неї не достукатись)
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 2. Таблиця заявок
create table if not exists public.requests (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  status         text not null default 'nouvelle' check (status in ('nouvelle','en_cours','terminee')),
  note           text not null default '' check (char_length(note) <= 4000),

  client_type    text not null check (client_type in ('particulier','entreprise')),
  first_name     text not null check (char_length(first_name) between 1 and 100),
  last_name      text not null check (char_length(last_name)  between 1 and 100),
  email          text not null check (char_length(email) between 5 and 200),
  phone          text check (char_length(phone) <= 40),
  address        text not null check (char_length(address) between 3 and 300),

  company_name   text check (char_length(company_name) <= 200),
  siret          text check (char_length(siret) <= 20),
  vat_number     text check (char_length(vat_number) <= 30),

  has_site       boolean,
  site_url       text check (char_length(site_url) <= 300),
  has_items      jsonb not null default '[]' check (jsonb_typeof(has_items) = 'array' and jsonb_array_length(has_items) <= 20),
  activity       text check (char_length(activity) <= 500),
  budget         text check (char_length(budget) <= 60),
  deadline       text check (char_length(deadline) <= 60),
  inspiration    text check (char_length(inspiration) <= 2000),
  dislikes       text check (char_length(dislikes) <= 2000),
  message        text check (char_length(message) <= 3000),
  custom_wishes  jsonb not null default '[]' check (jsonb_typeof(custom_wishes) = 'array' and jsonb_array_length(custom_wishes) <= 15 and pg_column_size(custom_wishes) < 8000),

  items          jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) <= 60 and pg_column_size(items) < 30000),
  total_ht       numeric(10,2) not null check (total_ht between 0 and 1000000),
  monthly_total  numeric(10,2) not null default 0 check (monthly_total between 0 and 1000000),
  rate           numeric(6,2) check (rate between 0 and 1000),
  consent_at     timestamptz not null
);

-- 3. Правила доступу (Row Level Security)
alter table public.requests enable row level security;

drop policy if exists anon_insert   on public.requests;
drop policy if exists admin_select  on public.requests;
drop policy if exists admin_update  on public.requests;
drop policy if exists admin_delete  on public.requests;

create policy anon_insert  on public.requests for insert to anon
  with check (status = 'nouvelle' and note = '' and consent_at is not null);
create policy admin_select on public.requests for select to authenticated using (public.is_admin());
create policy admin_update on public.requests for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_delete on public.requests for delete to authenticated using (public.is_admin());

-- 4. Права на рівні колонок (другий замок): відвідувач може заповнити лише поля форми
revoke all on public.requests from anon, authenticated;
grant insert (id, client_type, first_name, last_name, email, phone, address,
              company_name, siret, vat_number, has_site, site_url, has_items, activity,
              budget, deadline, inspiration, dislikes, message, custom_wishes,
              items, total_ht, monthly_total, rate, consent_at)
  on public.requests to anon;
grant select, delete on public.requests to authenticated;
grant update (status, note) on public.requests to authenticated;

-- 5. Захист від спаму: не більше 20 заявок за 10 хвилин на весь сайт
create or replace function public.requests_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.requests where created_at > now() - interval '10 minutes') >= 20 then
    raise exception 'Trop de demandes, reessayez plus tard.';
  end if;
  return new;
end $$;
revoke all on function public.requests_guard() from public, anon, authenticated;

drop trigger if exists requests_guard on public.requests;
create trigger requests_guard before insert on public.requests
  for each row execute function public.requests_guard();
