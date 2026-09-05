-- FARA — Fase 1: modelo de datos (Auth, Organization, Project, esqueleto de dominio)
-- Basado en la seccion 9 (ERD) de docs/architecture/ARCHITECTURE_FARA.md.
-- Correr en el SQL editor de Supabase (o via `supabase db push` si el proyecto esta linkeado).

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "vector";     -- pgvector, usado por code_embeddings

-- ---------------------------------------------------------------------------
-- users — perfil publico que extiende auth.users (no se puede alterar auth.users)
-- ---------------------------------------------------------------------------
create table public.users (
    id uuid primary key references auth.users (id) on delete cascade,
    username text not null,
    email text not null,
    avatar_url text,
    streak_days integer not null default 0,
    plan text not null default 'npc' check (plan in ('npc', 'giga_chad')),
    created_at timestamptz not null default now()
);

-- crea automaticamente el perfil publico cuando alguien se registra via Supabase Auth
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.users (id, username, email, avatar_url)
    values (
        new.id,
        coalesce(new.raw_user_meta_data ->> 'user_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
        new.email,
        new.raw_user_meta_data ->> 'avatar_url'
    );
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- organizations + memberships (multi-tenant real, sin roles)
-- ---------------------------------------------------------------------------
create table public.organizations (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    owner_id uuid not null references public.users (id) on delete cascade,
    created_at timestamptz not null default now()
);

create table public.memberships (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations (id) on delete cascade,
    user_id uuid not null references public.users (id) on delete cascade,
    joined_at timestamptz not null default now(),
    unique (org_id, user_id)
);

create index memberships_user_id_idx on public.memberships (user_id);
create index memberships_org_id_idx on public.memberships (org_id);

-- ---------------------------------------------------------------------------
-- projects + project_members (equipo de fight, independiente de memberships)
-- ---------------------------------------------------------------------------
create table public.projects (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations (id) on delete cascade,
    name text not null,
    description text,
    invite_token uuid not null default gen_random_uuid(),
    created_at timestamptz not null default now()
);

create unique index projects_invite_token_idx on public.projects (invite_token);

create table public.project_members (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references public.projects (id) on delete cascade,
    user_id uuid not null references public.users (id) on delete cascade,
    is_external boolean not null default false,
    joined_at timestamptz not null default now(),
    unique (project_id, user_id)
);

create index project_members_project_id_idx on public.project_members (project_id);

create table public.project_repos (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references public.projects (id) on delete cascade,
    repo_full_name text not null,
    repo_url text not null
);

create index project_repos_project_id_idx on public.project_repos (project_id);

-- ---------------------------------------------------------------------------
-- technologies + project_tech
-- ---------------------------------------------------------------------------
create table public.technologies (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    icon_url text,
    is_trending boolean not null default false
);

create table public.project_tech (
    project_id uuid not null references public.projects (id) on delete cascade,
    technology_id uuid not null references public.technologies (id) on delete cascade,
    primary key (project_id, technology_id)
);

-- ---------------------------------------------------------------------------
-- problems + problem_tech (muchos-a-muchos, "Adaptable a" — ADR-10)
-- ---------------------------------------------------------------------------
create table public.problems (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references public.projects (id) on delete cascade,
    title text not null,
    description text not null,
    source_snippet text,
    source_url text,
    difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
    transferable_concepts jsonb not null default '[]'::jsonb,
    new_concepts jsonb not null default '[]'::jsonb,
    status text not null default 'generating' check (status in ('generating', 'proposed', 'failed')),
    created_at timestamptz not null default now()
);

create index problems_project_id_idx on public.problems (project_id);

create table public.problem_tech (
    problem_id uuid not null references public.problems (id) on delete cascade,
    technology_id uuid not null references public.technologies (id) on delete cascade,
    primary key (problem_id, technology_id)
);

-- ---------------------------------------------------------------------------
-- matches (creada antes que submissions por la FK match_id)
-- ---------------------------------------------------------------------------
create table public.matches (
    id uuid primary key default gen_random_uuid(),
    problem_id uuid not null references public.problems (id) on delete cascade,
    challenger_id uuid not null references public.users (id) on delete cascade,
    opponent_type text not null check (opponent_type in ('ai', 'human')),
    opponent_user_id uuid references public.users (id) on delete set null,
    status text not null default 'created'
        check (status in ('created', 'waiting_opponent', 'in_progress', 'reviewing', 'finished', 'cancelled', 'abandoned')),
    duration_sec integer not null default 300,
    started_at timestamptz,
    ai_completion_time_sec integer,
    ai_reveal_script jsonb,
    winner_id uuid references public.users (id) on delete set null,
    created_at timestamptz not null default now(),
    constraint matches_opponent_shape check (
        (opponent_type = 'ai' and opponent_user_id is null)
        or (opponent_type = 'human')
    )
);

create index matches_problem_id_idx on public.matches (problem_id);

-- ---------------------------------------------------------------------------
-- submissions
-- ---------------------------------------------------------------------------
create table public.submissions (
    id uuid primary key default gen_random_uuid(),
    problem_id uuid not null references public.problems (id) on delete cascade,
    user_id uuid not null references public.users (id) on delete cascade,
    match_id uuid references public.matches (id) on delete cascade,
    code text not null,
    score integer,
    feedback text,
    status text not null default 'pending' check (status in ('pending', 'passed', 'failed')),
    created_at timestamptz not null default now()
);

create index submissions_problem_id_idx on public.submissions (problem_id);
create index submissions_user_id_idx on public.submissions (user_id);
create index submissions_match_id_idx on public.submissions (match_id);

-- ---------------------------------------------------------------------------
-- code_embeddings (pgvector, usado por el Agente Matching — Fase 2)
-- ---------------------------------------------------------------------------
create table public.code_embeddings (
    id uuid primary key default gen_random_uuid(),
    problem_id uuid not null references public.problems (id) on delete cascade,
    embedding vector(768)
);

create index code_embeddings_embedding_idx on public.code_embeddings
    using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ---------------------------------------------------------------------------
-- Row Level Security — basica: visibilidad por Organization/Membership.
-- El backend usa la service_role key y bypassea RLS; estas policies protegen
-- el acceso directo desde el cliente (Supabase Realtime / consultas del frontend).
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.project_repos enable row level security;
alter table public.technologies enable row level security;
alter table public.project_tech enable row level security;
alter table public.problems enable row level security;
alter table public.problem_tech enable row level security;
alter table public.matches enable row level security;
alter table public.submissions enable row level security;
alter table public.code_embeddings enable row level security;

-- users: cualquier autenticado puede ver perfiles (necesario para listas de equipo),
-- pero solo puede editar el propio.
create policy users_select_authenticated on public.users
    for select to authenticated using (true);
create policy users_update_own on public.users
    for update to authenticated using (id = auth.uid());

-- organizations: visibles para quien tiene membership; cualquier autenticado puede crear una.
create policy organizations_select_member on public.organizations
    for select to authenticated using (
        id in (select org_id from public.memberships where user_id = auth.uid())
    );
create policy organizations_insert_authenticated on public.organizations
    for insert to authenticated with check (owner_id = auth.uid());
create policy organizations_update_owner on public.organizations
    for update to authenticated using (owner_id = auth.uid());

-- memberships: un usuario ve las propias y las de organizaciones donde participa.
create policy memberships_select_own_org on public.memberships
    for select to authenticated using (
        user_id = auth.uid()
        or org_id in (select org_id from public.memberships where user_id = auth.uid())
    );

-- projects: visibles/creables por miembros de la organizacion.
create policy projects_select_org_member on public.projects
    for select to authenticated using (
        org_id in (select org_id from public.memberships where user_id = auth.uid())
    );
create policy projects_insert_org_member on public.projects
    for insert to authenticated with check (
        org_id in (select org_id from public.memberships where user_id = auth.uid())
    );

-- project_members: visibles para miembros del proyecto o de la organizacion duena.
create policy project_members_select on public.project_members
    for select to authenticated using (
        project_id in (
            select id from public.projects
            where org_id in (select org_id from public.memberships where user_id = auth.uid())
        )
        or user_id = auth.uid()
    );

-- project_repos / technologies / project_tech / problems / problem_tech:
-- legibles por cualquier miembro de la organizacion duena del proyecto.
create policy project_repos_select on public.project_repos
    for select to authenticated using (
        project_id in (
            select id from public.projects
            where org_id in (select org_id from public.memberships where user_id = auth.uid())
        )
    );

create policy technologies_select_authenticated on public.technologies
    for select to authenticated using (true);

create policy project_tech_select on public.project_tech
    for select to authenticated using (
        project_id in (
            select id from public.projects
            where org_id in (select org_id from public.memberships where user_id = auth.uid())
        )
    );

create policy problems_select on public.problems
    for select to authenticated using (
        project_id in (
            select id from public.projects
            where org_id in (select org_id from public.memberships where user_id = auth.uid())
        )
    );

create policy problem_tech_select on public.problem_tech
    for select to authenticated using (
        problem_id in (
            select p.id from public.problems p
            join public.projects pr on pr.id = p.project_id
            where pr.org_id in (select org_id from public.memberships where user_id = auth.uid())
        )
    );

-- matches: visibles para el retador y el oponente humano (si aplica).
create policy matches_select_participant on public.matches
    for select to authenticated using (
        challenger_id = auth.uid() or opponent_user_id = auth.uid()
    );

-- submissions: cada usuario ve solo las propias.
create policy submissions_select_own on public.submissions
    for select to authenticated using (user_id = auth.uid());
create policy submissions_insert_own on public.submissions
    for insert to authenticated with check (user_id = auth.uid());

-- code_embeddings: sin acceso directo desde el cliente (solo el backend, via service role).
