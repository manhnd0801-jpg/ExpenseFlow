# Quy Trình Nghiệp Vụ Chi Tiết - Business Flow

**⚠️ LƯU Ý VỀ ENUM VALUES:**

Tất cả các giá trị type/status trong document này sử dụng **INTEGER** (số nguyên), KHÔNG phải string:

```typescript
// ✅ ĐÚNG - Sử dụng trong code
status = 1; // 1 = Active
type = 2; // 2 = Expense

// ❌ SAI - KHÔNG sử dụng
status = 'active';
type = 'expense';
```

**Enum Mapping Reference:**

- Status: 1=Active, 2=Paid/Completed, 3=Cancelled/Fully Paid, 4=Overdue
- Transaction Type: 1=Income, 2=Expense, 3=Transfer
- Debt Type: 1=Lending, 2=Borrowing
- Payment Status: 1=Pending, 2=Paid, 3=Overdue, 4=Skipped

Chi tiết đầy đủ xem tại: `02-DATABASE-DESIGN.md` Section 2.1

---

## 1. Quy Trình Đăng Ký & Đăng Nhập

### 1.1. Đăng Ký Tài Khoản

```
[Người dùng] → Nhập email, mật khẩu, tên
              ↓
[Hệ thống] → Kiểm tra email đã tồn tại?
              ├─ Có → Báo lỗi "Email đã được sử dụng"
              └─ Không → Tiếp tục
                         ↓
           Validate mật khẩu (min 8 ký tự, có chữ hoa, số)
              ├─ Fail → Báo lỗi "Mật khẩu không đủ mạnh"
              └─ Pass → Tiếp tục
                         ↓
           Mã hóa mật khẩu (bcrypt)
              ↓
           Lưu user vào database
              ↓
           Gửi email xác thực
              ↓
           Tạo JWT token
              ↓
           Trả về user + accessToken + refreshToken
              ↓
           Tự động tạo:
           - Danh mục mặc định
           - Tài khoản "Ví tiền mặt" mặc định
              ↓
[Response] → User được chuyển đến Dashboard
```

### 1.2. Đăng Nhập

```
[Người dùng] → Nhập email, mật khẩu
              ↓
[Hệ thống] → Tìm user theo email
              ├─ Không tìm thấy → "Email không tồn tại"
              └─ Tìm thấy → Kiểm tra mật khẩu
                             ├─ Sai → "Sai mật khẩu" (tăng count fail)
                             │        └─ Fail > 5 lần → Lock account 15 phút
                             └─ Đúng → Kiểm tra email verified?
                                        ├─ Chưa → "Vui lòng xác thực email"
                                        └─ Đã verify → Tạo JWT tokens
                                                        ↓
                                                   Cập nhật last_login_at
                                                        ↓
                                                   Trả về user + tokens
                                                        ↓
                                                   Chuyển đến Dashboard
```

### 1.3. Quên Mật Khẩu

```
[Người dùng] → Nhập email
              ↓
[Hệ thống] → Tìm user
              ├─ Không tìm thấy → Vẫn báo "Email đã được gửi" (security)
              └─ Tìm thấy → Tạo reset token (expire 1h)
                             ↓
                        Lưu token vào DB
                             ↓
                        Gửi email với link reset
                             ↓
                        Response success

[Người dùng] → Click link trong email
              ↓
[Hệ thống] → Verify token
              ├─ Expired/Invalid → "Link không hợp lệ"
              └─ Valid → Cho phép nhập mật khẩu mới
                          ↓
                     Hash mật khẩu mới
                          ↓
                     Cập nhật password
                          ↓
                     Xóa reset token
                          ↓
                     Gửi email thông báo đổi mật khẩu thành công
                          ↓
                     Chuyển đến trang đăng nhập
```

---

## 2. Quy Trình Quản Lý Giao Dịch

### 2.1. Thêm Giao Dịch Chi Tiêu

