"use client";

import { useCallback, useEffect, useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { VoucherCard } from "@/components/VoucherCard";
import { AffiliateWidget } from "@/components/AffiliateWidget";
import { VoucherItem } from "@/data/mockVouchers";
import { AddVoucherModal } from "@/components/AddVoucherModal";
import { LoaderCircle, RefreshCw, Store, ShieldCheck } from "lucide-react";
import {
  deleteVoucher,
  getVouchers,
  saveVoucher,
} from "@/lib/voucherRepository";
import { toast } from "sonner";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("Tất cả");

  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadVouchers = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);

    try {
      const nextVouchers = await getVouchers();
      setVouchers(nextVouchers);
      setLoadError(false);
    } catch (error) {
      console.error("Lỗi đồng bộ voucher từ Firebase:", error);
      setLoadError(true);
      if (showLoading) {
        toast.error("Chưa thể tải voucher từ Firebase. Vui lòng thử lại.");
      }
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialSync = window.setTimeout(() => {
      void loadVouchers();
    }, 0);

    const syncInterval = window.setInterval(() => {
      void loadVouchers(false);
    }, 60000);
    const syncOnFocus = () => void loadVouchers(false);
    window.addEventListener("focus", syncOnFocus);

    return () => {
      window.clearTimeout(initialSync);
      window.clearInterval(syncInterval);
      window.removeEventListener("focus", syncOnFocus);
    };
  }, [loadVouchers]);

  const filteredVouchers = vouchers.filter((voucher: VoucherItem) => {
    const matchesSearch =
      voucher.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voucher.detail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = selectedTag === "Tất cả" || voucher.tag === selectedTag;

    return matchesSearch && matchesTag;
  });

  const handleAddVoucher = async (newVoucher: VoucherItem) => {
    await saveVoucher(newVoucher);
    setVouchers((currentVouchers) => [newVoucher, ...currentVouchers]);
  };

  const handleUpdateVoucher = async (id: string, updatedFields: Partial<VoucherItem>) => {
    const currentVoucher = vouchers.find((voucher) => voucher.id === id);

    if (!currentVoucher) {
      throw new Error("Không tìm thấy voucher cần cập nhật.");
    }

    const updatedVoucher = { ...currentVoucher, ...updatedFields };
    await saveVoucher(updatedVoucher);
    setVouchers((currentVouchers) =>
      currentVouchers.map((voucher) =>
        voucher.id === id ? updatedVoucher : voucher
      )
    );
  };

  const handleDeleteVoucher = async (id: string) => {
    await deleteVoucher(id);
    setVouchers((currentVouchers) =>
      currentVouchers.filter((voucher) => voucher.id !== id)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <Store className="w-7 h-7" aria-hidden="true" />
            Shopee Voucher Hub
          </div>
          <div className="hidden md:flex items-center text-sm font-medium text-muted-foreground gap-1">
            <ShieldCheck className="w-5 h-5 text-green-500" aria-hidden="true" />
            Cộng đồng chia sẻ
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <AffiliateWidget />
        
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Mã Giảm Giá Mới Nhất
          </h1>
          <p className="text-muted-foreground">
            Lưu mã và sử dụng trực tiếp trên ứng dụng Shopee. Cập nhật mã của bạn cho mọi người cùng dùng!
          </p>
        </div>

        <FilterBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
        />

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-32"
          aria-busy={isLoading}
        >
          {isLoading ? (
            <div className="col-span-full py-12 flex items-center justify-center gap-2 text-muted-foreground" role="status">
              <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
              Đang tải voucher từ Firebase...
            </div>
          ) : loadError && vouchers.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              <p>Chưa thể kết nối Firebase.</p>
              <button
                type="button"
                className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border bg-white px-4 font-medium text-foreground active:bg-gray-100"
                onClick={() => void loadVouchers()}
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Thử lại
              </button>
            </div>
          ) : filteredVouchers.length > 0 ? (
            filteredVouchers.map((voucher) => (
              <VoucherCard 
                key={voucher.id} 
                voucher={voucher} 
                onUpdate={handleUpdateVoucher}
                onDelete={handleDeleteVoucher}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              <p>Không tìm thấy mã giảm giá nào phù hợp.</p>
            </div>
          )}
        </div>
      </main>

      <AddVoucherModal onAdd={handleAddVoucher} />
    </div>
  );
}
