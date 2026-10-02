create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Student',
  created_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  category text not null,
  item_condition text not null,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.listings enable row level security;

create policy "Profiles are visible to students"
  on public.profiles for select
  using (true);

create policy "Students can create their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Students can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Listings are visible to everyone"
  on public.listings for select
  using (true);

create policy "Students can create their own listings"
  on public.listings for insert
  with check (auth.uid() = seller_id);

create policy "Students can update their own listings"
  on public.listings for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

create policy "Students can delete their own listings"
  on public.listings for delete
  using (auth.uid() = seller_id);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'Student'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();