# Supabase Setup Guide

Follow these steps to connect your application to Supabase for server-side data storage.

## 1. Create a Supabase Project
1.  Go to [database.new](https://database.new) and sign in with GitHub.
2.  Create a new project (e.g., "Research Analysis").
3.  Set a database password and choose a region close to you.
4.  Wait for the project to finish setting up.

## 2. Get API Keys
1.  In your project dashboard, go to **Settings** (cog icon) -> **API**.
2.  Find the **Project URL** and **anon public** key.
3.  Copy these values.

## 3. Configure Environment Variables
1.  Open your `.env.local` file (or create it if it doesn't exist).
2.  Add the following lines, replacing the placeholders with your actual values:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 4. Create Database Table
1.  In your Supabase dashboard, go to the **SQL Editor** (terminal icon on the left).
2.  Click **New Query**.
3.  Copy and paste the entire content of the `supabase_schema.sql` file from your project root.
4.  Click **Run**.

## 5. Verify Connection
1.  Restart your development server: `npm run dev`.
2.  Go to the application and try to bookmark a paper.
3.  Check the **Table Editor** in Supabase to see if the data appears in the `bookmarks` table.

## Troubleshooting
- **Bookmarks not saving?** Check your browser console for errors. Ensure your environment variables are correct and you restarted the server.
- **RLS Errors?** If you see "permission denied", check the policies in the SQL Editor. The provided schema enables public access for simplicity, but you can adjust this later.
