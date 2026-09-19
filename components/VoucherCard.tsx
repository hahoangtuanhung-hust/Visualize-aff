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

const SHOPEE_VOUCHER_URL = "https://shopee.vn/user/voucher-wallet";
const SHOPEE_ANDROID_INTENT =
  "intent://shopee.vn/user/voucher-wallet#Intent;scheme=https;package=com.shopee.vn;S.browser_fallback_url=https%3A%2F%2Fshopee.vn%2Fuser%2Fvoucher-wallet;end";

function copyWithSelection(value: string) {
  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.setAttribute("readonly", "");
  textArea.setAttribute("aria-hidden", "true");
  textArea.style.position = "fixed";
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.width = "1px";
  textArea.style.height = "1px";
  textArea.style.opacity = "0";
  textArea.style.fontSize = "16px";
  document.body.appendChild(textArea);

  try {
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, value.length);
    return document.execCommand("copy");
  } finally {
    document.body.removeChild(textArea);
  }
}

function openShopee() {
  const userAgent = navigator.userAgent;
  const isAndroid = /Android/i.test(userAgent);
  const supportsAndroidIntent =
    /Chrome\/\d+|SamsungBrowser\/\d+/i.test(userAgent) &&
    !/; wv\)/i.test(userAgent);
  const isIOS =
    /iPhone|iPad|iPod/i.test(userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isAndroid && supportsAndroidIntent) {
    try {
      window.location.assign(SHOPEE_ANDROID_INTENT);
    } catch {
      window.location.assign(SHOPEE_VOUCHER_URL);
    }
    return;
  }

  if (isAndroid) {
    window.location.assign(SHOPEE_VOUCHER_URL);
    return;
  }

  if (isIOS) {
    window.location.assign(SHOPEE_VOUCHER_URL);
    return;
  }

  const openedWindow = window.open(
    SHOPEE_VOUCHER_URL,
    "_blank",
    "noopener,noreferrer"
  );

  if (!openedWindow) {
    window.location.assign(SHOPEE_VOUCHER_URL);
  }
}

export function VoucherCard({ voucher, onUpdate, onDelete }: VoucherCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    code: voucher.code,
    detail: voucher.detail,
    tag: voucher.tag,
  });

  const handleCopyAndRedirect = () => {
    let copied = false;

    try {
      copied = copyWithSelection(voucher.code);
    } catch {
      copied = false;
    }

    if (!copied && navigator.clipboard && window.isSecureContext) {
      try {
        void navigator.clipboard.writeText(voucher.code).catch(() => undefined);
        copied = true;
      } catch {
        copied = false;
      }
    }

    if (copied) {
      toast.success(`Đã copy mã ${voucher.code}!`, {
        description: "Đang mở ví Voucher Shopee...",
      });
    } else {
      toast.success(`Mã: ${voucher.code}`, {
        description: "Đang mở Shopee...",
      });
    }

    openShopee();
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
          <Button onClick={handleSave} className="flex-1 h-11">
            <Check className="w-4 h-4 mr-1" aria-hidden="true" /> Lưu
          </Button>
          <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1 h-11">
            <X className="w-4 h-4 mr-1" aria-hidden="true" /> Hủy
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative group flex flex-col justify-between">
      <div className="absolute right-2 top-2 md:opacity-0 opacity-100 group-hover:opacity-100 transition-opacity flex gap-2 p-1 rounded-lg">
        <button
          type="button"
          aria-label={`Sửa mã ${voucher.code}`}
          title="Sửa mã"
          className="inline-flex items-center justify-center rounded-md bg-white border border-gray-200 shadow-sm text-gray-500 active:bg-gray-100"
          style={{ width: "48px", height: "48px", minWidth: "48px", minHeight: "48px", padding: 0 }}
          onClick={() => setIsEditing(true)}
        >
          <Edit2 className="w-4 h-4" aria-hidden="true" />
        </button>
        {onDelete && (
          <button
            type="button"
            aria-label={`Xóa mã ${voucher.code}`}
            title="Xóa mã"
            className="inline-flex items-center justify-center rounded-md bg-white border border-gray-200 shadow-sm text-red-500 active:bg-red-50"
            style={{ width: "48px", height: "48px", minWidth: "48px", minHeight: "48px", padding: 0 }}
            onClick={() => onDelete(voucher.id)}
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3 pr-28">
          <Badge variant={voucher.tag === "Mã acc mới" ? "destructive" : "secondary"}>
            <TagIcon className="w-3 h-3 mr-1" aria-hidden="true" />
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

        <button
          type="button"
          className="w-full font-semibold inline-flex items-center justify-center rounded-lg text-white text-sm active:opacity-80"
          style={{ backgroundColor: 'var(--primary, #ee4d2d)', height: '48px', minHeight: '48px', padding: '0 16px', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
          onClick={handleCopyAndRedirect}
        >
          <Copy className="w-4 h-4" style={{ marginRight: "8px" }} aria-hidden="true" />
          Lưu mã
        </button>
      </div>
    </div>
  );
}
