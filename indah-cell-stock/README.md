# Indah Cell - Real-time Stock Counter

This is a simple, real-time web application to track mobile phone stock for two store branches: "Soko" and "Mbutoh". It is built with Next.js and uses Supabase for the database and real-time capabilities.

## Features

-   **Real-time Stock Updates:** Changes in stock are reflected instantly for all users without needing a page refresh.
-   **Daily Stock Rollover:** A cron job automatically sets the new day's opening stock to the previous day's closing stock.
-   **Branch-Specific Views:** Displays stock information for both "Soko" and "Mbutoh" branches.

---

## Project Setup

To run this project locally or deploy it, you need to set up a Supabase project and configure the environment variables.

### 1. Create a Supabase Project

-   Go to [supabase.com](https://supabase.com/) and create a new project.
-   Save your **Project URL** and **`anon` (public) key**. You will need these for the next step.

### 2. Set Up the Database Schema

-   In your Supabase project dashboard, go to the **SQL Editor**.
-   Open the `schema.sql` file from this repository.
-   Copy the entire content of `schema.sql` and paste it into the Supabase SQL Editor.
-   Click **"Run"** to create the `stock` table, set up policies, and enable real-time updates.

### 3. Configure Environment Variables

-   In the root of this project, you will find a file named `.env.example`.
-   Rename this file to `.env.local`.
-   Open `.env.local` and replace the placeholder values with your actual Supabase Project URL and Anon Key from Step 1.

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

### 4. Seed Initial Data (CRITICAL STEP)

The application needs an initial stock record to function. On the first day, you must manually insert the starting stock for each branch.

-   Go to the **SQL Editor** in your Supabase dashboard.
-   Run the following commands, **adjusting the `stok_pagi` and `stok_sekarang` values** to your actual starting inventory. Make sure the `tanggal` is today's date in `YYYY-MM-DD` format.

```sql
-- Replace YYYY-MM-DD with today's date, and 10 with the starting stock count.
INSERT INTO public.stock (nama_cabang, tanggal, stok_pagi, stok_sekarang)
VALUES ('Mbutoh', 'YYYY-MM-DD', 10, 10);

INSERT INTO public.stock (nama_cabang, tanggal, stok_pagi, stok_sekarang)
VALUES ('Soko', 'YYYY-MM-DD', 15, 15);
```

### 5. Install Dependencies and Run

-   Open your terminal, navigate to the project root, and install the dependencies:
    ```bash
    npm install
    ```
-   Run the development server:
    ```bash
    npm run dev
    ```
-   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---

## Known Limitations

-   **Single Product Type:** The current logic treats all phone stock as a single count per branch (e.g., "HP"). It does not differentiate between different models (e.g., iPhone 15 vs. Samsung S23). The database schema has a `produk` column that could be used for this in the future, but the application logic would need to be updated.
-   **Hardcoded Branch Names:** The branch names "Soko" and "Mbutoh" are currently hardcoded in the frontend. For a more dynamic system, this could be fetched from the database.
