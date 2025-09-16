'use client';

import { useEffect, useState } from 'react';
import { StockHistory } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockId: number | null;
  branchName: string | null;
}

export function HistoryModal({ isOpen, onClose, stockId, branchName }: HistoryModalProps) {
  const [history, setHistory] = useState<StockHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && stockId) {
      const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch(`/api/stock/history?stock_id=${stockId}`);
          if (!res.ok) {
            throw new Error('Gagal mengambil data riwayat.');
          }
          const data = await res.json();
          setHistory(data);
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [isOpen, stockId]);

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Riwayat Transaksi untuk {branchName}</DialogTitle>
      </DialogHeader>
      <DialogContent>
        {loading && <p>Memuat riwayat...</p>}
        {error && <p className="text-destructive">{error}</p>}
        {!loading && !error && history.length === 0 && (
          <p className="text-muted-foreground">Tidak ada riwayat transaksi ditemukan.</p>
        )}
        {!loading && !error && history.length > 0 && (
          <div className="max-h-96 overflow-y-auto">
            <ul className="space-y-4">
              {history.map((item) => (
                <li key={item.id} className="flex items-center justify-between p-2 rounded-md bg-accent/50">
                  <div>
                    <p className="font-mono text-sm">
                      {new Date(item.created_at).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Stok: {item.stok_sebelum} &rarr; {item.stok_sesudah}
                    </p>
                  </div>
                  <span
                    className={`font-bold text-lg ${
                      item.perubahan > 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {item.perubahan > 0 ? `+${item.perubahan}` : item.perubahan}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
