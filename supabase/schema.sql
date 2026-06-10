-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (one per auth user)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  full_name text not null,
  role text not null check (role in ('recipient', 'donor', 'foodbank', 'admin')),
  created_at timestamptz default now()
);

-- Recipient profiles (extra details for recipients)
create table recipient_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  household_size int not null default 1,
  num_children int not null default 0,
  dietary_restrictions text[] default '{}',
  allergies text[] default '{}',
  address text,
  city text,
  state text,
  zip text,
  verified boolean default false,
  anonymous_label text,
  created_at timestamptz default now()
);

-- Food banks
create table food_banks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  address text,
  city text,
  state text,
  zip text,
  phone text,
  approved boolean default false,
  service_area_zips text[] default '{}',
  created_at timestamptz default now()
);

-- Food requests
create table food_requests (
  id uuid primary key default uuid_generate_v4(),
  recipient_id uuid not null references profiles(id) on delete cascade,
  foodbank_id uuid references food_banks(id),
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'packed', 'delivered', 'cancelled')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Food request items
create table food_request_items (
  id uuid primary key default uuid_generate_v4(),
  request_id uuid not null references food_requests(id) on delete cascade,
  name text not null,
  category text not null,
  quantity int not null default 1,
  priority text not null default 'important'
    check (priority in ('essential', 'important', 'preferred')),
  fulfilled boolean default false,
  created_at timestamptz default now()
);

-- Donations
create table donations (
  id uuid primary key default uuid_generate_v4(),
  donor_id uuid not null references profiles(id) on delete cascade,
  amount int not null, -- cents
  type text not null check (type in ('one_time', 'monthly')),
  recipient_id uuid references profiles(id),
  bundle_id text,
  stripe_payment_id text,
  created_at timestamptz default now()
);

-- Row Level Security
alter table profiles enable row level security;
alter table recipient_profiles enable row level security;
alter table food_banks enable row level security;
alter table food_requests enable row level security;
alter table food_request_items enable row level security;
alter table donations enable row level security;

-- Profiles: users can read own, admins read all
create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Service role can insert profiles"
  on profiles for insert with check (true);

-- Recipient profiles: own read/write
create policy "Recipients manage own profile"
  on recipient_profiles for all using (auth.uid() = user_id);

-- Food banks: food bank users manage own, admins manage all
create policy "Foodbank users manage own"
  on food_banks for all using (auth.uid() = user_id);

-- Food requests: recipients manage own, food banks read assigned
create policy "Recipients manage own requests"
  on food_requests for all using (auth.uid() = recipient_id);

create policy "Foodbanks read assigned requests"
  on food_requests for select using (
    foodbank_id in (select id from food_banks where user_id = auth.uid())
  );

create policy "Foodbanks update assigned requests"
  on food_requests for update using (
    foodbank_id in (select id from food_banks where user_id = auth.uid())
  );

-- Food request items: follow parent request access
create policy "Read items for own requests"
  on food_request_items for select using (
    request_id in (select id from food_requests where recipient_id = auth.uid())
    or
    request_id in (
      select fr.id from food_requests fr
      join food_banks fb on fb.id = fr.foodbank_id
      where fb.user_id = auth.uid()
    )
  );

create policy "Recipients insert items"
  on food_request_items for insert with check (
    request_id in (select id from food_requests where recipient_id = auth.uid())
  );

-- Donations: donors manage own
create policy "Donors manage own donations"
  on donations for all using (auth.uid() = donor_id);

-- Trigger to keep updated_at current
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger food_requests_updated_at
  before update on food_requests
  for each row execute function handle_updated_at();