```
[Người dùng] → Click "Thêm giao dịch"
              ↓
[UI] → Hiển thị form
       - Chọn loại: Chi tiêu (mặc định)
       - Nhập số tiền
       - Chọn danh mục
       - Chọn tài khoản
       - Chọn ngày (mặc định: hôm nay)
       - Nhập ghi chú (optional)
       - Upload ảnh hóa đơn (optional)
              ↓
[Người dùng] → Submit form
              ↓
[Validation]
  - Số tiền > 0? → Fail → "Số tiền phải lớn hơn 0"
  - Đã chọn danh mục? → Fail → "Vui lòng chọn danh mục"
  - Đã chọn tài khoản? → Fail → "Vui lòng chọn tài khoản"
  - Ngày hợp lệ? → Fail → "Ngày không hợp lệ"
              ↓
[Business Logic]
  - Kiểm tra số dư tài khoản
    ├─ Số dư < Số tiền → Cảnh báo "Không đủ số dư"
    │                     └─ Cho phép tiếp tục? (Yes/No)
    └─ Đủ số dư → Tiếp tục
              ↓
  - BEGIN TRANSACTION
    ├─ Insert transaction vào DB
    ├─ Update account balance (balance - amount)
    ├─ Kiểm tra ngân sách
    │   └─ Nếu có ngân sách cho category
    │       └─ Tính % đã chi
    │           ├─ > 80% → Tạo notification cảnh báo
    │           └─ > 100% → Tạo notification vượt ngân sách
    ├─ Upload ảnh (nếu có) → S3/Cloudinary
    └─ COMMIT
              ↓
[Response]
  - Toast: "Thêm giao dịch thành công"
  - Refresh danh sách giao dịch
  - Cập nhật số dư tài khoản
  - Cập nhật dashboard summary
```

### 2.2. Chuyển Tiền Giữa Tài Khoản

```
[Người dùng] → Chọn "Chuyển tiền"
              ↓
[UI] → Form chuyển tiền
       - Từ tài khoản
       - Đến tài khoản
       - Số tiền
       - Ghi chú
              ↓
[Validation]
  - Từ tài khoản ≠ Đến tài khoản?
  - Số dư đủ?
              ↓
[Business Logic]
  - BEGIN TRANSACTION
    ├─ Tạo transaction type='transfer'
    │   - account_id = from_account
    │   - to_account_id = to_account
    ├─ Update balance:
    │   - From account: balance - amount
    │   - To account: balance + amount
    └─ COMMIT
              ↓
[Response]
  - "Chuyển tiền thành công"
  - Cập nhật số dư cả 2 tài khoản
```

### 2.3. Sửa Giao Dịch

```
[Người dùng] → Click vào giao dịch → Chọn "Sửa"
              ↓
[Hệ thống] → Load thông tin giao dịch cũ
              ↓
[UI] → Hiển thị form với data cũ
              ↓
[Người dùng] → Chỉnh sửa (số tiền, danh mục, v.v.)
              ↓
[Validation] → Giống flow thêm mới
              ↓
[Business Logic]
  - BEGIN TRANSACTION
    ├─ Lưu old_amount, old_account_id
    ├─ Nếu thay đổi số tiền hoặc tài khoản:
    │   ├─ Hoàn lại số dư cũ:
    │   │   old_account.balance + old_amount (expense)
    │   └─ Trừ số dư mới:
    │       new_account.balance - new_amount
    ├─ Update transaction
    ├─ Recheck budget warnings
    └─ COMMIT
              ↓
[Response]
  - "Cập nhật thành công"
  - Refresh UI
```

### 2.4. Xóa Giao Dịch

```
[Người dùng] → Click "Xóa" → Confirm modal
              ↓
[Hệ thống] → BEGIN TRANSACTION
              ├─ Hoàn lại số dư tài khoản
              │   - Nếu expense: balance + amount
              │   - Nếu income: balance - amount
              ├─ Soft delete transaction (hoặc hard delete)
              ├─ Recheck budget status
              └─ COMMIT
              ↓
[Response]
  - "Đã xóa giao dịch"
  - Refresh danh sách
```

---

## 3. Quy Trình Quản Lý Ngân Sách

### 3.1. Tạo Ngân Sách

