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

## 4. Quy Trình Quản Lý Công Nợ (Debts với Account & Transaction Integration)

**⚠️ QUAN TRỌNG:**

- Debts PHẢI liên kết với Account
- Tự động tạo Transaction khi tạo debt và payment
- Tự động cập nhật số dư Account

### 4.1. Tạo Khoản Cho Vay (Lending)

```
[Người dùng] → Nhập thông tin cho vay
              - Tên người vay: "Nguyen Van B"
              - Số tiền: 10,000,000 VND
              - Lãi suất: 5% (tùy chọn)
              - Ngày cho vay: 01/01/2025 10:00
              - Hạn trả: 31/12/2025 23:59 (tùy chọn)
              - Kỳ hạn: Hàng tháng (tùy chọn)
              - ⭐ Tài khoản nguồn: "Tiền mặt" (BẮT BUỘC)
              - Category: "Cho vay" (tùy chọn)
              - Ghi chú: "Cho vay mua xe"
              ↓
[Validation]
  - Số tiền > 0?
  - Tài khoản có đủ số dư?
  - Account balance >= amount?
              ├─ Không đủ → "Số dư tài khoản không đủ"
              └─ Đủ → Tiếp tục
              ↓
[Business Logic - Transaction Flow]
  - BEGIN TRANSACTION
    │
    ├─ Step 1: Create Debt Record
    │   - INSERT INTO debts
    │     - type = 1 (Lending)
    │     - personName = "Nguyen Van B"
    │     - originalAmount = 10,000,000
    │     - remainingAmount = 10,000,000
    │     - totalInterestPaid = 0
    │     - interestRate = 5
    │     - borrowedDate = '2025-01-01T10:00:00.000Z'
    │     - dueDate = '2025-12-31T23:59:59.000Z'
    │     - status = 1 (Active)
    │     - accountId = 'account-cash-uuid'
    │
    ├─ Step 2: Create EXPENSE Transaction (Trừ tiền khỏi account)
    │   - INSERT INTO transactions
    │     - type = 2 (EXPENSE)
    │     - amount = 10,000,000
    │     - accountId = 'account-cash-uuid'
    │     - categoryId = 'category-lending-uuid'
    │     - debtId = debt.id (link)
    │     - date = '2025-01-01T10:00:00.000Z'
    │     - description = "Cho vay: Nguyen Van B - 10,000,000 VND"
    │     - note = "Cho vay mua xe"
    │
    ├─ Step 3: Update Account Balance (Trigger tự động)
    │   - UPDATE accounts
    │     SET balance = balance - 10,000,000
    │     WHERE id = 'account-cash-uuid'
    │   - VD: 50,000,000 → 40,000,000
    │
    ├─ Step 4: Link Transaction to Debt
    │   - UPDATE debts
    │     SET initialTransactionId = transaction.id
    │
    ├─ Step 5: Create Reminders
    │   - Nếu có dueDate:
    │     - Tạo reminder trước hạn 3 ngày
    │     - Tạo reminder đúng hạn
    │
    └─ COMMIT
              ↓
[Response]
  {
    "debt": {
      "id": "debt-uuid",
      "type": 1,
      "personName": "Nguyen Van B",
      "originalAmount": 10000000,
      "remainingAmount": 10000000,
      "accountId": "account-cash-uuid",
      "initialTransactionId": "transaction-uuid"
    },
    "transaction": {
      "id": "transaction-uuid",
      "type": 2, // EXPENSE
      "amount": 10000000,
      "description": "Cho vay: Nguyen Van B - 10,000,000 VND"
    },
    "updatedAccount": {
      "id": "account-cash-uuid",
      "name": "Tiền mặt",
      "balance": 40000000 // Giảm từ 50M
    }
  }
              ↓
[UI] → Hiển thị thông báo thành công
       "Đã ghi nhận cho vay 10,000,000 VND cho Nguyen Van B"
       "Số dư tài khoản Tiền mặt: 40,000,000 VND"
```

### 4.2. Tạo Khoản Đi Vay (Borrowing)

