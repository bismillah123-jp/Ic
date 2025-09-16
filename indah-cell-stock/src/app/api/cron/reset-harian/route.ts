import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // 1. Secure the endpoint
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // 2. Call the database function
    const { data, error } = await supabase.rpc('create_daily_stock_entries');

    if (error) {
      throw new Error(`RPC call failed: ${error.message}`);
    }

    // The function returns a text message, e.g., "Created 2 new daily stock entries."
    return NextResponse.json({ message: data });

  } catch (err: unknown) {
    let errorMessage = 'An unknown error occurred';
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    console.error('Cron job /api/cron/reset-harian failed:', errorMessage);
    return new NextResponse(
      JSON.stringify({ error: 'Cron job failed', details: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
