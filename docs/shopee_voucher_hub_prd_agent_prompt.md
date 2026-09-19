# SYSTEM PROMPT & SPECIFICATION: SHOPEE VOUCHER SHARING & REDIRECT PLATFORM

## 1. TỔNG QUAN DỰ ÁN (OVERVIEW)
Xây dựng ứng dụng web tiện ích cho phép cộng đồng/admin đăng tải và tra cứu mã giảm giá Shopee theo tag/danh mục. Điểm cốt lõi là tính năng: khi người dùng bấm **"Lưu mã"**, hệ thống sẽ tự động sao chép mã voucher vào clipboard và kích hoạt deep link/URL điều hướng trực tiếp người dùng vào màn hình **"Shopee Voucher / Nhập mã giảm giá"** trên ứng dụng Shopee (hoặc website Shopee nếu dùng desktop). Đồng thời tích hợp khu vực affiliate marketing hỗ trợ 2 người chia sẻ link.

---

## 2. PHÂN TÍCH KHẢ THI KỸ THUẬT (TECHNICAL FEASIBILITY)

### 2.1. Về cơ chế "Tự động lưu mã vào Shopee"
> **Lưu ý kỹ thuật:** Shopee không cung cấp API public mở cho phép bên thứ ba ghi trực tiếp mã giảm giá vào tài khoản ví voucher cá nhân của người dùng (vì lý do bảo mật và xác thực phiên đăng nhập).

**Giải pháp UX tối ưu nhất hiện nay (Best Practice):**
1. **Clipboard Copy:** Khi người dùng bấm nút "Lưu mã", mã voucher lập tức được sao chép vào bộ nhớ tạm (Clipboard API).
2. **Deep Linking:** Web tự động kích hoạt liên kết điều hướng trực tiếp vào ứng dụng Shopee (trên di động) hoặc URL trang nhập voucher (trên PC/Web).
   * **Custom Scheme / App Link Shopee VN:**
     * `shopeevn://` hoặc Shopee Universal Link: `https://shopee.vn/user/voucher-wallet` / `https://shopee.vn/m/ma-giam-gia`
     * Trang nhập voucher Shopee Web: `https://shopee.vn/user/voucher-wallet`
3. **Hiển thị Toast:** Thông báo: *"Đã sao chép mã [CODE]! Đang mở Shopee, bạn chỉ cần bấm Dán (Paste) để lưu mã."*

---

## 3. CÁC TÍNH NĂNG CHÍNH (KEY FEATURES)

### 3.1. Quản lý & Đăng tải Voucher (Form nhập)
- **Mã voucher (Coupon Code):** Chuỗi ký tự (VD: `SHOPEEPAY20K`, `ELHA10`).
- **Chi tiết / Mô tả (Description):** Điều kiện áp dụng, hạn mức đơn tối thiểu, mức giảm tối đa.
- **Tag / Nhãn lọc:** 
  * Ví dụ: `Freeship`, `Điện tử`, `Thời trang`, `Đời sống`, `ShopeePay`, `Toàn sàn`, `Khung giờ vàng (0h, 9h, 12h, 21h)`.
- **Hạn dùng (Expiry date):** Thời gian hết hạn của voucher.
- **Link đích (Optional):** Link sản phẩm/ngành hàng áp dụng voucher.

### 3.2. Hiển thị & Tương tác (Voucher Feed/Grid)
- Bộ lọc theo Tag / Tìm kiếm theo từ khóa.
- Thẻ voucher trực quan gồm: Mã, mô tả, badge tag, countdown/hạn dùng.
- **Nút "Lưu mã" (Copy & Redirect):**
  1. `navigator.clipboard.writeText(code)`
  2. Hiển thị toast thông báo thành công.
  3. Kích hoạt chuyển hướng sang Shopee Voucher Wallet (Deep link / Universal link).