```
[Người dùng] → Nhập thông tin ngân sách
              - Tên
              - Danh mục (optional - nếu không chọn = tổng ngân sách)
              - Số tiền
              - Kỳ hạn: Tháng/Quý/Năm
              - Ngưỡng cảnh báo (mặc định 80%)
              ↓
[Validation]
  - Số tiền > 0?
  - Ngày bắt đầu < Ngày kết thúc?
  - Kiểm tra trùng lặp (cùng category, cùng kỳ)?
              ↓
[Hệ thống] → Lưu budget vào DB
              ↓
           Tính toán chi tiêu hiện tại trong kỳ
              ↓
           Tính % đã sử dụng
              ↓
           Nếu đã > ngưỡng cảnh báo
              → Tạo notification ngay
              ↓
[Response] → "Tạo ngân sách thành công"
```

### 3.2. Theo Dõi Ngân Sách Real-time

```
Khi có giao dịch mới (expense):
              ↓
[Trigger] → Tìm budget liên quan
            (cùng category, trong kỳ hạn)
              ↓
          Tính lại tổng chi tiêu
              ↓
          Tính % = (spent / budget_amount) * 100
              ↓
          Kiểm tra ngưỡng:
            ├─ % >= 80% và < 100%
            │   → Tạo notification "Cảnh báo: Đã dùng 80% ngân sách"
            ├─ % >= 100%
            │   → Tạo notification "Vượt ngân sách!"
            └─ % < 80%
                → OK, không làm gì
              ↓
[WebSocket/Polling] → Push notification đến client
              ↓
[UI] → Hiển thị toast warning
       Cập nhật progress bar màu đỏ
```

### 3.3. Báo Cáo Ngân Sách Cuối Kỳ

```
Cronjob chạy cuối mỗi tháng:
              ↓
[System] → Tìm tất cả budget hết hạn trong tháng
              ↓
         Với mỗi budget:
           ├─ Tính tổng chi tiêu thực tế
           ├─ So sánh với budget
           ├─ Tạo report summary:
           │   - Budget: X
           │   - Spent: Y
           │   - Saved/Overspent: X-Y
           │   - Percentage: Y/X%
           ├─ Gửi email báo cáo
           └─ Lưu vào notifications
              ↓
[Optional] → Tự động tạo budget cho kỳ tiếp theo
             (nếu user bật auto-renew)
```

---

## 4. Quy Trình Quản Lý Công Nợ

### 4.1. Tạo Khoản Cho Vay

```
[Người dùng] → Nhập thông tin
              - Tên người vay
              - Số tiền
              - Lãi suất (%)
              - Ngày cho vay
              - Hạn trả
              - Kỳ hạn trả (tháng/quý/năm)
              ↓
[Hệ thống] → Lưu vào bảng debts
              - type = 1  -- 1 = Lending (Cho vay)
              - principal_amount = số tiền
              - remaining_amount = số tiền
              - status = 1  -- 1 = Active
              ↓
           Tạo reminder tự động:
             - Nhắc nhở trước hạn trả 3 ngày
             - Nhắc nhở đúng hạn trả
             - Nhắc nhở sau hạn (overdue)
              ↓
[Optional] → Tạo transaction expense (ghi nhận tiền ra)
              ↓
[Response] → "Đã ghi nhận khoản cho vay"
```

### 4.2. Thu Nợ (Ghi Nhận Thanh Toán)

```
[Người dùng] → Chọn khoản nợ → "Thu nợ"
              ↓
[UI] → Form thu nợ
       - Số tiền thu (mặc định = remaining_amount)
       - Ngày thu
       - Ghi chú
              ↓
[Validation]
  - Số tiền <= remaining_amount?
              ↓
[Business Logic]
  - BEGIN TRANSACTION
    ├─ Insert vào debt_payments
    ├─ Update debts:
    │   - remaining_amount -= payment_amount
    │   - status =
    │       if remaining == 0 → 3  -- 3 = Fully Paid
    │       else if remaining < principal → 2  -- 2 = Partial Paid
    ├─ Tạo transaction income (ghi nhận tiền vào)
    ├─ Nếu fully_paid:
    │   └─ Tạo notification "Đã thu hết nợ từ [person]"
    └─ COMMIT
              ↓
[Response] → "Ghi nhận thu nợ thành công"
             Cập nhật số dư tài khoản
```

