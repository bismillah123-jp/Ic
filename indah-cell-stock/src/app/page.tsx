'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Stock } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { HistoryModal } from '@/components/HistoryModal';

export default function HomePage() {
  const [stockData, setStockData] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [currentStockId, setCurrentStockId] = useState<number | null>(null);
  const [currentBranchName, setCurrentBranchName] = useState<string | null>(null);


  const fetchStock = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stock')
        .select('*')
        .order('tanggal', { ascending: false })
        .limit(2);

      if (error) throw error;

      const latestData = Array.from(new Map(data.map(item => [item.nama_cabang, item])).values());
      setStockData(latestData);

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

  const handleUpdateStock = async (id: number, amount: number) => {
    const originalStock = [...stockData];
    const currentStock = stockData.find(s => s.id === id);
    if (!currentStock) return;

    // Optimistic UI update
    setStockData(prevData =>
      prevData.map(s =>
        s.id === id ? { ...s, stok_sekarang: s.stok_sekarang + amount } : s
      )
    );

    // Call the backend API
    try {
      const res = await fetch('/api/stock/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, amount }),
      });

      if (!res.ok) {
        throw new Error('Gagal memperbarui stok di server.');
      }
    } catch {
        setError('Gagal memperbarui stok. Memulihkan data.');
        // Revert on failure
        setStockData(originalStock);
    }
  };

  const openHistoryModal = (stockId: number, branchName: string) => {
    setCurrentStockId(stockId);
    setCurrentBranchName(branchName);
    setIsHistoryModalOpen(true);
  };

  useEffect(() => {
    fetchStock();

    const channel = supabase
      .channel('stock-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stock' },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_payload) => {
          fetchStock();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const renderStockCard = (branchName: 'Mbutoh' | 'Soko') => {
    const branchData = stockData.find(s => s.nama_cabang === branchName);

    if (!branchData) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>{branchName}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Data stok untuk hari ini tidak ditemukan.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card key={branchData.id} className="flex flex-col animate-fade-in-up" style={{ animationDelay: `${branchName === 'Mbutoh' ? 0.1 : 0.2}s` }}>
        <CardHeader>
          <CardTitle className="text-center text-2xl">{branchData.nama_cabang}</CardTitle>
          <CardDescription className="text-center">
            {new Date(branchData.tanggal).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Stok Pagi</p>
              <p className="text-4xl font-bold">{branchData.stok_pagi}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Stok Sekarang</p>
              <p className="text-6xl font-extrabold text-primary">{branchData.stok_sekarang}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
           <div className="flex w-full justify-around gap-2">
             <Button
                onClick={() => openHistoryModal(branchData.id, branchData.nama_cabang)}
                variant="ghost"
                className="w-full"
              >
                Riwayat
              </Button>
           </div>
          <div className="flex w-full justify-around gap-4 pt-4 border-t">
            <Button
              onClick={() => handleUpdateStock(branchData.id, -1)}
              disabled={branchData.stok_sekarang <= 0}
              variant="destructive"
              className="w-full"
            >
              -1 Terjual
            </Button>
            <Button
              onClick={() => handleUpdateStock(branchData.id, 1)}
              variant="secondary"
              className="w-full"
            >
              +1 Barang Datang
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <>
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        stockId={currentStockId}
        branchName={currentBranchName}
      />
      <div className="container py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
            Dashboard Stok
          </h1>
          <p className="text-muted-foreground md:text-xl">
            Monitor stok HP untuk semua cabang Indah Cell secara realtime.
          </p>
        </div>

        {loading && <p className="text-center">Memuat data stok...</p>}
        {error && <p className="text-center text-destructive">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
            {renderStockCard('Mbutoh')}
            {renderStockCard('Soko')}
          </div>
        )}
      </div>
    </>
  );
}
