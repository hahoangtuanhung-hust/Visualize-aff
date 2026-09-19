"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LoaderCircle, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { VoucherItem, VoucherTag } from "@/data/mockVouchers";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  code: z
    .string()
    .min(2, { message: "Mã giảm giá phải có ít nhất 2 ký tự." })
    .regex(/^[A-Z0-9]+$/, { message: "Mã chỉ chứa chữ hoa và số, không dấu, không khoảng trắng." }),
  detail: z.string().min(10, { message: "Mô tả cần chi tiết hơn." }),
  tag: z.enum(["Mã acc mới", "Mã acc cũ"] as const, { required_error: "Vui lòng chọn danh mục." }),
});

interface AddVoucherModalProps {
  onAdd: (voucher: VoucherItem) => Promise<void>;
}

function createVoucher(values: z.infer<typeof formSchema>): VoucherItem {
  const timestamp = Date.now();

  return {
    id: `${timestamp.toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
    code: values.code,
    detail: values.detail,
    tag: values.tag as VoucherTag,
    updatedAt: timestamp,
  };
}

export function AddVoucherModal({ onAdd }: AddVoucherModalProps) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isSaving) setOpen(nextOpen);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      detail: "",
      tag: "Mã acc mới",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const newVoucher = createVoucher(values);

    setIsSaving(true);
    try {
      await onAdd(newVoucher);
      toast.success("Đã lưu lên Firebase!", {
        description: `Voucher ${values.code} đã được thêm.`,
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
      toast.error("Chưa thể lưu voucher lên Firebase. Dữ liệu vẫn được giữ để bạn thử lại.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <button
            type="button"
            aria-label="Thêm mã giảm giá"
            title="Thêm mã giảm giá"
            className="floating-add-button rounded-full shadow-2xl fixed z-50 inline-flex items-center justify-center text-white font-semibold active:opacity-80"
            style={{ backgroundColor: "var(--primary, #ee4d2d)", width: "56px", height: "56px", minWidth: "56px", minHeight: "56px", WebkitTapHighlightColor: "transparent", touchAction: "manipulation", border: "none", padding: 0 }}
          >
            <Plus className="w-6 h-6" aria-hidden="true" />
          </button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm Mã Giảm Giá Mới</DialogTitle>
          <DialogDescription>
            Đóng góp mã giảm giá bạn biết để chia sẻ với cộng đồng.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã giảm giá (Code)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="VD: SHOPEEPAY20K" 
                      className="uppercase" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phân loại Tag</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn một thẻ tag" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Mã acc mới">Mã acc mới</SelectItem>
                      <SelectItem value="Mã acc cũ">Mã acc cũ</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="detail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chi tiết / Mô tả</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Điều kiện áp dụng, giảm bao nhiêu, đơn tối thiểu..." 
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSaving} aria-busy={isSaving}>
                {isSaving && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {isSaving ? "Đang lưu..." : "Thêm mã"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