### 4.3. Kiểm Tra Nợ Quá Hạn

```
Cronjob chạy hàng ngày (00:00):
              ↓
[System] → Tìm debts where:
           - status IN (1, 2)  -- 1 = Active, 2 = Partial Paid
           - due_date < TODAY
              ↓
         Với mỗi debt quá hạn:
           ├─ Update status = 4  -- 4 = Overdue
           ├─ Tạo notification "Nợ quá hạn"
           ├─ Gửi email nhắc nhở
           └─ Tính tiền phạt (nếu có)
```

### 4.4. Tính Lãi Suất Tự Động

```
Cronjob chạy đầu mỗi tháng:
              ↓
[System] → Tìm debts có interest_rate > 0
              ↓
         Với mỗi debt:
           ├─ Tính lãi = remaining_amount * (interest_rate/12/100)
           ├─ Gửi notification "Lãi tháng này: X"
           └─ (Optional) Tự động cộng lãi vào remaining_amount
```

---

## 4B. Quy Trình Quản Lý Khoản Vay (Loans với Amortization)

### 4B.1. Tạo Khoản Vay Mới

```
[Người dùng] → Nhập thông tin khoản vay
              - Tên người/tổ chức cho vay
              - Loại vay: Cá nhân, mua nhà, mua xe, kinh doanh
              - Số tiền vay: 50,000,000 VND
              - Lãi suất năm: 12%
              - Số tháng vay: 12 tháng
              - Ngày giải ngân: 01/01/2025
              - Ngày trả nợ đầu tiên: 01/02/2025
              - Cho phép trả nợ trước hạn: Có
              - Chiến lược prepayment: Giảm số tháng
              ↓
[Validation]
  - Số tiền > 0?
  - Lãi suất hợp lệ (0-100)?
  - Số tháng > 0?
  - Ngày trả nợ đầu tiên > Ngày giải ngân?
              ↓
[Business Logic - Tính toán Amortization]

  Step 1: Tính số tiền trả hàng tháng (Monthly Payment)

  Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]

  Với:
    P = 50,000,000 (Principal - Số tiền vay)
    r = 12% / 12 / 100 = 0.01 (Monthly rate)
    n = 12 (Number of months)

  → M = 50,000,000 * [0.01 * (1.01)^12] / [(1.01)^12 - 1]
  → M = 4,442,458 VND/tháng

  Step 2: Tạo bảng amortization schedule (12 tháng)

  Tháng 1:
    - Số gốc còn lại đầu kỳ: 50,000,000
    - Lãi tháng 1 = 50,000,000 * 0.01 = 500,000
    - Gốc tháng 1 = 4,442,458 - 500,000 = 3,942,458
    - Số gốc còn lại cuối kỳ: 50,000,000 - 3,942,458 = 46,057,542

  Tháng 2:
    - Số gốc còn lại đầu kỳ: 46,057,542
    - Lãi tháng 2 = 46,057,542 * 0.01 = 460,575
    - Gốc tháng 2 = 4,442,458 - 460,575 = 3,981,883
    - Số gốc còn lại cuối kỳ: 46,057,542 - 3,981,883 = 42,075,659

  ... (tương tự cho 12 tháng)

  Tháng 12:
    - Số gốc còn lại đầu kỳ: 4,398,472
    - Lãi tháng 12 = 4,398,472 * 0.01 = 43,985
    - Gốc tháng 12 = 4,398,472 (trả hết)
    - Số gốc còn lại cuối kỳ: 0

  Tổng kết:
    - Tổng trả = 4,442,458 * 12 = 53,309,496
    - Tổng gốc = 50,000,000
    - Tổng lãi = 3,309,496
              ↓
[Database Operations]
  - BEGIN TRANSACTION
    ├─ Insert vào bảng loans
    │   - principal_amount = 50,000,000
    │   - current_principal = 50,000,000
    │   - interest_rate = 12
    │   - loan_term_months = 12
    │   - remaining_months = 12
    │   - monthly_payment = 4,442,458
    │   - status = 1  -- 1 = Active
    │
    ├─ Call function generate_loan_schedule(loan_id)
    │   → Tạo 12 records trong loan_payments
    │   → Mỗi record chứa:
    │       - payment_number (1-12)
    │       - due_date
    │       - scheduled_principal
    │       - scheduled_interest
    │       - scheduled_total
    │       - principal_balance_after
    │       - status = 1  -- 1 = Pending
    │
    └─ COMMIT
              ↓
[Response]
  - "Tạo khoản vay thành công"
  - Hiển thị bảng amortization schedule
  - Tạo reminder cho ngày trả nợ đầu tiên
```

