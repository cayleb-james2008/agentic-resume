-- rhl_demo.quote_requests: quote requests from the RHL demo website (one row = one ticket).
-- Personalised agents watch this table (docs/QUOTE-WATCH.md). RHL demo only, not an Ergon feature.
-- Own schema: this file never touches ergon_warehouse (real RHL data).
--
-- Access model:
--   anon          INSERT only, and only the five visitor-supplied columns (name, company, contact, details, extra). It cannot set id, created_at, status or
--                 relevant_to (column grants; only the watcher decides who is pinged). It cannot read, update
--                 or delete anything (no SELECT/UPDATE/DELETE grant, no policy).
--   service_role  SELECT + UPDATE (the watcher claims rows and sets relevant_to). Bypasses RLS.
--   authenticated and PUBLIC: nothing.
--
-- Idempotent: safe to apply repeatedly. Send it as ONE transaction (begin; ... commit;).
-- Hosted step after applying: add `rhl_demo` to Project Settings > Data API > Exposed schemas (append, keep the
-- schemas already listed). Without it the REST endpoint answers 406 for this schema.

begin;

create schema if not exists rhl_demo;

create table if not exists rhl_demo.quote_requests (
  id          uuid        not null default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text        not null,
  company     text,
  contact     text        not null,   -- email address or phone number, as typed
  details     text        not null,   -- what they need quoted, free text
  status      text        not null default 'new',
  relevant_to text,                   -- routing key: team slug or agent handle; null until routed
  extra       jsonb       not null default '{}'::jsonb,  -- answers to form fields that have no column of their own
  constraint quote_requests_pkey          primary key (id),
  -- Limits apply to the raw text (padding with spaces cannot get past them) and a minimum applies to the trimmed text.
  constraint quote_requests_name_check    check (char_length(name) <= 120  and char_length(btrim(name)) >= 1),
  constraint quote_requests_company_check check (company is null or char_length(company) <= 160),
  constraint quote_requests_contact_check check (char_length(contact) <= 200 and char_length(btrim(contact)) >= 3),
  constraint quote_requests_details_check check (char_length(details) <= 4000 and char_length(btrim(details)) >= 1),
  constraint quote_requests_status_check  check (status in ('new', 'routed', 'done', 'spam')),
  constraint quote_requests_relevant_check check (relevant_to is null or relevant_to ~ '^[A-Za-z0-9:_-]{1,64}$'),
  constraint quote_requests_extra_check   check (jsonb_typeof(extra) = 'object' and octet_length(extra::text) <= 8192)
);

alter table rhl_demo.quote_requests enable row level security;

-- Anonymous visitors may add a row, and only as a new ticket.
drop policy if exists quote_requests_anon_insert on rhl_demo.quote_requests;
create policy quote_requests_anon_insert on rhl_demo.quote_requests
  for insert to anon with check (status = 'new');

-- Flood guard: at most 30 tickets in any minute, counting every row of a bulk insert, so one anonymous request cannot
-- create hundreds of tickets (each becomes a message to a person). The whole statement is refused and nothing is saved.
-- Trade-off: a flood can use up the quota, and real visitors then see the form's error message (which gives the phone number).
-- SECURITY DEFINER because anon has no SELECT; it only counts.
create or replace function rhl_demo.quote_requests_throttle() returns trigger
language plpgsql security definer set search_path = pg_catalog as $$
begin
  if (select count(*) from rhl_demo.quote_requests where created_at > now() - interval '1 minute') >= 30 then
    raise exception 'quote_requests: too many requests, try again in a minute' using errcode = '54000';
  end if;
  return new;
end
$$;
revoke all on function rhl_demo.quote_requests_throttle() from public;

drop trigger if exists quote_requests_throttle on rhl_demo.quote_requests;
create trigger quote_requests_throttle before insert on rhl_demo.quote_requests
  for each row execute function rhl_demo.quote_requests_throttle();

-- Start from nothing, whatever default privileges the project grants, then add back exactly what is needed.
revoke all on schema rhl_demo from public, anon, authenticated;
revoke all on rhl_demo.quote_requests from public, anon, authenticated, service_role;

grant usage on schema rhl_demo to anon, service_role;
grant insert (name, company, contact, details, extra) on rhl_demo.quote_requests to anon;
grant select, update on rhl_demo.quote_requests to service_role;

notify pgrst, 'reload schema';

commit;