```
[Người dùng] → Nhập thông tin vay nợ
              - Tên người/tổ chức cho vay: "ABC Bank"
              - Số tiền: 100,000,000 VND
              - Lãi suất: 12%
              - Ngày vay: 01/01/2025 10:00
              - Hạn trả: 31/12/2025
              - Kỳ hạn: Hàng tháng
              - ⭐ Tài khoản đích: "Vietcombank" (BẮT BUỘC)
              - Category: "Vay nợ" (tùy chọn)
              - Ghi chú: "Vay mua nhà"
              ↓
[Business Logic - Transaction Flow]
  - BEGIN TRANSACTION
    │
    ├─ Step 1: Create Debt Record
    │   - INSERT INTO debts
    │     - type = 2 (Borrowing)
    │     - personName = "ABC Bank"
    │     - originalAmount = 100,000,000
    │     - remainingAmount = 100,000,000
    │     - status = 1 (Active)
    │     - accountId = 'account-vietcombank-uuid'
    │
    ├─ Step 2: Create INCOME Transaction (Cộng tiền vào account)
    │   - INSERT INTO transactions
    │     - type = 1 (INCOME)
    │     - amount = 100,000,000
    │     - accountId = 'account-vietcombank-uuid'
    │     - categoryId = 'category-borrowing-uuid'
    │     - debtId = debt.id
    │     - description = "Vay nợ: ABC Bank - 100,000,000 VND"
    │
    ├─ Step 3: Update Account Balance (Trigger tự động)
    │   - UPDATE accounts
    │     SET balance = balance + 100,000,000
    │   - VD: 20,000,000 → 120,000,000
    │
    └─ COMMIT
              ↓
[Response] → "Đã ghi nhận vay 100,000,000 VND từ ABC Bank"
             "Số dư Vietcombank: 120,000,000 VND"
```

### 4.3. Thu Nợ (Lending Payment)

```
[Người dùng] → Chọn khoản cho vay → "Thu nợ"
              ↓
[UI] → Form thu nợ
       - Số tiền thu: 3,000,000 (có thể < remainingAmount)
       - Phân tách:
         - Gốc: 2,850,000
         - Lãi: 150,000
       - Ngày thu: 15/01/2025 14:30
       - ⭐ Tài khoản nhận: "Vietcombank" (BẮT BUỘC)
       - Phương thức: "Chuyển khoản"
       - Mã tham chiếu: "TRF123456"
       - Ghi chú: "Thu nợ kỳ 1"
              ↓
[Validation]
  - amount > 0?
  - amount <= debt.remainingAmount?
  - principalAmount + interestAmount = amount?
              ↓
[Business Logic - Transaction Flow]
  - BEGIN TRANSACTION
    │
    ├─ Step 1: Create Debt Payment Record
    │   - INSERT INTO debt_payments
    │     - debtId = 'debt-uuid'
    │     - amount = 3,000,000
    │     - principalAmount = 2,850,000
    │     - interestAmount = 150,000
    │     - paymentDate = '2025-01-15T14:30:00.000Z'
    │     - accountId = 'account-vietcombank-uuid'
    │     - remainingBalanceAfter = 7,000,000
    │     - status = 2 (Completed)
    │
    ├─ Step 2: Create INCOME Transaction (Cộng tiền vào account)
    │   - INSERT INTO transactions
    │     - type = 1 (INCOME)
    │     - amount = 3,000,000
    │     - accountId = 'account-vietcombank-uuid'
    │     - categoryId = 'category-debt-collection-uuid'
    │     - debtId = 'debt-uuid'
    │     - description = "Thu nợ từ Nguyen Van B - Kỳ 1"
    │     - note = "Thu nợ kỳ 1"
    │
    ├─ Step 3: Update Account Balance
    │   - UPDATE accounts
    │     SET balance = balance + 3,000,000
    │   - VD: 40,000,000 → 43,000,000
    │
    ├─ Step 4: Link Payment to Transaction
    │   - UPDATE debt_payments
    │     SET transactionId = transaction.id
    │
    ├─ Step 5: Update Debt
    │   - UPDATE debts
    │     SET
    │       remainingAmount = remainingAmount - principalAmount
    │         = 10,000,000 - 2,850,000 = 7,150,000
    │       totalInterestPaid = totalInterestPaid + interestAmount
    │         = 0 + 150,000 = 150,000
    │       status = CASE
    │         WHEN remainingAmount = 0 THEN 3 (Fully Paid)
    │         WHEN remainingAmount < originalAmount THEN 2 (Partial Paid)
    │         ELSE 1 (Active)
    │       END
    │
    ├─ Step 6: Notifications
    │   - Nếu status = 3 (Fully Paid):
    │     - Tạo notification: "Đã thu hết nợ từ Nguyen Van B"
    │     - Disable reminders
    │
    └─ COMMIT
              ↓
[Response]
  {
    "payment": {
      "id": "payment-uuid",
      "amount": 3000000,
      "principalAmount": 2850000,
      "interestAmount": 150000,
      "transactionId": "transaction-uuid"
    },
    "updatedDebt": {
      "remainingAmount": 7150000,
      "totalInterestPaid": 150000,
      "status": 2 // Partial Paid
    },
    "updatedAccount": {
      "balance": 43000000 // Tăng từ 40M
    }
  }
              ↓
[UI] → "Thu nợ thành công 3,000,000 VND"
       "Còn lại: 7,150,000 VND"
       "Số dư Vietcombank: 43,000,000 VND"
```