### 4B.2. Trả Nợ Định Kỳ (Theo Lịch)

```
[Người dùng] → Chọn "Trả nợ" cho kỳ hiện tại
              ↓
[UI] → Hiển thị thông tin kỳ trả nợ:
       - Kỳ: Tháng 3/12
       - Ngày đáo hạn: 01/04/2025
       - Tiền gốc: 4,021,702
       - Tiền lãi: 420,756
       - Tổng cộng: 4,442,458
       - Số gốc còn lại sau khi trả: 38,053,957
              ↓
[Người dùng] → Xác nhận thanh toán
              ↓
[Business Logic]
  - BEGIN TRANSACTION
    ├─ Update loan_payments
    │   - actual_principal = 4,021,702
    │   - actual_interest = 420,756
    │   - actual_total = 4,442,458
    │   - status = 2  -- 2 = Paid
    │   - payment_date = TODAY
    │
    ├─ Update loans
    │   - current_principal -= 4,021,702
    │   - total_principal_paid += 4,021,702
    │   - total_interest_paid += 420,756
    │   - remaining_months -= 1
    │
    ├─ Tạo transaction (expense)
    │   - amount = 4,442,458
    │   - category = "Trả nợ vay"
    │   - note = "Trả nợ vay tháng 3"
    │
    └─ COMMIT
              ↓
[Response]
  - "Thanh toán thành công"
  - Cập nhật số dư tài khoản
  - Update progress bar
```

### 4B.3. Trả Nợ Trước Hạn (Prepayment)

