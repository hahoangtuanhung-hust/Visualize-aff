export type VoucherTag = 'Mã acc mới' | 'Mã acc cũ';

export interface VoucherItem {
  id: string;
  code: string;
  detail: string;
  tag: VoucherTag;
  updatedAt: number;
}

export const MOCK_VOUCHERS: VoucherItem[] = [
  {
    id: "1",
    code: "NEWBIE50K",
    detail: "Giảm 50K cho đơn từ 0Đ (Chỉ áp dụng cho tài khoản mới đăng ký).",
    tag: "Mã acc mới",
    updatedAt: Date.now() - 100000,
  },
  {
    id: "2",
    code: "WELCOMEBACK",
    detail: "Hoàn 100% xu tối đa 50K cho khách hàng quay lại mua sắm.",
    tag: "Mã acc cũ",
    updatedAt: Date.now() - 50000,
  },
  {
    id: "3",
    code: "MEMBER20",
    detail: "Giảm 20% tối đa 100K cho mọi đơn hàng (Dành cho thành viên cũ).",
    tag: "Mã acc cũ",
    updatedAt: Date.now() - 20000,
  }
];

export const VOUCHER_TAGS: ("Tất cả" | VoucherTag)[] = [
  "Tất cả",
  "Mã acc mới",
  "Mã acc cũ",
];