### 4.4. Trả Nợ (Borrowing Payment)

```
[Người dùng] → Chọn khoản vay → "Trả nợ"
              ↓
[UI] → Form trả nợ
       - Số tiền trả: 11,000,000
       - Phân tách:
         - Gốc: 10,000,000
         - Lãi: 1,000,000
       - Ngày trả: 15/01/2025 14:30
       - ⭐ Tài khoản trả: "Vietcombank" (BẮT BUỘC)
       - Ghi chú: "Trả nợ tháng 1"
              ↓
[Validation]
  - amount > 0?
  - Account có đủ số dư?
  - balance >= amount?
              ↓
[Business Logic - Transaction Flow]
  - BEGIN TRANSACTION
    │
    ├─ Step 1: Create Debt Payment Record
    │   - INSERT INTO debt_payments
    │     - amount = 11,000,000
    │     - principalAmount = 10,000,000
    │     - interestAmount = 1,000,000
    │     - accountId = 'account-vietcombank-uuid'
    │
    ├─ Step 2: Create EXPENSE Transaction (Trừ tiền khỏi account)
    │   - INSERT INTO transactions
    │     - type = 2 (EXPENSE)
    │     - amount = 11,000,000
    │     - accountId = 'account-vietcombank-uuid'
    │     - categoryId = 'category-debt-repayment-uuid'
    │     - debtId = 'debt-uuid'
    │     - description = "Trả nợ ABC Bank - Tháng 1 (10M gốc + 1M lãi)"
    │
    ├─ Step 3: Update Account Balance
    │   - UPDATE accounts
    │     SET balance = balance - 11,000,000
    │   - VD: 120,000,000 → 109,000,000
    │
    ├─ Step 4: Update Debt
    │   - UPDATE debts
    │     SET
    │       remainingAmount = remainingAmount - 10,000,000
    │         = 100,000,000 - 10,000,000 = 90,000,000
    │       totalInterestPaid = totalInterestPaid + 1,000,000
    │       status = Partial Paid (2)
    │
    └─ COMMIT
              ↓
[Response] → "Trả nợ thành công 11,000,000 VND"
             "Còn nợ: 90,000,000 VND"
             "Số dư Vietcombank: 109,000,000 VND"
```

### 4.5. Xóa Payment (Trong 7 ngày)