```
[Người dùng] → Chọn "Trả nợ trước hạn"
              ↓
[UI] → Form trả nợ trước hạn:
       - Số tiền trả thêm: 20,000,000 VND
       - Thời điểm: Cùng kỳ tháng 3
       - Chiến lược:
         ○ Giảm số tháng (reduce_term) ✓
         ○ Giảm tiền trả hàng tháng (reduce_payment)
              ↓
[Người dùng] → Chọn "Giảm số tháng" → Submit
              ↓
[Simulation] → Preview kết quả:

  TRƯỚC KHI TRẢ TRƯỚC:
    - Số gốc còn lại: 42,053,957
    - Số tháng còn lại: 9 tháng
    - Trả hàng tháng: 4,442,458
    - Tổng lãi còn phải trả: ~1,500,000
    - Ngày đáo hạn cuối: 01/12/2025

  SAU KHI TRẢ TRƯỚC 20,000,000:
    - Số gốc còn lại: 22,053,957
    - Số tháng còn lại: 5 tháng ✓
    - Trả hàng tháng: 4,442,458 (giữ nguyên)
    - Tổng lãi còn phải trả: ~550,000
    - Ngày đáo hạn cuối: 01/08/2025

  LỢI ÍCH:
    ✓ Tiết kiệm lãi: ~950,000 VND
    ✓ Giảm 4 tháng trả nợ
    ✓ Trả hết nợ sớm 4 tháng
              ↓
[Người dùng] → Xác nhận
              ↓
[Business Logic]
  Step 1: Ghi nhận thanh toán kỳ hiện tại + prepayment

  - BEGIN TRANSACTION
    ├─ Update loan_payments (payment #3)
    │   - actual_principal = 4,021,702
    │   - actual_interest = 420,756
    │   - prepayment_amount = 20,000,000
    │   - actual_total = 24,442,458
    │   - status = 2  -- 2 = Paid
    │
    ├─ Update loans
    │   - current_principal = 42,053,957 - 4,021,702 - 20,000,000
    │   - current_principal = 18,032,255
    │   - total_principal_paid += 24,021,702
    │
    └─ Call recalculate_loan_after_prepayment()
              ↓

  Step 2: Tính toán lại lịch trả nợ

  Function recalculate_loan_after_prepayment():

    Input:
      - New principal: 18,032,255
      - Monthly rate: 0.01
      - Original monthly payment: 4,442,458
      - Strategy: reduce_term

    Calculate new term:
      n = -LN(1 - (P * r / M)) / LN(1 + r)
      n = -LN(1 - (18,032,255 * 0.01 / 4,442,458)) / LN(1.01)
      n ≈ 4.2 → CEIL = 5 tháng

    Process:
      ├─ Delete tất cả pending payments (tháng 4-12)
      │
      ├─ Generate lại schedule cho 5 tháng còn lại:
      │
      │   Tháng 4 (mới):
      │     - Gốc đầu kỳ: 18,032,255
      │     - Lãi = 18,032,255 * 0.01 = 180,323
      │     - Gốc = 4,442,458 - 180,323 = 4,262,135
      │     - Gốc cuối kỳ: 13,770,120
      │
      │   Tháng 5 (mới):
      │     - Gốc đầu kỳ: 13,770,120
      │     - Lãi = 13,770,120 * 0.01 = 137,701
      │     - Gốc = 4,442,458 - 137,701 = 4,304,757
      │     - Gốc cuối kỳ: 9,465,363
      │
      │   ... (tương tự cho tháng 6, 7, 8)
      │
      ├─ Update loans
      │   - remaining_months = 5
      │   - maturity_date = first_payment_date + 8 months
      │                   = 01/02/2025 + 8 months
      │                   = 01/10/2025
      │
      └─ COMMIT
              ↓
[Notifications]
  - Toast: "Trả nợ trước hạn thành công"
  - "Bạn đã tiết kiệm 950,000 VND tiền lãi"
  - "Giảm 4 tháng trả nợ"
  - Email summary
              ↓
[Response]
  - Refresh amortization table
  - Update loan summary
  - Hiển thị biểu đồ trước/sau prepayment
```

### 4B.4. Chiến Lược Prepayment: Giảm Số Tiền Trả Hàng Tháng

```
Nếu chọn strategy = 'reduce_payment':

  Step 1: Tính monthly payment mới

  Input:
    - New principal: 18,032,255
    - Monthly rate: 0.01
    - Remaining months: 9 (giữ nguyên)

  Calculate new monthly payment:
    M = P * [r(1+r)^n] / [(1+r)^n - 1]
    M = 18,032,255 * [0.01 * (1.01)^9] / [(1.01)^9 - 1]
    M ≈ 2,050,000 VND/tháng

  Kết quả:
    ✓ Giảm tiền trả hàng tháng: 4,442,458 → 2,050,000
    ✓ Giảm gánh nặng hàng tháng: ~2,400,000 VND
    ✓ Vẫn trả đúng 9 tháng như kế hoạch
    ✓ Tiết kiệm lãi: ~950,000 VND

  Step 2: Update loans
    - monthly_payment = 2,050,000
    - remaining_months = 9 (không đổi)

  Step 3: Generate lại amortization schedule
    với monthly_payment mới
```

### 4B.5. Nhắc Nhở và Cảnh Báo