### 3.3. Module Affiliate (Chia sẻ Link của 2 Người)
- Thiết kế 1 khu vực (Banner/Header bar/Widget nổi) cố định hoặc đặt ở vị trí nổi bật:
  * **Slot 1 (Người A):** Tên/Biệt danh + Lời kêu gọi (CTA) + Link affiliate cá nhân (Shopee Affiliate).
  * **Slot 2 (Người B):** Tên/Biệt danh + Lời kêu gọi (CTA) + Link affiliate cá nhân.
- **Cơ chế phân phối (Tùy chọn):**
  * Hiển thị song song cả 2 link rõ ràng để người dùng tự chọn ủng hộ.
  * Hoặc luân phiên phân phối 50/50 (A/B testing) khi người dùng bấm vào các nút mua hàng chung.

---

## 4. CÔNG NGHỆ ĐỀ XUẤT (TECH STACK RECOMMENDATION)

- **Frontend:** Next.js (React) + Tailwind CSS + Lucide Icons + Shadcn UI.
- **Backend / Database:** 
  * Tùy chọn 1 (Đơn giản, nhanh): Supabase hoặc Firebase (Firestore).
  * Tùy chọn 2 (Static/Serverless): SQLite + Prisma với Next.js API Routes.
- **Quản trị:** Trang Admin đơn giản có mật khẩu để duyệt/thêm/xóa mã voucher nhanh.

---

## 5. KỊCH BẢN PROMPT DÀNH CHO AI AGENT THỰC HIỆN DỰ ÁN

```text
Bạn là một Fullstack Web Developer giàu kinh nghiệm. Hãy xây dựng một ứng dụng web Responsive hoàn chỉnh có tên "Shopee Voucher Hub" với các yêu cầu kỹ thuật chi tiết sau:

### Yêu cầu chức năng:
1. GIAO DIỆN & DANH SÁCH MÃ:
   - Hiển thị danh sách voucher dạng lưới (Grid/Card) hiện đại phong cách Shopee (Cam/Trắng/Xám nhạt).
   - Bộ lọc theo Tag (Tất cả, Freeship, ShopeePay, Điện tử, Hoàn xu...) và thanh tìm kiếm từ khóa.
   - Thẻ voucher gồm: Mã giảm giá, điều kiện áp dụng, nhãn tag, hạn dùng và nút "Lưu mã".

2. CƠ CHẾ NÚT "LƯU MÃ":
   - Khi click nút "Lưu mã":
     a. Tự động sao chép mã vào Clipboard của thiết bị (navigator.clipboard).
     b. Bật Modal/Toast ngắn: "Đã copy mã [CODE]! Đang chuyển đến ví Voucher Shopee để dán...".
     c. Tự động mở Deep link Shopee trên mobile: `shopeevn://` hoặc URL `https://shopee.vn/user/voucher-wallet` trong tab mới.

3. FORM NHẬP VOUCHER:
   - Form modal hoặc trang nhập liệu bao gồm: Mã giảm giá, mô tả chi tiết, chọn tag, ngày hết hạn, link Shopee áp dụng (tùy chọn).
   - Validation cơ bản (không để trống mã, định dạng ngày tháng).

4. KHU VỰC AFFILIATE 2 NGƯỜI:
   - Tạo một Widget/Banner nổi bật có tiêu đề "Ủng hộ Admin qua Shopee Mall":
     - Nút 1: Link Affiliate Người A (kèm icon/avatar/tên gợi nhớ).
     - Nút 2: Link Affiliate Người B (kèm icon/avatar/tên gợi nhớ).
   - Có thể cấu hình trực tiếp 2 URL này trong file config hoặc biến môi trường (.env).

### Yêu cầu kiến trúc code:
- Sử dụng React/Next.js (App Router) với Tailwind CSS.
- Quản lý state voucher sạch sẽ, viết component module hóa (VoucherCard, FilterBar, AffiliateWidget, AddVoucherModal).
- Đảm bảo responsive tối ưu trên cả Smartphone và Desktop.
```