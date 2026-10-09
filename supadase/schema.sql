-- Схема бази для Supabase (PostgreSQL). Виконується один раз у SQL Editor.
-- Модель: один власник (ти). Реєстрацію нових користувачів у Supabase вимкни
-- (Authentication -> Providers -> Email -> "Allow new users to sign up" = off).

create table if not exists categories (
  id        text primary key,
  title     text not null,
  note      text,
  position  int  not null default 0
);

create table if not exists services (
  id           text primary key,
  category_id  text not null references categories(id) on delete cascade,
  label        text not null,
  hours        numeric(6,2) not null check (hours >= 0),
  qty_allowed  boolean not null default false,
  monthly      boolean not null default false,
  active       boolean not null default true,
  position     int not null default 0
);

create table if not exists settings (
  key    text primary key,
  value  jsonb not null
);

create table if not exists clients (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text,
  email      text,
  address    text,
  created_at timestamptz not null default now()
);

create table if not exists devis (
  id          uuid primary key default gen_random_uuid(),
  number      text unique not null,
  client_id   uuid references clients(id) on delete set null,
  status      text not null default 'brouillon'
              check (status in ('brouillon','envoye','accepte','refuse')),
  rate        numeric(6,2) not null,          -- тариф на момент створення (щоб старі devis не мінялися)
  vat_mode    text not null default 'none' check (vat_mode in ('none','20')),
  notes       text,
  created_at  timestamptz not null default now()
);

create table if not exists devis_lignes (
  id          uuid primary key default gen_random_uuid(),
  devis_id    uuid not null references devis(id) on delete cascade,
  service_id  text,                            -- може бути null, якщо послугу потім видалили
  label       text not null,                   -- копія назви на момент devis
  hours       numeric(6,2) not null,
  qty         int not null default 1,
  monthly     boolean not null default false,
  position    int not null default 0
);

-- Захист: все закрите, крім залогіненого користувача
alter table categories   enable row level security;
alter table services     enable row level security;
alter table settings     enable row level security;
alter table clients      enable row level security;
alter table devis        enable row level security;
alter table devis_lignes enable row level security;

do $$
declare t text;
begin
  foreach t in array array['categories','services','settings','clients','devis','devis_lignes'] loop
    execute format('drop policy if exists "auth_all" on %I', t);
    execute format('create policy "auth_all" on %I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;
