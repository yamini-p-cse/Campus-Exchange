create table public.listing_messages (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  recipient_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now(),
  constraint listing_messages_distinct_participants check (sender_id <> recipient_id)
);

create index listing_messages_listing_created_idx
  on public.listing_messages (listing_id, created_at);

alter table public.listing_messages enable row level security;

create policy "Conversation participants can read messages"
  on public.listing_messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Students can message a listing seller"
  on public.listing_messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1
      from public.listings as item
      where item.id = listing_id
        and (
          item.seller_id = recipient_id
          or (
            item.seller_id = sender_id
            and exists (
              select 1
              from public.listing_messages as prior
              where prior.listing_id = item.id
                and prior.sender_id = recipient_id
                and prior.recipient_id = sender_id
            )
          )
        )
    )
  );