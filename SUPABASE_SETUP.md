# Supabase Setup Guide

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `Final-hydro` (or your preferred name)
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
6. Click "Create new project"

## Step 2: Get Your Supabase Credentials

1. Go to your project dashboard
2. Navigate to Settings → API
3. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Service Role Key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Create Environment Variables

Create a `.env` file in your project root with:

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 4: Set Up the Database Table

1. In your Supabase dashboard, go to the SQL Editor
2. Run this SQL to create the representatives table:

```sql
CREATE TABLE representatives (
  id SERIAL PRIMARY KEY,
  rep VARCHAR(255) NOT NULL,
  states JSONB NOT NULL,
  cta_url VARCHAR(500) DEFAULT '#',
  profile_image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Step 5: Configure Vercel Environment Variables

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add these variables:
   - `SUPABASE_URL` = your project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = your service role key
5. Make sure to add them for all environments (Production, Preview, Development)

## Step 6: Test the Connection

Your application should now be able to connect to Supabase! The API endpoints are already configured to use these environment variables.

## Database Schema

The `representatives` table has the following structure:
- `id`: Auto-incrementing primary key
- `rep`: Representative name (VARCHAR)
- `states`: Array of states they represent (JSONB)
- `cta_url`: Call-to-action URL (VARCHAR)
- `profile_image`: Profile image URL (TEXT)
- `created_at`: Timestamp when record was created
