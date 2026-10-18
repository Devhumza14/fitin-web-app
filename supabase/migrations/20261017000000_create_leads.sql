-- Leads from the website forms. Written only by the website server with the secret key.
create table public.leads (
  -- ponytail: random uuid (v4) is fine at this volume (a few leads a day); it also keeps ids unguessable. Revisit with uuidv7 if it grows.
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('project', 'partner', 'contact')),
  name text not null check (char_length(name) between 2 and 100),
  phone text check (phone is null or phone ~ '^\+923\d{9}$'),
  email text check (email is null or char_length(email) <= 254),
  city text,
  payload jsonb not null default '{}'::jsonb,
  email_sent boolean not null default false,
  source_path text
);

comment on table public.leads is 'Website form submissions (project, partner, contact). Future CRM reads from here.';

create index leads_created_at_idx on public.leads (created_at desc);
create index leads_type_created_at_idx on public.leads (type, created_at desc);

-- RLS on with no policies: the anon and authenticated roles (browser keys) can do nothing.
alter table public.leads enable row level security;
revoke all on table public.leads from anon, authenticated;
