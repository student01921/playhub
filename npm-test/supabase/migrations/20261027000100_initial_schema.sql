-- GatherPlay initial schema
-- Run with: supabase db push
--
-- Security notes:
--   * Correct trivia answers are never exposed through table grants or RLS.
--   * Room state is returned only through get_trivia_room_state(), which checks
--     membership and strips the answer until the reveal phase.
--   * Scores are awarded in the reveal transaction, not at answer time, so live
--     leaderboard changes cannot reveal correctness early.
--   * Direct writes to rooms, players, scores and answers are not granted.

begin;

do $$
begin
  create type public.room_status as enum ('lobby', 'question', 'reveal', 'results', 'closed');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 40),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  short_description text not null,
  description text not null,
  game_type text not null,
  format text not null default 'offline' check (format in ('offline', 'online')),
  min_players integer not null check (min_players >= 1),
  max_players integer not null check (max_players >= min_players),
  min_age integer not null check (min_age between 3 and 21),
  estimated_duration_minutes integer not null check (estimated_duration_minutes between 5 and 300),
  occasions text[] not null default '{}',
  styles text[] not null default '{}',
  materials text[] not null default '{}',
  setup text,
  rules jsonb not null default '[]'::jsonb check (jsonb_typeof(rules) = 'array'),
  how_to_win text,
  variations jsonb not null default '[]'::jsonb check (jsonb_typeof(variations) = 'array'),
  host_tip text,
  difficulty text not null default 'easy' check (difficulty in ('easy', 'medium', 'advanced')),
  art_theme text not null default 'paper',
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  game_id uuid not null references public.games (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

create table if not exists public.game_plays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  game_id uuid not null references public.games (id) on delete cascade,
  played_at timestamptz not null default now()
);

create table if not exists public.trivia_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null unique,
  category text not null,
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) = 4),
  correct_option_index smallint not null check (correct_option_index between 0 and 3),
  explanation text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.game_rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text not null unique check (room_code ~ '^[A-HJ-NP-Z2-9]{6}$'),
  host_user_id uuid not null references auth.users (id) on delete cascade,
  status public.room_status not null default 'lobby',
  current_question_index integer not null default 0 check (current_question_index >= 0),
  question_ids uuid[] not null default '{}',
  question_started_at timestamptz,
  question_ends_at timestamptz,
  settings jsonb not null default '{"max_players": 10, "question_count": 8, "question_seconds": 20}'::jsonb
    check (jsonb_typeof(settings) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '4 hours')
);

create table if not exists public.room_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.game_rooms (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 40),
  score integer not null default 0 check (score >= 0),
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (room_id, user_id)
);

create table if not exists public.trivia_answers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.game_rooms (id) on delete cascade,
  player_id uuid not null references public.room_players (id) on delete cascade,
  question_index integer not null check (question_index >= 0),
  selected_option_index smallint not null check (selected_option_index between 0 and 3),
  is_correct boolean not null default false,
  points_awarded integer not null default 0 check (points_awarded >= 0),
  response_time_ms integer not null default 0 check (response_time_ms >= 0),
  is_scored boolean not null default false,
  created_at timestamptz not null default now(),
  unique (room_id, player_id, question_index)
);

create index if not exists favorites_game_id_idx on public.favorites (game_id);
create index if not exists game_plays_user_played_idx on public.game_plays (user_id, played_at desc);
create index if not exists game_plays_game_id_idx on public.game_plays (game_id);
create index if not exists game_rooms_host_idx on public.game_rooms (host_user_id);
create index if not exists game_rooms_status_expires_idx on public.game_rooms (status, expires_at);
create index if not exists room_players_room_idx on public.room_players (room_id);
create index if not exists room_players_user_idx on public.room_players (user_id);
create index if not exists trivia_answers_room_question_idx on public.trivia_answers (room_id, question_index);
create index if not exists trivia_answers_player_idx on public.trivia_answers (player_id);

-- Keep timestamps correct.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists game_rooms_touch_updated_at on public.game_rooms;
create trigger game_rooms_touch_updated_at
  before update on public.game_rooms
  for each row execute function public.touch_updated_at();

