'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Stock } from '@/types';

export default function HomePage() {
  const [stockData, setStockData] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial stock data
  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stock');
      if (!res.ok) {
        throw new Error('Gagal mengambil data stok');
      }
      const data: Stock[] = await res.json();
      setStockData(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle stock updates
  const handleUpdateStock = async (id: number, amount: number) => {
    const currentStock = stockData.find(s => s.id === id);
    if (!currentStock) return;

    // Optimistic UI update
    setStockData(prevData =>
      prevData.map(s =>
        s.id === id ? { ...s, stok_sekarang: s.stok_sekarang + amount } : s
      )
    );

    try {
      const res = await fetch('/api/stock/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, amount }),
      });

      if (!res.ok) {
        // Revert on failure
        setStockData(prevData =>
          prevData.map(s =>
            s.id === id ? { ...s, stok_sekarang: s.stok_sekarang - amount } : s
          )
        );
        throw new Error('Gagal memperbarui stok');
      }
      // The realtime subscription will handle the final state confirmation
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  // Initial fetch and real-time subscription
  useEffect(() => {
    fetchStock();

    const channel = supabase
      .channel('stock_changes')
      .on<Stock>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'stock' },
        (payload) => {
          // Update state with the new data from the payload
          setStockData(currentData =>
            currentData.map(item =>
              item.id === payload.new.id ? payload.new : item
            )
          );
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-slate-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Indah Cell</h1>
      <p className="text-lg text-gray-600 mb-8">Penghitung Stok HP Realtime</p>

      {loading && <p>Memuat data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {['Mbutoh', 'Soko'].map(branchName => {
            const branchData = stockData.find(s => s.nama_cabang === branchName);
            if (!branchData) {
              return (
                <div key={branchName} className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-2xl font-bold mb-4">{branchName}</h2>
                  <p className="text-gray-500">Data stok untuk hari ini tidak ditemukan.</p>
                </div>
              );
            }
            return (
              <div key={branchData.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">{branchData.nama_cabang}</h2>

                <div className="flex justify-around mb-6">
                    <div className="text-center">
                        <p className="text-sm text-gray-500">Stok Pagi</p>
                        <p className="text-3xl font-bold text-blue-600">{branchData.stok_pagi}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-500">Stok Sekarang</p>
                        <p className="text-5xl font-extrabold text-green-600">{branchData.stok_sekarang}</p>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t">
                    <p className="text-center text-sm mb-2 text-gray-600">Update Transaksi:</p>
                    <div className="flex justify-around gap-4">
                      <button
                        onClick={() => handleUpdateStock(branchData.id, -1)}
                        disabled={branchData.stok_sekarang <= 0}
                        className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:bg-red-300"
                      >
                        -1 Terjual
                      </button>
                      <button
                        onClick={() => handleUpdateStock(branchData.id, 1)}
                        className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        +1 Barang Datang
                      </button>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
