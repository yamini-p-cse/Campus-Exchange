do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'listing_messages'
    ) then
    alter publication supabase_realtime add table public.listing_messages;
  end if;
end;
$$;