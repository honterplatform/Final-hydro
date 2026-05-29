-- Run this once in the Supabase SQL Editor

alter table event_signups add column if not exists company_name text;
alter table event_signups add column if not exists guests integer;
alter table event_signups add column if not exists tile_shop_customer_id text;
alter table event_signups add column if not exists special_requirements text;

alter table events add column if not exists show_tile_shop_id boolean default false;
