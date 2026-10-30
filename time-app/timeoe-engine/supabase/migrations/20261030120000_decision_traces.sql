-- TIMEŒ decision traces: append-only, per-bot sha256 hash chain.
-- NOT applied anywhere yet. Apply only with Randy's approval.
create table if not exists public.decision_traces (
  id         bigint generated always as identity primary key,
  bot        text        not null,
  seq        integer     not null check (seq >= 0),
  prev_hash  char(64)    not null check (prev_hash ~ '^[0-9a-f]{64}$'),
  hash       char(64)    not null check (hash ~ '^[0-9a-f]{64}$'),
  logged_at  timestamptz not null,
  decision   jsonb       not null,
  created_at timestamptz not null default now(),
  constraint decision_traces_bot_seq_key unique (bot, seq),
  constraint decision_traces_hash_key unique (hash)
);

-- Append-only: block UPDATE and DELETE (TRUNCATE too).
create or replace function public.decision_traces_append_only() returns trigger
language plpgsql as $$
begin
  raise exception 'decision_traces is append-only';
end;
$$;

drop trigger if exists decision_traces_no_update_delete on public.decision_traces;
create trigger decision_traces_no_update_delete
  before update or delete on public.decision_traces
  for each row execute function public.decision_traces_append_only();

drop trigger if exists decision_traces_no_truncate on public.decision_traces;
create trigger decision_traces_no_truncate
  before truncate on public.decision_traces
  for each statement execute function public.decision_traces_append_only();

-- RLS on with no policies: only the service role (server-side) can read or insert.
alter table public.decision_traces enable row level security;
revoke all on public.decision_traces from anon, authenticated;