```
[Người dùng] → Chọn payment → "Xóa"
              ↓
[Validation]
  - Tính số ngày: TODAY - payment.paymentDate
  - Nếu > 7 ngày → "Không thể xóa payment sau 7 ngày"
              ↓
[Business Logic - Rollback Transaction]
  - BEGIN TRANSACTION
    │
    ├─ Step 1: Restore Debt State
    │   - UPDATE debts
    │     SET
    │       remainingAmount = remainingAmount + payment.principalAmount
    │       totalInterestPaid = totalInterestPaid - payment.interestAmount
    │       status = (calculate based on new remainingAmount)
    │
    ├─ Step 2: Restore Account Balance
    │   - Lending payment (INCOME) → TRỪ lại tiền
    │     UPDATE accounts SET balance = balance - payment.amount
    │   - Borrowing payment (EXPENSE) → CỘNG lại tiền
    │     UPDATE accounts SET balance = balance + payment.amount
    │
    ├─ Step 3: Delete Transaction
    │   - DELETE FROM transactions WHERE id = payment.transactionId
    │
    ├─ Step 4: Delete Payment
    │   - DELETE FROM debt_payments WHERE id = payment.id
    │
    └─ COMMIT
              ↓
[Response] → "Đã xóa payment và khôi phục trạng thái"
```

### 4.6. Xóa Debt (Soft Delete)

```
[Người dùng] → Chọn debt → "Xóa"
              ↓
[UI] → Confirm dialog
       "Khoản nợ này còn [remainingAmount]. Bạn muốn?"
       - Option 1: Xóa (không hoàn tiền)
       - Option 2: Hủy
              ↓
[Business Logic]
  - UPDATE debts
    SET deleted_at = NOW()
  - GIỮ NGUYÊN:
    - Transactions (để audit)
    - Debt_payments (để audit)
              ↓
[Response] → "Đã xóa khoản nợ. Lịch sử transactions được giữ lại."
```

### 4.7. Kiểm Tra Nợ Quá Hạn (Cronjob)

```
Cronjob chạy hàng ngày (00:00):
              ↓
[System] → SELECT * FROM debts
           WHERE
             status IN (1, 2) -- Active or Partial Paid
             AND dueDate < NOW()
             AND deleted_at IS NULL
              ↓
         Với mỗi debt quá hạn:
           ├─ UPDATE debts SET status = 4 (Overdue)
           ├─ INSERT INTO notifications
           │   - type = 2 (Debt Reminder)
           │   - title = "Nợ quá hạn"
           │   - message = "[Type] [Person] - [Amount] đã quá hạn [days] ngày"
           │
           └─ Gửi email nhắc nhở (nếu email_enabled)
```

### 4.8. Tính Lãi Tự Động (Optional - Phase nâng cao)

```
Cronjob chạy đầu mỗi tháng (01/XX 00:00):
              ↓
[System] → SELECT * FROM debts
           WHERE
             status IN (1, 2)
             AND interestRate > 0
             AND deleted_at IS NULL
              ↓
         Với mỗi debt:
           ├─ Tính lãi tháng = remainingAmount * (interestRate/12/100)
           │
           ├─ INSERT INTO notifications
           │   - "Lãi tháng [Month]: [Amount]"
           │
           └─ (Optional) Tự động thêm lãi vào remainingAmount
               hoặc tạo debt_payment record cho lãi
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

## 5. Quy Trình Quản Lý Mục Tiêu Tài Chính (Goals)

### 5.1. Tạo Mục Tiêu Mới

```
[Người dùng] → Click "Tạo mục tiêu"
              ↓
[UI] → Form tạo mục tiêu:
       - Tên mục tiêu: "Mua Laptop Gaming"
       - Số tiền mục tiêu: 20,000,000 VND
       - Thời hạn: 31/12/2025
       - Mô tả: "Để chơi game và làm việc"
       - Tài khoản liên kết (optional): Chọn tài khoản mặc định
       - Màu sắc & icon (optional)
              ↓
[Validation]
  - Tên không rỗng?
  - Số tiền > 0?
  - Thời hạn > ngày hiện tại?
              ↓
[Business Logic]
  - BEGIN TRANSACTION
    ├─ Insert vào goals
    │   - user_id
    │   - name = "Mua Laptop Gaming"
    │   - target_amount = 20,000,000
    │   - current_amount = 0
    │   - deadline = 31/12/2025
    │   - status = 1  -- 1 = Active
    │   - linked_account_id (optional)
    │
    ├─ Tính suggested monthly contribution:
    │   months_remaining = DATEDIFF(deadline, today) / 30
    │   monthly_target = target_amount / months_remaining
    │   → Lưu vào goal.monthly_target
    │
    └─ COMMIT
              ↓