-- Create a profile for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  v_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Player'
  );
  v_name := left(regexp_replace(v_name, '[[:space:]]+', ' ', 'g'), 40);

  insert into public.profiles (id, display_name)
  values (new.id, v_name)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for any users created before this migration.
insert into public.profiles (id, display_name)
select
  u.id,
  left(
    coalesce(
      nullif(btrim(u.raw_user_meta_data ->> 'display_name'), ''),
      nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
      'Player'
    ),
    40
  )
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

-- Membership helper used by RLS. Security definer avoids recursive RLS.
create or replace function public.is_room_member(p_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.room_players
    where room_id = p_room_id
      and user_id = auth.uid()
  );
$$;

-- Generate a 6-character code from a confusion-resistant alphabet.
-- UUID bytes provide strong entropy; uniqueness is still enforced by the table.
create or replace function public.generate_room_code()
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  entropy text := replace(gen_random_uuid()::text, '-', '');
  code text := '';
  idx integer;
  i integer;
begin
  for i in 1..6 loop
    idx := (get_byte(decode(substr(entropy, (i - 1) * 2 + 1, 2), 'hex'), 0) % 32) + 1;
    code := code || substr(alphabet, idx, 1);
  end loop;
  return code;
end;
$$;

-- Award points for a single question exactly once. Scores are only applied at
-- reveal time, never at answer time.
create or replace function public.award_trivia_question(p_room_id uuid, p_question_index integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.room_players rp
  set score = rp.score + coalesce(
    (
      select sum(a.points_awarded)::integer
      from public.trivia_answers a
      where a.room_id = p_room_id
        and a.player_id = rp.id
        and a.question_index = p_question_index
        and a.is_scored = false
    ),
    0
  )
  where rp.room_id = p_room_id;

  update public.trivia_answers
  set is_scored = true
  where room_id = p_room_id
    and question_index = p_question_index
    and is_scored = false;
end;
$$;

create or replace function public.create_trivia_room(
  p_display_name text default null,
  p_max_players integer default 10,
  p_question_count integer default 8,
  p_question_seconds integer default 20
)
returns table (room_id uuid, room_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_name text;
  v_code text;
  v_room_id uuid;
  v_attempt integer;
  v_recent integer;
  v_settings jsonb;
begin
  if v_user_id is null then
    raise exception 'Please sign in to create a room.';
  end if;

  if p_max_players is null or p_max_players < 2 or p_max_players > 10 then
    raise exception 'Rooms support between 2 and 10 players.';
  end if;

  if p_question_count is null or p_question_count < 4 or p_question_count > 12 then
    raise exception 'Choose between 4 and 12 questions.';
  end if;

  if p_question_seconds is null or p_question_seconds < 10 or p_question_seconds > 60 then
    raise exception 'Questions must last between 10 and 60 seconds.';
  end if;

  select count(*) into v_recent
  from public.game_rooms
  where host_user_id = v_user_id
    and created_at > now() - interval '10 minutes';

  if v_recent >= 5 then
    raise exception 'You have opened several rooms recently. Please wait a few minutes before creating another.';
  end if;

  select coalesce(
    nullif(btrim(coalesce(p_display_name, '')), ''),
    p.display_name,
    nullif(split_part(coalesce(auth.jwt() ->> 'email', ''), '@', 1), ''),
    'Player'
  )
  into v_name
  from (select 1) seed
  left join public.profiles p on p.id = v_user_id;

  v_name := left(btrim(regexp_replace(coalesce(v_name, 'Player'), '[[:space:]]+', ' ', 'g')), 40);
  if char_length(v_name) = 0 then
    v_name := 'Player';
  end if;

  v_settings := jsonb_build_object(
    'max_players', p_max_players,
    'question_count', p_question_count,
    'question_seconds', p_question_seconds
  );

  for v_attempt in 1..12 loop
    v_code := public.generate_room_code();
    begin
      insert into public.game_rooms (room_code, host_user_id, settings)
      values (v_code, v_user_id, v_settings)
      returning id into v_room_id;
      exit;
    exception
      when unique_violation then
        v_room_id := null;
    end;
  end loop;

  if v_room_id is null then
    raise exception 'We could not create a room code. Please try again.';
  end if;

  insert into public.room_players (room_id, user_id, display_name)
  values (v_room_id, v_user_id, v_name);

  return query select v_room_id, v_code;
end;
$$;

create or replace function public.join_trivia_room(p_room_code text)
returns table (room_id uuid, room_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_code text := upper(btrim(coalesce(p_room_code, '')));
  v_room public.game_rooms%rowtype;
  v_player public.room_players%rowtype;
  v_name text;
  v_count integer;
  v_max integer;
begin
  if v_user_id is null then
    raise exception 'Please sign in to join a room.';
  end if;

  if v_code !~ '^[A-HJ-NP-Z2-9]{6}$' then
    raise exception 'Room codes are six characters. Check the code and try again.';
  end if;

  select * into v_room
  from public.game_rooms
  where room_code = v_code
  for update;

  if not found then
    raise exception 'We could not find a live room with that code.';
  end if;

  if v_room.expires_at <= now() or v_room.status = 'closed' then
    raise exception 'This room has closed. Ask the host for a fresh code.';
  end if;

  select * into v_player
  from public.room_players
  where room_id = v_room.id
    and user_id = v_user_id;

  if found then
    update public.room_players
    set last_seen_at = now()
    where id = v_player.id;

    return query select v_room.id, v_room.room_code;
  end if;

  if v_room.status <> 'lobby' then
    raise exception 'That game has already started. Ask the host to play again or share a new room.';
  end if;

  v_max := coalesce((v_room.settings ->> 'max_players')::integer, 10);
  select count(*) into v_count from public.room_players where room_id = v_room.id;

  if v_count >= v_max then
    raise exception 'This room is full.';
  end if;

  select coalesce(
    p.display_name,
    nullif(split_part(coalesce(auth.jwt() ->> 'email', ''), '@', 1), ''),
    'Player'
  )
  into v_name
  from (select 1) seed
  left join public.profiles p on p.id = v_user_id;

  v_name := left(btrim(regexp_replace(coalesce(v_name, 'Player'), '[[:space:]]+', ' ', 'g')), 40);
  if char_length(v_name) = 0 then
    v_name := 'Player';
  end if;

  insert into public.room_players (room_id, user_id, display_name)
  values (v_room.id, v_user_id, v_name);

  return query select v_room.id, v_room.room_code;
end;
$$;

create or replace function public.get_trivia_room_state(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_room public.game_rooms%rowtype;
  v_player public.room_players%rowtype;
  v_question public.trivia_questions%rowtype;
  v_players jsonb := '[]'::jsonb;
  v_question_json jsonb := null;
  v_option_counts jsonb := null;
  v_answered_count integer := 0;
  v_my_answer integer := null;
  v_question_count integer := 0;
  v_seconds integer := 20;
  v_max_players integer := 10;
begin
  if v_user_id is null then
    raise exception 'Please sign in to view this room.';
  end if;

  select * into v_room
  from public.game_rooms
  where id = p_room_id
  for update;

  if not found then
    raise exception 'This room could not be found.';
  end if;

  select * into v_player
  from public.room_players
  where room_id = p_room_id
    and user_id = v_user_id;

  if not found then
    raise exception 'You are not a player in this room.';
  end if;

  if v_room.expires_at <= now() and v_room.status <> 'closed' then
    update public.game_rooms
    set status = 'closed'
    where id = p_room_id;
    v_room.status := 'closed';
  end if;

  -- Lazily move an expired question to reveal. This is idempotent and
  -- server-authoritative; the client timer is only a display aid.
  if v_room.status = 'question'
     and v_room.question_ends_at is not null
     and v_room.question_ends_at <= now() then
    perform public.award_trivia_question(p_room_id, v_room.current_question_index);
    update public.game_rooms
    set status = 'reveal'
    where id = p_room_id;
    v_room.status := 'reveal';
  end if;

  v_question_count := coalesce(array_length(v_room.question_ids, 1), 0);
  v_seconds := coalesce((v_room.settings ->> 'question_seconds')::integer, 20);
  v_max_players := coalesce((v_room.settings ->> 'max_players')::integer, 10);

  if v_room.status in ('question', 'reveal')
     and v_question_count > 0
     and v_room.current_question_index < v_question_count then
    select * into v_question
    from public.trivia_questions
    where id = v_room.question_ids[v_room.current_question_index + 1];

    if found then
      select count(*) into v_answered_count
      from public.trivia_answers
      where room_id = p_room_id
        and question_index = v_room.current_question_index;

      select selected_option_index into v_my_answer
      from public.trivia_answers
      where room_id = p_room_id
        and player_id = v_player.id
        and question_index = v_room.current_question_index
      limit 1;

      if v_room.status = 'reveal' then
        select jsonb_agg(option_count order by option_index)
        into v_option_counts
        from (
          select
            g.option_index,
            count(a.id)::integer as option_count
          from generate_series(0, 3) as g(option_index)
          left join public.trivia_answers a
            on a.room_id = p_room_id
           and a.question_index = v_room.current_question_index
           and a.selected_option_index = g.option_index
          group by g.option_index
        ) counts;
      end if;

      v_question_json := jsonb_build_object(
        'index', v_room.current_question_index + 1,
        'total', v_question_count,
        'category', v_question.category,
        'difficulty', v_question.difficulty,
        'prompt', v_question.question,
        'options', v_question.options,
        'ends_at', v_room.question_ends_at,
        'started_at', v_room.question_started_at,
        'correct_option_index',
          case when v_room.status = 'reveal' then v_question.correct_option_index else null end,
        'explanation',
          case when v_room.status = 'reveal' then v_question.explanation else null end,
        'my_answer', v_my_answer,
        'answered_count', v_answered_count,
        'option_counts',
          case when v_room.status = 'reveal' then coalesce(v_option_counts, '[0,0,0,0]'::jsonb) else null end
      );
    end if;
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'player_id', rp.id,
        'user_id', rp.user_id,
        'display_name', rp.display_name,
        'score', rp.score,
        'correct_count', (
          select count(*)::integer
          from public.trivia_answers a
          where a.player_id = rp.id
            and a.is_correct
            and a.is_scored
        ),
        'is_host', rp.user_id = v_room.host_user_id,
        'joined_at', rp.joined_at,
        'last_seen_at', rp.last_seen_at
      )
      order by rp.score desc, rp.joined_at asc
    ),
    '[]'::jsonb
  )
  into v_players
  from public.room_players rp
  where rp.room_id = p_room_id;

  update public.room_players
  set last_seen_at = now()
  where id = v_player.id
    and last_seen_at < now() - interval '8 seconds';

  return jsonb_build_object(
    'server_now', now(),
    'room', jsonb_build_object(
      'id', v_room.id,
      'room_code', v_room.room_code,
      'status', v_room.status::text,
      'host_user_id', v_room.host_user_id,
      'current_question_index', v_room.current_question_index,
      'question_count', v_question_count,
      'question_seconds', v_seconds,
      'max_players', v_max_players,
      'question_started_at', v_room.question_started_at,
      'question_ends_at', v_room.question_ends_at,
      'created_at', v_room.created_at,
      'expires_at', v_room.expires_at
    ),
    'players', v_players,
    'my_player_id', v_player.id,
    'is_host', v_room.host_user_id = v_user_id,
    'question', v_question_json
  );
end;
$$;

create or replace function public.start_trivia_game(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_room public.game_rooms%rowtype;
  v_question_ids uuid[];
  v_wanted integer;
  v_seconds integer;
  v_player_count integer;
begin
  if v_user_id is null then
    raise exception 'Please sign in to start a game.';
  end if;

  select * into v_room
  from public.game_rooms
  where id = p_room_id
  for update;

  if not found then
    raise exception 'This room could not be found.';
  end if;

  if v_room.host_user_id <> v_user_id then
    raise exception 'Only the host can start this game.';
  end if;

  if v_room.expires_at <= now() or v_room.status = 'closed' then
    raise exception 'This room has closed. Create a new one to play again.';
  end if;

  if v_room.status <> 'lobby' then
    raise exception 'This game has already started.';
  end if;

  select count(*) into v_player_count
  from public.room_players
  where room_id = p_room_id;

  if v_player_count < 2 then
    raise exception 'At least two players are needed. Share the room code first.';
  end if;

  v_wanted := least(greatest(coalesce((v_room.settings ->> 'question_count')::integer, 8), 4), 12);
  v_seconds := least(greatest(coalesce((v_room.settings ->> 'question_seconds')::integer, 20), 10), 60);

  select array_agg(id)
  into v_question_ids
  from (
    select id
    from public.trivia_questions
    where is_active = true
    order by random()
    limit v_wanted
  ) picked;

  if v_question_ids is null or array_length(v_question_ids, 1) < 2 then
    raise exception 'There are not enough trivia questions available.';
  end if;

  delete from public.trivia_answers where room_id = p_room_id;
  update public.room_players set score = 0 where room_id = p_room_id;

  update public.game_rooms
  set
    status = 'question',
    current_question_index = 0,
    question_ids = v_question_ids,
    question_started_at = now(),
    question_ends_at = now() + make_interval(secs => v_seconds)
  where id = p_room_id;

  return jsonb_build_object('ok', true, 'status', 'question');
end;
$$;

create or replace function public.reveal_trivia_question(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_room public.game_rooms%rowtype;
begin
  if v_user_id is null then
    raise exception 'Please sign in to continue.';
  end if;

  select * into v_room
  from public.game_rooms
  where id = p_room_id
  for update;

  if not found then
    raise exception 'This room could not be found.';
  end if;

  if v_room.host_user_id <> v_user_id then
    raise exception 'Only the host can reveal the answer.';
  end if;

  if v_room.status <> 'question' then
    raise exception 'This question is not accepting answers.';
  end if;

  perform public.award_trivia_question(p_room_id, v_room.current_question_index);

  update public.game_rooms
  set status = 'reveal'
  where id = p_room_id;

  return jsonb_build_object('ok', true, 'status', 'reveal');
end;
$$;

create or replace function public.advance_trivia_room(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_room public.game_rooms%rowtype;
  v_total integer;
  v_seconds integer;
begin
  if v_user_id is null then
    raise exception 'Please sign in to continue.';
  end if;

  select * into v_room
  from public.game_rooms
  where id = p_room_id
  for update;

  if not found then
    raise exception 'This room could not be found.';
  end if;

  if v_room.host_user_id <> v_user_id then
    raise exception 'Only the host can move the game on.';
  end if;

  if v_room.expires_at <= now() or v_room.status = 'closed' then
    raise exception 'This room has closed.';
  end if;

  if v_room.status = 'question' then
    if v_room.question_ends_at is not null and v_room.question_ends_at > now() then
      raise exception 'The question timer is still running.';
    end if;

    perform public.award_trivia_question(p_room_id, v_room.current_question_index);
    update public.game_rooms set status = 'reveal' where id = p_room_id;
    return jsonb_build_object('ok', true, 'status', 'reveal');
  end if;

  if v_room.status = 'reveal' then
    v_total := coalesce(array_length(v_room.question_ids, 1), 0);

    if v_room.current_question_index + 1 >= v_total then
      update public.game_rooms set status = 'results' where id = p_room_id;
      return jsonb_build_object('ok', true, 'status', 'results');
    end if;

    v_seconds := least(greatest(coalesce((v_room.settings ->> 'question_seconds')::integer, 20), 10), 60);

    update public.game_rooms
    set
      status = 'question',
      current_question_index = v_room.current_question_index + 1,
      question_started_at = now(),
      question_ends_at = now() + make_interval(secs => v_seconds)
    where id = p_room_id;

    return jsonb_build_object('ok', true, 'status', 'question');
  end if;

  raise exception 'The game is not in a state that can advance.';
end;
$$;

create or replace function public.submit_trivia_answer(
  p_room_id uuid,
  p_selected_option_index integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_room public.game_rooms%rowtype;
  v_player public.room_players%rowtype;
  v_question public.trivia_questions%rowtype;
  v_question_index integer;
  v_answer_id uuid;
  v_seconds integer;
  v_elapsed_ms integer;
  v_remaining_ratio numeric;
  v_is_correct boolean;
  v_points integer;
  v_answered_count integer;
begin
  if v_user_id is null then
    raise exception 'Please sign in to answer.';
  end if;

  if p_selected_option_index is null or p_selected_option_index < 0 or p_selected_option_index > 3 then
    raise exception 'Choose one of the four answers.';
  end if;

  select * into v_room
  from public.game_rooms
  where id = p_room_id
  for update;

  if not found then
    raise exception 'This room could not be found.';
  end if;

  if v_room.host_user_id is null or v_room.expires_at <= now() or v_room.status = 'closed' then
    raise exception 'This room has closed.';
  end if;

  if v_room.status <> 'question' then
    raise exception 'Answers are closed for this question.';
  end if;

  if v_room.question_ends_at is null or now() >= v_room.question_ends_at then
    perform public.award_trivia_question(p_room_id, v_room.current_question_index);
    update public.game_rooms set status = 'reveal' where id = p_room_id;
    raise exception 'Time is up for this question.';
  end if;

  select * into v_player
  from public.room_players
  where room_id = p_room_id
    and user_id = v_user_id;

  if not found then
    raise exception 'You are not a player in this room.';
  end if;

  v_question_index := v_room.current_question_index;

  select * into v_question
  from public.trivia_questions
  where id = v_room.question_ids[v_question_index + 1];

  if not found then
    raise exception 'That question could not be loaded.';
  end if;

  v_seconds := least(greatest(coalesce((v_room.settings ->> 'question_seconds')::integer, 20), 10), 60);
  v_elapsed_ms := greatest(0, floor(extract(epoch from (now() - v_room.question_started_at)) * 1000)::integer);
  v_remaining_ratio := greatest(
    0,
    least(1, extract(epoch from (v_room.question_ends_at - now())) / v_seconds)
  );
  v_is_correct := p_selected_option_index = v_question.correct_option_index;
  v_points := case
    when v_is_correct then 1000 + round(v_remaining_ratio * 500)::integer
    else 0
  end;

  insert into public.trivia_answers (
    room_id,
    player_id,
    question_index,
    selected_option_index,
    is_correct,
    points_awarded,
    response_time_ms
  )
  values (
    p_room_id,
    v_player.id,
    v_question_index,
    p_selected_option_index,
    v_is_correct,
    v_points,
    v_elapsed_ms
  )
  on conflict (room_id, player_id, question_index) do nothing
  returning id into v_answer_id;

  select count(*) into v_answered_count
  from public.trivia_answers
  where room_id = p_room_id
    and question_index = v_question_index;

  -- Never return correctness here. Scores and answers are revealed together.
  return jsonb_build_object(
    'submitted', true,
    'already_submitted', v_answer_id is null,
    'answered_count', v_answered_count
  );
end;
$$;

create or replace function public.restart_trivia_room(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_room public.game_rooms%rowtype;
begin
  if v_user_id is null then
    raise exception 'Please sign in to continue.';
  end if;

  select * into v_room
  from public.game_rooms
  where id = p_room_id
  for update;

  if not found then
    raise exception 'This room could not be found.';
  end if;

  if v_room.host_user_id <> v_user_id then
    raise exception 'Only the host can restart this game.';
  end if;

  if v_room.status <> 'results' then
    raise exception 'Finish the current game before starting another.';
  end if;

  if v_room.expires_at <= now() then
    raise exception 'This room has expired. Create a new one to play again.';
  end if;

  delete from public.trivia_answers where room_id = p_room_id;
  update public.room_players set score = 0 where room_id = p_room_id;

  update public.game_rooms
  set
    status = 'lobby',
    current_question_index = 0,
    question_ids = '{}',
    question_started_at = null,
    question_ends_at = null
  where id = p_room_id;

  return jsonb_build_object('ok', true, 'status', 'lobby');
end;
$$;

create or replace function public.leave_trivia_room(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_room public.game_rooms%rowtype;
  v_player public.room_players%rowtype;
begin
  if v_user_id is null then
    raise exception 'Please sign in to continue.';
  end if;

  select * into v_room
  from public.game_rooms
  where id = p_room_id
  for update;

  if not found then
    return jsonb_build_object('ok', true);
  end if;

  select * into v_player
  from public.room_players
  where room_id = p_room_id
    and user_id = v_user_id;

  if not found then
    return jsonb_build_object('ok', true);
  end if;

  if v_room.host_user_id = v_user_id then
    update public.game_rooms set status = 'closed' where id = p_room_id;
  else
    delete from public.room_players where id = v_player.id;
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

-- Row Level Security -------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.favorites enable row level security;
alter table public.game_plays enable row level security;
alter table public.game_rooms enable row level security;
alter table public.room_players enable row level security;
alter table public.trivia_questions enable row level security;
alter table public.trivia_answers enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists games_read_all on public.games;
create policy games_read_all on public.games
  for select to anon, authenticated
  using (true);

drop policy if exists favorites_select_own on public.favorites;
create policy favorites_select_own on public.favorites
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists favorites_insert_own on public.favorites;
create policy favorites_insert_own on public.favorites
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists favorites_delete_own on public.favorites;
create policy favorites_delete_own on public.favorites
  for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists game_plays_select_own on public.game_plays;
create policy game_plays_select_own on public.game_plays
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists game_plays_insert_own on public.game_plays;
create policy game_plays_insert_own on public.game_plays
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists game_plays_delete_own on public.game_plays;
create policy game_plays_delete_own on public.game_plays
  for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists rooms_select_members on public.game_rooms;
create policy rooms_select_members on public.game_rooms
  for select to authenticated
  using (public.is_room_member(id));

drop policy if exists room_players_select_members on public.room_players;
create policy room_players_select_members on public.room_players
  for select to authenticated
  using (public.is_room_member(room_id));

-- Table privileges ---------------------------------------------------------
revoke all on public.profiles from anon, authenticated;
revoke all on public.games from anon, authenticated;
revoke all on public.favorites from anon, authenticated;
revoke all on public.game_plays from anon, authenticated;
revoke all on public.game_rooms from anon, authenticated;
revoke all on public.room_players from anon, authenticated;
revoke all on public.trivia_questions from anon, authenticated;
revoke all on public.trivia_answers from anon, authenticated;

grant select on public.games to anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;
grant select, insert, delete on public.favorites to authenticated;
grant select, insert, delete on public.game_plays to authenticated;
grant select on public.game_rooms to authenticated;
grant select on public.room_players to authenticated;
-- No grants on trivia_questions or trivia_answers. Only the RPCs can read them.

-- Function privileges ------------------------------------------------------
revoke all on function public.touch_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.generate_room_code() from public, anon, authenticated;
revoke all on function public.award_trivia_question(uuid, integer) from public, anon, authenticated;

revoke all on function public.is_room_member(uuid) from public, anon;
grant execute on function public.is_room_member(uuid) to authenticated;

revoke all on function public.create_trivia_room(text, integer, integer, integer) from public, anon;
grant execute on function public.create_trivia_room(text, integer, integer, integer) to authenticated;

revoke all on function public.join_trivia_room(text) from public, anon;
grant execute on function public.join_trivia_room(text) to authenticated;

revoke all on function public.get_trivia_room_state(uuid) from public, anon;
grant execute on function public.get_trivia_room_state(uuid) to authenticated;

revoke all on function public.start_trivia_game(uuid) from public, anon;
grant execute on function public.start_trivia_game(uuid) to authenticated;

revoke all on function public.reveal_trivia_question(uuid) from public, anon;
grant execute on function public.reveal_trivia_question(uuid) to authenticated;

revoke all on function public.advance_trivia_room(uuid) from public, anon;
grant execute on function public.advance_trivia_room(uuid) to authenticated;

revoke all on function public.submit_trivia_answer(uuid, integer) from public, anon;
grant execute on function public.submit_trivia_answer(uuid, integer) to authenticated;

revoke all on function public.restart_trivia_room(uuid) from public, anon;
grant execute on function public.restart_trivia_room(uuid) to authenticated;

revoke all on function public.leave_trivia_room(uuid) from public, anon;
grant execute on function public.leave_trivia_room(uuid) to authenticated;

-- Realtime -----------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'game_rooms'
    ) then
      execute 'alter publication supabase_realtime add table public.game_rooms';
    end if;

    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'room_players'
    ) then
      execute 'alter publication supabase_realtime add table public.room_players';
    end if;
  end if;
end
$$;

alter table public.room_players replica identity full;

commit;
