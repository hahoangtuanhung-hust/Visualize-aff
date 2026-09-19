"use client";

import { useState } from "react";
import { VoucherItem, VoucherTag } from "@/data/mockVouchers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Edit2, Check, X, Tag as TagIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface VoucherCardProps {
  voucher: VoucherItem;
  onUpdate: (id: string, updated: Partial<VoucherItem>) => void;
  onDelete?: (id: string) => void;
}

export function VoucherCard({ voucher, onUpdate, onDelete }: VoucherCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    code: voucher.code,
    detail: voucher.detail,
    tag: voucher.tag,
  });

  const handleCopyAndRedirect = async () => {
    try {
      await navigator.clipboard.writeText(voucher.code);
      toast.success(`Đã copy mã ${voucher.code}!`, {
        description: "Đang chuyển đến ví Voucher Shopee...",
      });

      // Deep link to Shopee app voucher wallet
      setTimeout(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = "https://shopee.vn/user/voucher-wallet";
        } else {
          window.open("https://shopee.vn/user/voucher-wallet", "_blank");
        }
      }, 800);
    } catch (err) {
      toast.error("Lỗi", {
        description: "Không thể copy mã. Vui lòng thử lại.",
      });
    }
  };

  const handleSave = () => {
    if (!editForm.code || !editForm.detail) {
      toast.error("Vui lòng nhập đủ thông tin.");
      return;
    }
    onUpdate(voucher.id, {
      ...editForm,
      updatedAt: Date.now(),
    });
    setIsEditing(false);
    toast.success("Đã cập nhật mã giảm giá!");
  };

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-orange-200 dark:border-gray-800 rounded-xl p-4 shadow-sm space-y-3 relative">
        <h3 className="font-semibold text-primary mb-2">Sửa Mã Giảm Giá</h3>
        <Input 
          value={editForm.code}
          onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })}
          placeholder="Mã Voucher (chữ hoa, số)"
          className="uppercase"
        />
        <Select 
          value={editForm.tag} 
          onValueChange={(val) => setEditForm({ ...editForm, tag: val as VoucherTag })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Mã acc mới">Mã acc mới</SelectItem>
            <SelectItem value="Mã acc cũ">Mã acc cũ</SelectItem>
          </SelectContent>
        </Select>
        <Textarea 
          value={editForm.detail}
          onChange={(e) => setEditForm({ ...editForm, detail: e.target.value })}
          placeholder="Chi tiết mã..."
          className="resize-none"
        />
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} className="flex-1 h-9">
            <Check className="w-4 h-4 mr-1" /> Lưu
          </Button>
          <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1 h-9">
            <X className="w-4 h-4 mr-1" /> Hủy
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative group flex flex-col justify-between">
      <div className="absolute right-2 top-2 md:opacity-0 opacity-100 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-1 rounded-lg border shadow-sm">
        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground" onClick={() => setIsEditing(true)}>
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
        {onDelete && (
          <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => onDelete(voucher.id)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3 pr-16">
          <Badge variant={voucher.tag === "Mã acc mới" ? "destructive" : "secondary"}>
            <TagIcon className="w-3 h-3 mr-1" />
            {voucher.tag}
          </Badge>
        </div>
        
        <div className="border-2 border-dashed border-primary/30 bg-orange-50/50 dark:bg-orange-950/10 rounded-lg p-3 mb-3 text-center">
          <span className="font-mono font-bold text-xl tracking-wider text-primary">
            {voucher.code}
          </span>
        </div>

        <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {voucher.detail}
        </p>
      </div>

      <div>
        <div className="text-xs text-muted-foreground mb-3">
          Cập nhật {formatDistanceToNow(voucher.updatedAt, { locale: vi, addSuffix: true })}
        </div>

        <Button 
          className="w-full font-semibold group/btn" 
          onClick={handleCopyAndRedirect}
        >
          <Copy className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
          Lưu mã
        </Button>
      </div>
    </div>
  );
}
