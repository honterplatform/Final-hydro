-- Run this once in the Supabase SQL Editor

alter table events add column if not exists event_end_time time;