```
Cronjob chạy hàng ngày (00:00):
              ↓
[System] → Tìm upcoming loan payments:
           WHERE due_date BETWEEN TODAY AND (TODAY + 3 days)
           AND status = 1  -- 1 = Pending
              ↓
         Với mỗi payment sắp đến hạn:
           ├─ Tạo notification
           │   "Nhắc nhở: Trả nợ vay tháng X"
           │   "Số tiền: 4,442,458 VND"
           │   "Đáo hạn: 01/05/2025"
           │
           ├─ Gửi email
           ├─ Push notification (mobile)
           └─ SMS (optional)
              ↓
         Kiểm tra overdue payments:
           WHERE due_date < TODAY
           AND status = 1  -- 1 = Pending
              ↓
         Với mỗi payment quá hạn:
           ├─ Update status = 3  -- 3 = Overdue
           ├─ Tính phí trễ hạn (nếu có)
           ├─ Gửi cảnh báo nghiêm trọng
           └─ Tạo notification "Nợ quá hạn"
```

### 4B.6. Báo Cáo Khoản Vay

```
[Người dùng] → Xem báo cáo khoản vay
              ↓
[System] → Query và tính toán:

  TỔNG QUAN:
    - Số tiền vay ban đầu: 50,000,000
    - Số gốc đã trả: 31,946,043 (63.89%)
    - Số gốc còn lại: 18,053,957 (36.11%)
    - Tổng lãi đã trả: 1,882,073
    - Tổng lãi dự kiến còn lại: 550,000
    - Đã trả: 7/12 tháng
    - Còn lại: 5 tháng

  TIẾT KIỆM TỪ PREPAYMENT:
    - Tổng prepayment: 20,000,000
    - Tiết kiệm lãi: 950,000
    - Giảm số tháng: 4 tháng
    - Ngày đáo hạn mới: 01/10/2025

  BIỂU ĐỒ:
    - Pie chart: Tỷ lệ gốc/lãi đã trả
    - Bar chart: Gốc vs Lãi theo tháng
    - Line chart: Số gốc còn lại theo thời gian
    - Comparison: Kế hoạch ban đầu vs Thực tế
```

---

## 5. Quy Trình Giao Dịch Định Kỳ

### 5.1. Tạo Giao Dịch Định Kỳ

```
[Người dùng] → Tạo giao dịch → Chọn "Lặp lại"
              ↓
[UI] → Form recurring
       - Tần suất: Hàng ngày/tuần/tháng/năm
       - Ngày trong kỳ (vd: ngày 1 hàng tháng)
       - Ngày bắt đầu
       - Ngày kết thúc (optional)
              ↓
[Hệ thống] → Lưu vào recurring_transactions
              - Tính next_occurrence
              ↓
           Tạo transaction đầu tiên (nếu start_date = today)
```

### 5.2. Thực Thi Giao Dịch Định Kỳ

```
Cronjob chạy hàng ngày (00:00):
              ↓
[System] → Tìm recurring_transactions where:
           - is_active = true
           - next_occurrence = TODAY
              ↓
         Với mỗi recurring:
           ├─ Tạo transaction mới
           │   (copy từ template)
           ├─ Tính next_occurrence tiếp theo:
           │   - Daily: +1 day
           │   - Weekly: +7 days
           │   - Monthly: +1 month, same day
           │   - Yearly: +1 year
           ├─ Update next_occurrence
           ├─ Kiểm tra end_date:
           │   └─ Nếu next > end_date
           │       → Set is_active = false
           └─ Gửi notification "Đã tự động thêm giao dịch"
```

---

## 6. Quy Trình Chia Sẻ Sổ

### 6.1. Tạo Sổ Chia Sẻ

```
[Owner] → Tạo "Sổ gia đình"
              ↓
[Hệ thống] → Insert shared_books
              - owner_id
              - name
              ↓
           Tự động thêm owner vào members
              - role = 'admin'
```

### 6.2. Mời Thành Viên

```
[Owner] → Nhập email người muốn mời
              ↓
[Hệ thống] → Tìm user theo email
              ├─ Không tìm thấy
              │   → Gửi email mời đăng ký
              └─ Tìm thấy
                  ↓
              Tạo invitation (pending)
                  ↓
              Gửi email/notification
                  ↓
[User nhận mời] → Accept/Decline
              ↓
          If Accept:
            ├─ Insert shared_book_members
            │   - book_id
            │   - user_id
            │   - role (viewer/editor/admin)
            └─ Notification "Bạn đã tham gia sổ X"
```