[Response]
  - "Tạo mục tiêu thành công"
  - Hiển thị card mục tiêu với progress 0%
  - Gợi ý: "Để đạt mục tiêu, bạn cần tiết kiệm 2,000,000 VND/tháng"
```

### 5.2. Đóng Góp Vào Mục Tiêu

```
[Người dùng] → Click vào goal → "Đóng góp"
              ↓
[UI] → Modal đóng góp:
       - Hiển thị thông tin goal:
         * Tên: Mua Laptop Gaming
         * Mục tiêu: 20,000,000 VND
         * Hiện tại: 5,000,000 VND (25%)
         * Còn thiếu: 15,000,000 VND

       - Form:
         * Số tiền đóng góp: [___________] VND
         * Chọn tài khoản nguồn:
           ○ Tiền mặt (Số dư: 10,000,000 VND) ✓
           ○ Ngân hàng VCB (Số dư: 50,000,000 VND)
           ○ Ví MoMo (Số dư: 2,000,000 VND)
         * Ghi chú (optional): "Tiết kiệm tháng 11"
              ↓
[Người dùng] → Nhập số tiền: 3,000,000 VND
              → Chọn: Tiền mặt
              → Submit
              ↓
[Validation]
  - Số tiền > 0?
  - Số tiền <= số dư tài khoản?
  - Tài khoản đã được chọn?
              ↓
[Business Logic - CRITICAL]

  Step 1: Validate account balance
    account = findAccount(account_id, user_id)
    if (account.balance < amount):
      → Throw "Số dư không đủ"
              ↓

  Step 2: BEGIN TRANSACTION
    ├─ Update accounts (Giảm số dư)
    │   UPDATE accounts
    │   SET balance = balance - 3,000,000
    │   WHERE id = account_id
    │
    │   Kết quả: Tiền mặt: 10,000,000 → 7,000,000
    │
    ├─ Update goals (Tăng current_amount)
    │   UPDATE goals
    │   SET current_amount = current_amount + 3,000,000
    │   WHERE id = goal_id
    │
    │   Kết quả: Goal: 5,000,000 → 8,000,000 (40%)
    │
    ├─ Tạo transaction tracking (EXPENSE)
    │   INSERT INTO transactions
    │   - user_id
    │   - account_id = account_id
    │   - category_id = SAVINGS_CATEGORY_ID  -- "Tiết kiệm"
    │   - amount = 3,000,000
    │   - type = 2  -- 2 = Expense (tiền ra khỏi account)
    │   - goal_id = goal_id
    │   - date = TODAY
    │   - note = "Đóng góp vào mục tiêu: Mua Laptop Gaming"
    │
    ├─ Tạo goal_transaction history
    │   INSERT INTO goal_transactions
    │   - goal_id
    │   - account_id
    │   - transaction_id (FK)
    │   - amount = 3,000,000
    │   - type = 'CONTRIBUTION'  -- Đóng góp
    │   - note = "Tiết kiệm tháng 11"
    │   - created_at = NOW()
    │
    ├─ Kiểm tra completion
    │   IF (goal.current_amount >= goal.target_amount):
    │     UPDATE goals SET status = 2  -- 2 = Completed
    │     CREATE notification "Chúc mừng! Bạn đã đạt mục tiêu"
    │
    └─ COMMIT
              ↓
[Response]
  - Toast: "Đóng góp thành công"
  - Update số dư tài khoản: 10,000,000 → 7,000,000
  - Update goal progress: 25% → 40%
  - Hiển thị animation progress bar tăng
  - Notification: "Còn 60% nữa là đạt mục tiêu!"
```

### 5.3. Rút Tiền Từ Mục Tiêu

```
[Người dùng] → Click goal → "Rút tiền"
              ↓
[UI] → Modal rút tiền:
       - Số tiền hiện tại trong goal: 8,000,000 VND
       - Số tiền rút (tối đa 8,000,000): [___________] VND
       - Chọn tài khoản đích:
         ○ Tiền mặt ✓
         ○ Ngân hàng VCB
       - Lý do rút tiền: "Cần tiền gấp cho việc khác"
              ↓
