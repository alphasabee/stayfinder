-- ============================================================
-- SpaceFinder — Supabase Schema
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- 1. PROFILES (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text check (role in ('guest', 'host')) default 'guest',
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'guest')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. PROPERTIES
create table public.properties (
  id uuid default gen_random_uuid() primary key,
  host_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  location text,
  city text,
  country text,
  price numeric not null,
  max_guests int default 2,
  bedrooms int default 1,
  bathrooms int default 1,
  photos text[] default '{}',
  amenities text[] default '{}',
  available boolean default true,
  created_at timestamptz default now()
);

-- 3. BOOKINGS
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  guest_id uuid references public.profiles(id) on delete cascade not null,
  check_in date not null,
  check_out date not null,
  guests int default 1,
  total_price numeric not null,
  status text check (status in ('pending', 'confirmed', 'cancelled')) default 'pending',
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.bookings enable row level security;

-- PROFILES
create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- PROPERTIES: anyone can read available ones
create policy "Anyone can view available properties"
  on public.properties for select using (available = true);

create policy "Hosts can view all their properties"
  on public.properties for select using (auth.uid() = host_id);

create policy "Hosts can insert properties"
  on public.properties for insert with check (auth.uid() = host_id);

create policy "Hosts can update their properties"
  on public.properties for update using (auth.uid() = host_id);

create policy "Hosts can delete their properties"
  on public.properties for delete using (auth.uid() = host_id);

-- BOOKINGS
create policy "Guests can view their own bookings"
  on public.bookings for select using (auth.uid() = guest_id);

create policy "Hosts can view bookings for their properties"
  on public.bookings for select using (
    auth.uid() in (select host_id from public.properties where id = property_id)
  );

create policy "Guests can create bookings"
  on public.bookings for insert with check (auth.uid() = guest_id);

create policy "Guests can cancel their own bookings"
  on public.bookings for update using (auth.uid() = guest_id);

create policy "Hosts can update booking status"
  on public.bookings for update using (
    auth.uid() in (select host_id from public.properties where id = property_id)
  );
