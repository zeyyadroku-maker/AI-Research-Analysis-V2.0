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

## 3. Enable Authentication Providers
### GitHub
1.  In your Supabase dashboard, go to **Authentication** -> **Providers**.
2.  Find **GitHub** and toggle it to **Enabled**.
3.  You will need a GitHub OAuth App. Go to [GitHub Developer Settings](https://github.com/settings/developers).
4.  Create a New OAuth App:
    -   **Homepage URL**: `http://localhost:3001` (or your production URL)
    -   **Authorization callback URL**: `https://<your-project-ref>.supabase.co/auth/v1/callback` (Find this in Supabase under Auth -> Providers -> GitHub)
5.  Copy the **Client ID** and **Client Secret** from GitHub to Supabase and click **Save**.

### Google
1.  Go to **Authentication** -> **Providers** -> **Google** and toggle it to **Enabled**.
2.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
3.  Create a new project and configure the **OAuth consent screen**.
4.  Go to **Credentials** -> **Create Credentials** -> **OAuth client ID**.
5.  Select **Web application**.
6.  Add `https://<your-project-ref>.supabase.co/auth/v1/callback` to **Authorized redirect URIs**.
7.  Copy the **Client ID** and **Client Secret** to Supabase and click **Save**.

### Email
1.  Go to **Authentication** -> **Providers** -> **Email** and ensure it is **Enabled**.
2.  (Optional) Configure SMTP settings if you want to send custom emails, otherwise Supabase handles it (with limits).

### Important: Redirect URLs
1.  In Supabase, go to **Authentication** -> **URL Configuration**.
2.  Add your **Production Vercel URL** (e.g., `https://your-app.vercel.app/auth/callback`) to the **Redirect URLs** list.
3.  Also add `http://localhost:3000/auth/callback` for local development.
4.  **Click Save**. Without this, redirects will fail or hang.

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

## 6. Update Schema for Authentication (Optional but Recommended)
If you want to support user authentication, run this additional SQL command in the SQL Editor:

```sql
alter table bookmarks add column if not exists user_id uuid references auth.users(id);
```

This links bookmarks to specific users.