[Người dùng] → Nhập: 2,000,000 VND
              → Chọn: Tiền mặt
              → Submit
              ↓
[Validation]
  - Số tiền > 0?
  - Số tiền <= current_amount của goal?
              ↓
[Business Logic]

  BEGIN TRANSACTION
    ├─ Update goals (Giảm current_amount)
    │   UPDATE goals
    │   SET current_amount = current_amount - 2,000,000
    │   WHERE id = goal_id
    │
    │   Kết quả: Goal: 8,000,000 → 6,000,000 (30%)
    │
    ├─ Update accounts (Tăng số dư)
    │   UPDATE accounts
    │   SET balance = balance + 2,000,000
    │   WHERE id = account_id
    │
    │   Kết quả: Tiền mặt: 7,000,000 → 9,000,000
    │
    ├─ Tạo transaction (INCOME)
    │   INSERT INTO transactions
    │   - type = 1  -- 1 = Income (tiền vào account)
    │   - amount = 2,000,000
    │   - category_id = SAVINGS_CATEGORY_ID
    │   - goal_id = goal_id
    │   - note = "Rút từ mục tiêu: Mua Laptop Gaming"
    │
    ├─ Tạo goal_transaction history
    │   INSERT INTO goal_transactions
    │   - type = 'WITHDRAWAL'  -- Rút tiền
    │   - amount = 2,000,000
    │   - note = "Cần tiền gấp cho việc khác"
    │
    ├─ Update goal status (nếu cần)
    │   IF (goal.status == 2 AND current_amount < target_amount):
    │     UPDATE goals SET status = 1  -- 2=Completed → 1=Active
    │
    └─ COMMIT
              ↓
[Response]
  - "Rút tiền thành công"
  - Update goal: 40% → 30%
  - Update số dư tài khoản: 7,000,000 → 9,000,000
  - Warning: "Tiến độ mục tiêu giảm 10%"
```

### 5.4. Xóa Mục Tiêu (Critical Flow)

```
[Người dùng] → Click goal → Menu → "Xóa"
              ↓
[Validation] → Kiểm tra current_amount
              ├─ current_amount = 0
              │   → Confirm xóa đơn giản
              │   → Skip to deletion
              │
              └─ current_amount > 0 (VD: 6,000,000 VND)
                  → Show warning modal ⚠️
              ↓
[UI] → Modal cảnh báo:

    ⚠️ Cảnh báo: Mục tiêu có tiền đã đóng góp!

    Mục tiêu: Mua Laptop Gaming
    Số tiền đã đóng góp: 6,000,000 VND

    ❓ Bạn muốn xử lý số tiền này như thế nào?

    ○ Hoàn tiền về tài khoản ✓
      └─ Chọn tài khoản nhận:
          [Dropdown: Tiền mặt / Ngân hàng / Ví MoMo]

    ○ Chuyển sang mục tiêu khác
      └─ Chọn mục tiêu đích:
          [Dropdown: Mua Ô tô / Du lịch Nhật / ...]

    ○ Xóa luôn (không hoàn tiền)
      └─ ⚠️ Số tiền sẽ mất, chỉ giữ lại lịch sử giao dịch

    [Hủy] [Xác nhận xóa]
              ↓
[Người dùng] → Chọn option → Confirm
              ↓
