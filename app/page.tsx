"use client";

import { useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { VoucherCard } from "@/components/VoucherCard";
import { AffiliateWidget } from "@/components/AffiliateWidget";
import { MOCK_VOUCHERS, VoucherItem } from "@/data/mockVouchers";
import { AddVoucherModal } from "@/components/AddVoucherModal";
import { Store, ShieldCheck } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("Tất cả");

  const [vouchers, setVouchers] = useLocalStorage<VoucherItem[]>("shopee_vouchers", MOCK_VOUCHERS);

  const filteredVouchers = vouchers.filter((voucher: VoucherItem) => {
    const matchesSearch =
      voucher.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voucher.detail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = selectedTag === "Tất cả" || voucher.tag === selectedTag;

    return matchesSearch && matchesTag;
  });

  const handleAddVoucher = (newVoucher: VoucherItem) => {
    setVouchers([newVoucher, ...vouchers]);
  };

  const handleUpdateVoucher = (id: string, updatedFields: Partial<VoucherItem>) => {
    setVouchers(
      vouchers.map((v) => (v.id === id ? { ...v, ...updatedFields } : v))
    );
  };

  const handleDeleteVoucher = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa mã giảm giá này?")) {
      setVouchers(vouchers.filter((v) => v.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <Store className="w-7 h-7" />
            Shopee Voucher Hub
          </div>
          <div className="hidden md:flex items-center text-sm font-medium text-muted-foreground gap-1">
            <ShieldCheck className="w-5 h-5 text-green-500" />
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-32">
          {filteredVouchers.length > 0 ? (
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
