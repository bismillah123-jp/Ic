import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';
import { Stock } from '@/types';

export async function GET() {
  try {
    // Calculate yesterday's and today's date in YYYY-MM-DD format (UTC)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    // 1. Fetch yesterday's stock data
    const { data: yesterdayStock, error: fetchError } = await supabase
      .from('stock')
      .select('*')
      .eq('tanggal', yesterdayStr);

    if (fetchError) {
      throw new Error(`Failed to fetch yesterday's stock: ${fetchError.message}`);
    }

    if (!yesterdayStock || yesterdayStock.length === 0) {
        return NextResponse.json({ message: "No stock data from yesterday to reset." });
    }

    // 2. Prepare today's new stock records
    const todayStock: Omit<Stock, 'id'>[] = yesterdayStock.map(stock => ({
      nama_cabang: stock.nama_cabang,
      produk: stock.produk,
      stok_pagi: stock.stok_sekarang, // The core logic!
      stok_sekarang: stock.stok_sekarang,
      tanggal: todayStr,
    }));

    // 3. Insert today's new records
    const { error: insertError } = await supabase
      .from('stock')
      .insert(todayStock);

    if (insertError) {
        // Handle potential race condition where cron runs twice
        if (insertError.code === '23505') { // unique constraint violation
            return NextResponse.json({ message: "Today's stock has already been set." });
        }
        throw new Error(`Failed to insert today's stock: ${insertError.message}`);
    }

    return NextResponse.json({ message: "Stock reset successfully for today.", data: todayStock });

  } catch (err: any) {
    return new NextResponse(
      JSON.stringify({ error: 'Cron job failed', details: err.message }),
      { status: 500 }
    );
  }
}