[Business Logic]

  CASE 1: Hoàn tiền về tài khoản
  ─────────────────────────────
    BEGIN TRANSACTION
      ├─ Update accounts (Hoàn tiền)
      │   UPDATE accounts
      │   SET balance = balance + 6,000,000
      │   WHERE id = selected_account_id
      │
      │   Kết quả: Tiền mặt: 9,000,000 → 15,000,000
      │
      ├─ Tạo transaction (INCOME)
      │   INSERT INTO transactions
      │   - type = 1  -- 1 = Income
      │   - amount = 6,000,000
      │   - account_id = selected_account_id
      │   - category_id = REFUND_CATEGORY
      │   - note = "Hoàn tiền từ mục tiêu: Mua Laptop Gaming"
      │
      ├─ Soft delete goal
      │   UPDATE goals
      │   SET deleted_at = NOW()
      │   WHERE id = goal_id
      │
      ├─ Tạo notification
      │   "Đã hoàn 6,000,000 VND về tài khoản Tiền mặt"
      │
      └─ COMMIT

  CASE 2: Chuyển sang mục tiêu khác
  ─────────────────────────────────
    BEGIN TRANSACTION
      ├─ Validate target goal exists và active
      │
      ├─ Update source goal
      │   UPDATE goals
      │   SET current_amount = 0,
      │       deleted_at = NOW()
      │   WHERE id = source_goal_id
      │
      ├─ Update target goal
      │   UPDATE goals
      │   SET current_amount = current_amount + 6,000,000
      │   WHERE id = target_goal_id
      │
      ├─ Tạo goal_transaction cho target goal
      │   INSERT INTO goal_transactions
      │   - goal_id = target_goal_id
      │   - type = 'TRANSFER_FROM_GOAL'
      │   - amount = 6,000,000
      │   - note = "Chuyển từ mục tiêu: Mua Laptop Gaming"
      │
      ├─ Kiểm tra target goal completion
      │   IF (target_goal.current >= target_goal.target):
      │     UPDATE status = 2  -- 2 = Completed
      │
      └─ COMMIT

  CASE 3: Xóa luôn (không hoàn tiền)
  ─────────────────────────────────
    BEGIN TRANSACTION
      ├─ Soft delete goal
      │   UPDATE goals
      │   SET deleted_at = NOW()
      │   WHERE id = goal_id
      │
      │   Note: current_amount giữ nguyên để audit
      │
      ├─ Giữ nguyên ALL transactions
      │   (Không xóa để có audit trail)
      │
      ├─ Giữ nguyên goal_transactions history
      │
      └─ COMMIT
              ↓
[Response]
  - Case 1: "Đã xóa mục tiêu và hoàn 6,000,000 VND"
  - Case 2: "Đã chuyển 6,000,000 VND sang mục tiêu Mua Ô tô"
  - Case 3: "Đã xóa mục tiêu"

  - Refresh danh sách goals
  - Update số dư tài khoản (nếu case 1)
```

### 5.5. Xem Lịch Sử Đóng Góp/Rút Tiền

```
[Người dùng] → Click goal → Tab "Lịch sử"
              ↓
[System] → Query goal_transactions:
           WHERE goal_id = X
           ORDER BY created_at DESC
              ↓
[UI] → Hiển thị timeline:

    📊 Lịch sử giao dịch - Mua Laptop Gaming

    ════════════════════════════════════════

    📅 29/11/2025 - 14:30
    ➕ Đóng góp: +3,000,000 VND
    Từ: Tiền mặt
    Ghi chú: Tiết kiệm tháng 11
    Số dư sau: 8,000,000 VND (40%)

    ────────────────────────────────────────

    📅 15/11/2025 - 10:00
    ➖ Rút tiền: -2,000,000 VND
    Về: Tiền mặt
    Lý do: Cần tiền gấp
    Số dư sau: 5,000,000 VND (25%)

    ────────────────────────────────────────

    📅 01/11/2025 - 09:00
    ➕ Đóng góp: +5,000,000 VND
    Từ: Ngân hàng VCB
    Ghi chú: Lương tháng 11
    Số dư sau: 7,000,000 VND (35%)

    ════════════════════════════════════════

    📈 Thống kê:
    - Tổng đóng góp: 8,000,000 VND
    - Tổng rút: 2,000,000 VND
    - Số dư hiện tại: 6,000,000 VND
    - Số lần đóng góp: 2
    - Số lần rút: 1
```

### 5.6. Hoàn Thành Mục Tiêu Tự Động

```
Trigger khi đóng góp làm current_amount >= target_amount:
              ↓
[System] → Auto update status
           UPDATE goals
           SET status = 2,  -- 2 = Completed
               completed_date = NOW()
           WHERE id = goal_id
              ↓
         Show celebration modal 🎉
              ↓