### 6.3. Đồng Bộ Real-time

```
Khi member thêm giao dịch vào shared book:
              ↓
[Hệ thống] → Lưu transaction
              ↓
           Tìm tất cả members của book
              ↓
           Với mỗi member:
             └─ Gửi WebSocket event:
                 "NEW_TRANSACTION_ADDED"
              ↓
[Client của members khác]
    → Nhận WebSocket event
    → Fetch transaction mới
    → Update UI real-time
```

### 6.4. Kiểm Soát Quyền

```
Khi member thực hiện action:
              ↓
[Middleware] → Kiểm tra role:

  viewer:
    - ✅ Xem transactions
    - ❌ Thêm/sửa/xóa transactions
    - ❌ Quản lý members

  editor:
    - ✅ Xem transactions
    - ✅ Thêm/sửa/xóa transactions
    - ❌ Quản lý members

  admin:
    - ✅ Full permissions
    - ✅ Quản lý members
    - ✅ Xóa sổ
              ↓
          If không đủ quyền:
            → 403 Forbidden
```

---

## 7. Quy Trình Xuất Báo Cáo

### 7.1. Xuất Excel

```
[Người dùng] → Chọn "Xuất Excel"
              → Chọn khoảng thời gian
              → Chọn loại báo cáo
              ↓
[Backend] → Query data theo filters
              ↓
          Format data cho Excel:
            - Sheet 1: Tổng quan
            - Sheet 2: Chi tiết giao dịch
            - Sheet 3: Biểu đồ
              ↓
          Sử dụng library (ExcelJS)
              ↓
          Generate file .xlsx
              ↓
          Upload lên S3 (temp storage)
              ↓
          Tạo signed URL (expire 1h)
              ↓
[Response] → Return download URL
              ↓
[Frontend] → Tự động download file
```

### 7.2. Xuất PDF

```
Similar flow như Excel, nhưng:
  - Sử dụng library: Puppeteer/PDFKit
  - Render HTML template
  - Convert to PDF
  - Include charts (Chart.js → Image)
```

---

## 8. Quy Trình Backup & Restore

### 8.1. Auto Backup

```
Cronjob chạy hàng ngày (02:00):
              ↓
[System] → Với mỗi user:
           ├─ Export toàn bộ data (JSON)
           │   - Accounts
           │   - Transactions
           │   - Categories
           │   - Budgets
           │   - Goals
           │   - Debts
           ├─ Compress (gzip)
           ├─ Encrypt (AES-256)
           ├─ Upload lên Cloud Storage
           │   - Path: backups/{user_id}/{date}.json.gz.enc
           ├─ Giữ 30 bản backup gần nhất
           └─ Xóa backup cũ > 30 ngày
```

### 8.2. Manual Backup

```
[Người dùng] → Click "Sao lưu dữ liệu"
              ↓
[System] → Export data
           → Download về máy user
```

### 8.3. Restore

```
[Người dùng] → Upload backup file
              ↓
[Validation] → Kiểm tra file format
              → Kiểm tra encryption
              → Decrypt
              ↓
[Hệ thống] → Parse JSON
              ↓
           Confirm modal:
             "⚠️ Dữ liệu hiện tại sẽ bị ghi đè"
              ↓
           BEGIN TRANSACTION
             ├─ Xóa data cũ (soft delete)
             ├─ Import data mới
             ├─ Validate data integrity
             └─ COMMIT
              ↓
[Response] → "Khôi phục thành công"
             → Reload application
```

---

**Lưu ý quan trọng:**

- Tất cả các quy trình đều có logging, error handling và rollback mechanism để đảm bảo data integrity
- **Tất cả type/status values sử dụng INTEGER (1, 2, 3...), KHÔNG phải string**
- Comments trong flow dùng text (ví dụ: "-- 1 = Active") chỉ để giải thích, code thực tế PHẢI dùng số
- Xem `02-DATABASE-DESIGN.md` Section 2 để biết đầy đủ mapping của các enum values