[UI] → Modal:

    🎉 Chúc mừng! Bạn đã đạt mục tiêu!

    Mục tiêu: Mua Laptop Gaming
    Đã hoàn thành: 100%
    Số tiền: 20,000,000 / 20,000,000 VND

    ❓ Bạn muốn làm gì tiếp theo?

    ○ Rút tiền về tài khoản để sử dụng
    ○ Giữ tiền trong mục tiêu
    ○ Chuyển sang mục tiêu khác

    [Quyết định sau] [Xác nhận]
              ↓
[Người dùng] → Chọn action
              ↓
[System] → Execute tương tự flow xóa mục tiêu
           (CASE 1, 2, hoặc giữ nguyên)
```

### 5.7. Cảnh Báo Deadline

```
Cronjob chạy hàng ngày (00:00):
              ↓
[System] → Tìm goals:
           WHERE status = 1  -- 1 = Active
           AND deadline BETWEEN TODAY AND (TODAY + 7 days)
           AND current_amount < target_amount
              ↓
         Với mỗi goal sắp hết hạn:
           ├─ Tính remaining = target - current
           ├─ Tính days_left = DATEDIFF(deadline, TODAY)
           ├─ Tính daily_needed = remaining / days_left
           │
           ├─ Tạo notification:
           │   "⚠️ Mục tiêu sắp hết hạn!"
           │   "Còn X ngày để đạt mục tiêu Y"
           │   "Cần đóng góp thêm Z VND/ngày"
           │
           └─ Gửi email reminder
              ↓
         Tìm goals quá hạn:
           WHERE status = 1
           AND deadline < TODAY
           AND current_amount < target_amount
              ↓
         Với mỗi goal quá hạn:
           ├─ Update status = 3  -- 3 = Cancelled/Failed
           ├─ Notification: "Mục tiêu quá hạn chưa đạt được"
           └─ Hỏi user có muốn gia hạn không
```

### 5.8. Báo Cáo Tiến Độ

```
[Người dùng] → Xem dashboard goals
              ↓
[System] → Tính toán metrics:

    TỔNG QUAN:
    ═══════════
    - Tổng mục tiêu: 5
    - Đang hoạt động: 3
    - Đã hoàn thành: 1
    - Quá hạn: 1

    - Tổng tiền mục tiêu: 100,000,000 VND
    - Đã tiết kiệm: 45,000,000 VND (45%)
    - Còn thiếu: 55,000,000 VND

    TIẾN ĐỘ CỤ THỂ:
    ═══════════════

    📱 Mua iPhone 16 Pro Max
       Progress: ███████░░░ 70%
       35,000,000 / 50,000,000 VND
       Deadline: 31/12/2025 (còn 32 ngày)
       Gợi ý: Đóng góp 468,750 VND/ngày

    💻 Mua Laptop Gaming
       Progress: ████░░░░░░ 40%
       8,000,000 / 20,000,000 VND
       Deadline: 30/06/2026 (còn 213 ngày)
       Gợi ý: Đóng góp 56,338 VND/ngày

    🚗 Mua Ô tô
       Progress: ██░░░░░░░░ 20%
       100,000,000 / 500,000,000 VND
       Deadline: 31/12/2026 (còn 397 ngày)
       Gợi ý: Đóng góp 1,007,557 VND/ngày
```

---

## 6. Quy Trình Giao Dịch Định Kỳ

### 6.1. Tạo Giao Dịch Định Kỳ

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

### 6.2. Thực Thi Giao Dịch Định Kỳ

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

## 7. Quy Trình Chia Sẻ Sổ

### 7.1. Tạo Sổ Chia Sẻ

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

### 7.2. Mời Thành Viên

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

### 7.3. Đồng Bộ Real-time

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

### 7.4. Kiểm Soát Quyền

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

## 8. Quy Trình Xuất Báo Cáo

### 8.1. Xuất Excel

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

### 8.2. Xuất PDF

```
Similar flow như Excel, nhưng:
  - Sử dụng library: Puppeteer/PDFKit
  - Render HTML template
  - Convert to PDF
  - Include charts (Chart.js → Image)
```

---

## 9. Quy Trình Backup & Restore

### 9.1. Auto Backup

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

### 9.2. Manual Backup

```
[Người dùng] → Click "Sao lưu dữ liệu"
              ↓
[System] → Export data
           → Download về máy user
```

### 9.3. Restore

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
