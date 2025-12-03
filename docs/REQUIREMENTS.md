# Yêu Cầu Hệ Thống - Quản Lý Chi Tiêu Cá Nhân

## 1. Tổng Quan Dự Án

Ứng dụng quản lý chi tiêu cá nhân giúp người dùng theo dõi, phân tích và kiểm soát tài chính cá nhân một cách hiệu quả.

## 2. Yêu Cầu Chức Năng

### 2.1. Quản Lý Người Dùng

- **Đăng ký tài khoản**: Email, mật khẩu, xác thực email
- **Đăng nhập/Đăng xuất**: Hỗ trợ đăng nhập bằng email hoặc tài khoản mạng xã hội (Google, Facebook)
- **Quản lý hồ sơ**: Cập nhật thông tin cá nhân, ảnh đại diện
- **Đặt lại mật khẩu**: Qua email
- **Bảo mật**: Mã hóa mật khẩu, xác thực hai yếu tố (2FA - tùy chọn)

### 2.2. Quản Lý Giao Dịch

- **Thêm giao dịch**:
  - Loại: Thu nhập/Chi tiêu
  - Số tiền
  - Danh mục (category)
  - Ngày tháng
  - Ghi chú/Mô tả
  - Đính kèm hình ảnh hóa đơn (tùy chọn)
  - Phương thức thanh toán (tiền mặt, thẻ, chuyển khoản)
- **Sửa/Xóa giao dịch**: Chỉnh sửa hoặc xóa các giao dịch đã tạo
- **Tìm kiếm và lọc**: Theo ngày, danh mục, loại giao dịch, số tiền
- **Giao dịch định kỳ**: Tự động thêm giao dịch lặp lại (hàng ngày, tuần, tháng)

### 2.3. Quản Lý Danh Mục

- **Danh mục chi tiêu**: Ăn uống, Di chuyển, Giải trí, Mua sắm, Hóa đơn, Sức khỏe, Giáo dục, v.v.
- **Danh mục thu nhập**: Lương, Thưởng, Đầu tư, Thu nhập phụ, v.v.
- **Tùy chỉnh danh mục**: Thêm, sửa, xóa danh mục theo nhu cầu
- **Màu sắc và biểu tượng**: Gán màu và icon cho mỗi danh mục

### 2.4. Ngân Sách (Budget)

- **Đặt ngân sách**: Thiết lập giới hạn chi tiêu theo tháng/quý/năm
- **Ngân sách theo danh mục**: Đặt giới hạn cho từng danh mục cụ thể
- **Cảnh báo ngân sách**: Thông báo khi sắp đạt hoặc vượt ngân sách
- **Theo dõi tiến độ**: Hiển thị phần trăm ngân sách đã sử dụng

### 2.5. Báo Cáo và Thống Kê

- **Báo cáo tổng quan**:
  - Tổng thu nhập
  - Tổng chi tiêu
  - Số dư còn lại
- **Báo cáo theo thời gian**: Ngày, tuần, tháng, năm
- **Biểu đồ**:
  - Biểu đồ tròn: Phân bổ chi tiêu theo danh mục
  - Biểu đồ cột: So sánh thu chi theo tháng
  - Biểu đồ đường: Xu hướng chi tiêu theo thời gian
- **Xuất báo cáo**: PDF, Excel, CSV
- **Phân tích xu hướng**: Dự đoán chi tiêu tương lai dựa trên lịch sử

### 2.6. Quản Lý Tài Khoản Ngân Hàng/Ví

- **Đa tài khoản**: Quản lý nhiều tài khoản (tiền mặt, ngân hàng, thẻ tín dụng)
- **Chuyển khoản giữa tài khoản**: Ghi nhận chuyển tiền nội bộ
- **Theo dõi số dư**: Hiển thị số dư hiện tại của từng tài khoản
- **Đồng bộ ngân hàng**: Tích hợp API ngân hàng (tùy chọn nâng cao)

### 2.7. Quản Lý Công Nợ (Debts)

**Lưu ý quan trọng:** Hệ thống quản lý công nợ **PHẢI tích hợp với Accounts và Transactions** để đồng bộ số dư tài chính chính xác.

#### 2.7.1. Tạo Khoản Công Nợ

**Cho vay (Lending):**

- Người vay (borrowerName)
- Số tiền cho vay (amount)
- Lãi suất nếu có (interestRate %)
- Ngày cho vay (borrowedDate)
- Hạn trả (dueDate) - tùy chọn
- Ghi chú (note)
- **Chọn tài khoản nguồn** (accountId) - Bắt buộc
  - Khi tạo khoản cho vay:
    - Hệ thống tự động **TRỪ TIỀN** khỏi tài khoản nguồn
    - Tạo transaction type=EXPENSE với:
      - `amount`: Số tiền cho vay
      - `category`: "Cho vay" (mặc định hoặc user tự chọn)
      - `debt_id`: Link đến debt record
      - `description`: "Cho vay: [Tên người vay] - [Số tiền]"
      - `date`: borrowedDate
  - Số dư account giảm ngay lập tức
- **Trạng thái khởi tạo:** ACTIVE

**Đi vay (Borrowing):**

- Người cho vay/Tổ chức (lenderName)
- Số tiền vay (amount)
- Lãi suất (interestRate %)
- Ngày vay (borrowedDate)
- Hạn trả (dueDate) - tùy chọn
- Kỳ hạn trả (paymentFrequency): 1=Monthly, 2=Quarterly, 3=Yearly, 4=One-time
- Ghi chú (note)
- **Chọn tài khoản đích** (accountId) - Bắt buộc
  - Khi tạo khoản đi vay:
    - Hệ thống tự động **CỘNG TIỀN** vào tài khoản đích
    - Tạo transaction type=INCOME với:
      - `amount`: Số tiền vay
      - `category`: "Vay nợ" (mặc định hoặc user tự chọn)
      - `debt_id`: Link đến debt record
      - `description`: "Vay nợ: [Tên người cho vay] - [Số tiền]"
      - `date`: borrowedDate
  - Số dư account tăng ngay lập tức
- **Trạng thái khởi tạo:** ACTIVE

**Tracking fields:**

- `originalAmount`: Số tiền gốc ban đầu (KHÔNG thay đổi)
- `remainingAmount`: Số tiền còn lại (giảm khi trả nợ/thu nợ)
- `paidAmount`: Số tiền đã trả/thu = originalAmount - remainingAmount
- `totalInterestPaid`: Tổng lãi đã trả (nếu có)

#### 2.7.2. Ghi Nhận Thanh Toán Công Nợ

**Khi trả nợ (Cho vay - Thu tiền về):**

- User nhập:
  - Số tiền thu về (paymentAmount)
  - Ngày thu (paymentDate)
  - Tài khoản nhận tiền (accountId)
  - Ghi chú (note)
- Hệ thống xử lý:
  - **CỘNG TIỀN** vào account nhận
  - Tạo transaction type=INCOME với:
    - `amount`: paymentAmount
    - `category`: "Thu nợ" (hoặc "Thu tiền cho vay")
    - `debt_id`: Link đến debt record
    - `description`: "Thu nợ từ [Tên người vay] - Kỳ [X]"
  - Giảm `remainingAmount` của debt
  - Cập nhật `status`:
    - Nếu remainingAmount = 0 → PAID
    - Nếu 0 < remainingAmount < originalAmount → PARTIAL_PAID
  - Lưu vào `debt_payments` table:
    - `debt_id`, `amount`, `paymentDate`, `transaction_id`, `note`

**Khi trả nợ (Đi vay - Trả tiền):**

- User nhập:
  - Số tiền trả (paymentAmount)
  - Ngày trả (paymentDate)
  - Tài khoản trả tiền (accountId)
  - Phân tách gốc/lãi (tùy chọn):
    - Số tiền gốc (principalAmount)
    - Số tiền lãi (interestAmount)
    - Nếu không phân tách: Hệ thống tính toán tự động dựa trên interestRate
  - Ghi chú (note)
- Hệ thống xử lý:
  - **TRỪ TIỀN** khỏi account trả
  - Tạo transaction type=EXPENSE với:
    - `amount`: paymentAmount
    - `category`: "Trả nợ" (hoặc chia thành 2 transaction: gốc + lãi)
    - `debt_id`: Link đến debt record
    - `description`: "Trả nợ [Tên người cho vay] - Kỳ [X]"
  - Giảm `remainingAmount` của debt
  - Cập nhật `totalInterestPaid` += interestAmount
  - Cập nhật `status`:
    - Nếu remainingAmount = 0 → PAID
    - Nếu 0 < remainingAmount < originalAmount → PARTIAL_PAID
  - Lưu vào `debt_payments` table:
    - `debt_id`, `amount`, `principalAmount`, `interestAmount`, `paymentDate`, `transaction_id`, `note`

#### 2.7.3. Xóa/Hủy Khoản Công Nợ

**Khi xóa debt chưa thanh toán xong:**

- Hỏi user: "Khoản công nợ này chưa thanh toán xong. Bạn muốn xử lý số dư như thế nào?"
  - **Option 1: Hoàn tiền về tài khoản** (Cho vay → Cộng tiền về, Đi vay → Trừ tiền)
    - Tạo transaction ngược lại với số tiền remainingAmount
    - Xóa debt và tất cả debt_payments
  - **Option 2: Xóa luôn (giữ lại transaction history)**
    - Soft delete debt (đánh dấu deleted_at)
    - Giữ nguyên debt_payments để audit
    - Giữ nguyên transactions để không ảnh hưởng history

**Khi xóa debt đã thanh toán xong (PAID):**

- Chỉ cho phép soft delete
- Giữ nguyên toàn bộ transactions để tracking history

#### 2.7.4. Lịch Sử Công Nợ

- Xem tất cả các lần thanh toán (debt_payments)
- Mỗi record bao gồm:
  - Ngày thanh toán
  - Số tiền (gốc + lãi nếu có)
  - Số dư còn lại sau khi trả
  - Transaction liên quan (link)
  - Tài khoản sử dụng
  - Ghi chú
- Filter theo: Ngày, Số tiền, Trạng thái

#### 2.7.5. Tính Toán Lãi Suất

**Lãi đơn (Simple Interest):**

- Công thức: `I = P × r × t`
  - P = originalAmount (số tiền gốc)
  - r = interestRate / 100 (lãi suất năm)
  - t = số năm (tính từ borrowedDate đến hiện tại)
- Tổng tiền phải trả = P + I

**Lãi kép (Compound Interest)** - Phase nâng cao:

- Công thức: `A = P × (1 + r/n)^(n×t)`
  - n = số lần ghép lãi trong năm (12=hàng tháng, 4=hàng quý)

**Lưu ý:**

- Hệ thống mặc định dùng lãi đơn
- Khi user trả nợ, có thể chọn trả:
  - Chỉ lãi (interestAmount)
  - Chỉ gốc (principalAmount)
  - Cả gốc và lãi
- Lãi tích lũy được tính từ borrowedDate đến paymentDate

#### 2.7.6. Nhắc Nhở Công Nợ

- **Nhắc trước hạn trả:**
  - Cấu hình: X ngày trước dueDate (mặc định 3 ngày)
  - Notification: "Sắp đến hạn trả nợ [Tên] - [Số tiền] vào [Ngày]"
- **Nhắc quá hạn:**
  - Nếu dueDate đã qua mà remainingAmount > 0
  - Status tự động chuyển sang OVERDUE
  - Notification hàng ngày: "Nợ quá hạn: [Tên] - [Số tiền] - Quá hạn [X] ngày"
- **Nhắc định kỳ theo paymentFrequency:**
  - Nếu debt có paymentFrequency (Monthly/Quarterly/Yearly)
  - Tạo reminder tự động cho mỗi kỳ hạn

#### 2.7.7. Báo Cáo Công Nợ

**Tổng quan:**

- Tổng tiền đang cho vay (tổng remainingAmount của debts type=LENDING)
- Tổng tiền đang đi vay (tổng remainingAmount của debts type=BORROWING)
- Tổng lãi đã thu/trả
- Số lượng khoản nợ theo trạng thái (Active, Partial Paid, Paid, Overdue)

**Chi tiết từng khoản:**

- Lịch sử thanh toán đầy đủ
- Timeline: Ngày vay → Các lần trả → Ngày trả xong (nếu có)
- Biểu đồ tiến độ trả nợ (percentage)
- Dự đoán thời gian trả xong (dựa trên tốc độ trả hiện tại)

**Export:**

- Xuất báo cáo công nợ ra PDF/Excel
- Bao gồm tất cả transactions liên quan

### 2.8. Quản Lý Khoản Vay

- **Loại khoản vay**: Personal loan, Mortgage, Auto loan, Business loan, Other
- **Vay ngân hàng**: Quản lý các khoản vay với lãi suất cố định
- **Giải ngân khoản vay**:
  - Khi tạo khoản vay có thể chọn tài khoản để nhận tiền giải ngân
  - Nếu chọn account: Tự động cộng tiền vào tài khoản và tạo transaction thu nhập
  - Nếu không chọn: Chỉ ghi nhận khoản vay để tracking
  - Ngày giải ngân (disbursementDate) được ghi nhận để tính lịch trả nợ
- **Lịch trả nợ (Amortization Schedule)**:
  - Tự động tính toán kỳ hạn trả hàng tháng (gốc + lãi)
  - Lãi suất giảm dần theo số gốc còn lại
  - Hiển thị bảng trả nợ chi tiết 60 tháng với trạng thái paid/unpaid
  - Phân tách rõ tiền gốc và tiền lãi mỗi kỳ
  - Lịch trả bắt đầu từ: disbursementDate + 1 tháng (VD: Giải ngân 3/11 → Trả kỳ đầu 3/12)
  - Lưu giữ lịch sử các khoản đã thanh toán với số tiền thực tế
- **Ghi nhận thanh toán theo lịch**:
  - Thanh toán đúng số tiền monthlyPayment của tháng hiện tại
  - Tự động phân bổ vào principal (gốc) và interest (lãi)
  - Giảm remainingPrincipal và remainingMonths
  - Cập nhật nextPaymentDate tự động
- **Trả nợ gốc tự do (Extra Principal Payment)**:
  - Cho phép trả thêm tiền gốc bất kỳ lúc nào
  - Tự động tính toán lại monthlyPayment (giảm) dựa trên số gốc mới
  - **Số tháng vay (termMonths) KHÔNG thay đổi**: Vay 60 tháng thì vẫn phải trả 60 tháng
  - Chỉ giảm số tiền phải trả hàng tháng (monthlyPayment)
  - Lãi suất các kỳ sau giảm theo số gốc còn lại mới
  - Tạo transaction riêng với flag isPrepayment=true
- **Xóa khoản thanh toán**:
  - Chỉ được xóa trong vòng 7 ngày kể từ ngày thanh toán
  - Khôi phục trạng thái khoản vay về trước khi thanh toán
  - Hoàn tiền về tài khoản và xóa transaction liên quan
- **Lịch sử thanh toán (Payment History)**:
  - Hiển thị tất cả các lần thanh toán (theo lịch + trả gốc tự do)
  - Phân biệt scheduled payment (isPrepayment=false) vs extra principal (isPrepayment=true)
  - Ghi nhận rõ số tiền gốc/lãi của từng lần thanh toán
- **Tính lãi**:
  - Tự động tính lãi suất theo kỳ dựa trên số gốc còn lại
  - Công thức amortization chuẩn: M = P × [r(1+r)^n] / [(1+r)^n - 1]
  - Lãi mỗi tháng = remainingPrincipal × (interestRate / 12)
- **Báo cáo khoản vay**:
  - Tổng lãi đã trả / còn phải trả
  - Tổng gốc đã trả / còn lại
  - Biểu đồ tỷ lệ gốc/lãi theo thời gian
  - So sánh: Số tiền trả ban đầu vs số tiền trả hiện tại (sau khi trả gốc tự do)
  - Tiết kiệm được bao nhiêu lãi nhờ trả gốc tự do

### 2.9. Mục Tiêu Tài Chính

- **Đặt mục tiêu**: Tiết kiệm cho kỳ nghỉ, mua nhà, xe, v.v.
  - Tên mục tiêu
  - Số tiền mục tiêu (target amount)
  - Số tiền hiện tại (current amount - khởi tạo = 0)
  - Thời hạn (deadline)
  - Mô tả (tùy chọn)
  - Tài khoản liên kết (account_id) - tùy chọn
- **Đóng góp vào mục tiêu**:
  - User nhập số tiền muốn đóng góp
  - Chọn tài khoản nguồn (tiền mặt, ngân hàng, ví điện tử)
  - Số dư tài khoản nguồn **giảm** tương ứng
  - `currentAmount` của goal **tăng** tương ứng
  - Tạo transaction loại `GOAL_CONTRIBUTION` để tracking:
    - `type`: Chi tiêu (EXPENSE)
    - `category`: "Tiết kiệm" (Savings)
    - `amount`: Số tiền đóng góp
    - `account_id`: Tài khoản nguồn
    - `goal_id`: ID mục tiêu (foreign key)
    - `note`: "Đóng góp vào mục tiêu: [Tên mục tiêu]"
  - Ghi nhận lịch sử đóng góp (contribution history)
- **Theo dõi tiến độ**:
  - Hiển thị phần trăm hoàn thành mục tiêu
  - Số tiền hiện tại / Số tiền mục tiêu
  - Số tiền còn thiếu
  - Thời gian còn lại đến deadline
- **Thời hạn mục tiêu**:
  - Đặt deadline cho mỗi mục tiêu
  - Cảnh báo khi gần đến deadline nhưng chưa đạt mục tiêu
  - Tự động đánh dấu "Completed" khi `currentAmount >= targetAmount`
  - Đánh dấu "Overdue" nếu quá deadline mà chưa đạt
- **Hoàn thành mục tiêu**:
  - Khi đạt 100% tiến độ, hỏi user:
    - Option 1: **Rút tiền về tài khoản** (tạo transaction INCOME ngược lại)
    - Option 2: **Giữ tiền và đánh dấu hoàn thành** (tiền vẫn trong goal)
    - Option 3: **Chuyển sang mục tiêu khác**
- **Hủy/Xóa mục tiêu**:
  - Khi user muốn xóa goal, hỏi xử lý tiền đã đóng góp:
    - Option 1: **Hoàn tiền về tài khoản gốc**
      - Tạo transaction INCOME để hoàn `currentAmount` về account
      - Xóa goal và tất cả transaction liên quan
    - Option 2: **Chuyển sang mục tiêu khác**
      - Chuyển `currentAmount` sang goal khác
      - Xóa goal cũ
    - Option 3: **Xóa luôn (không hoàn tiền)**
      - Chỉ xóa goal tracking
      - Giữ nguyên transaction history (để audit)
      - User tự quản lý số tiền
- **Rút tiền từ mục tiêu**:
  - Cho phép rút một phần hoặc toàn bộ tiền từ goal
  - `currentAmount` **giảm** tương ứng
  - Số dư tài khoản đích **tăng** tương ứng
  - Tạo transaction loại `GOAL_WITHDRAWAL`
  - Ghi nhận lý do rút tiền
- **Lịch sử đóng góp/rút tiền**:
  - Xem tất cả lần đóng góp/rút tiền
  - Thời gian, số tiền, tài khoản nguồn/đích
  - Ghi chú từng lần
- **Đóng góp tự động** (Phase nâng cao):
  - Thiết lập quy tắc tự động: "Mỗi tháng trừ X% lương vào mục tiêu Y"
  - Tự động chạy vào ngày được chọn (VD: ngày 1, 15 hàng tháng)
  - Gửi thông báo xác nhận sau mỗi lần đóng góp tự động
- **Phân tích mục tiêu**:
  - Tốc độ tiết kiệm trung bình (VND/tháng)
  - Dự đoán thời gian đạt mục tiêu dựa trên tốc độ hiện tại
  - So sánh với timeline deadline
  - Gợi ý số tiền cần đóng góp hàng tháng để đạt deadline

### 2.10. Quản Lý Theo Sự Kiện/Dự Án

- **Tạo sự kiện**: Đám cưới, du lịch, sinh nhật, sửa nhà, v.v.
- **Gắn giao dịch vào sự kiện**: Theo dõi chi tiêu cho từng sự kiện cụ thể
- **Ngân sách sự kiện**: Đặt budget riêng cho mỗi sự kiện
- **Báo cáo sự kiện**: Xem tổng chi tiêu cho từng sự kiện

### 2.11. Nhắc Nhở và Thông Báo

- **Lịch hẹn thanh toán**: Tạo lịch nhắc cho hóa đơn định kỳ (điện, nước, internet, v.v.)
- **Nhắc nhở công nợ**: Đến hạn trả/thu nợ
- **Nhắc nhở thẻ tín dụng**: Kỳ thanh toán thẻ
- **Cảnh báo ngân sách**: Khi đạt 80%, 100% ngân sách
- **Báo cáo định kỳ**: Gửi báo cáo hàng tuần/tháng qua email
- **Thông báo đẩy**: Push notification trên mobile
- **Nhắc nhở tùy chỉnh**: Người dùng tự đặt nhắc nhở riêng

### 2.12. Tìm Kiếm và Bộ Lọc

- **Tìm kiếm nâng cao**: Theo từ khóa, số tiền, ngày tháng
- **Bộ lọc đa điều kiện**: Kết hợp nhiều tiêu chí lọc
- **Lưu bộ lọc**: Lưu các điều kiện tìm kiếm thường dùng
- **Tìm kiếm theo người**: Tìm công nợ với người cụ thể
- **Tìm kiếm theo sự kiện**: Xem tất cả giao dịch của một sự kiện

### 2.13. Chia Sẻ và Cộng Tác

- **Chia sẻ sổ**: Chia sẻ quyền xem/chỉnh sửa với người khác (vợ/chồng, gia đình)
- **Phân quyền**: Chỉ xem, xem và thêm, toàn quyền
- **Sổ gia đình**: Tạo sổ chung cho cả gia đình
- **Đồng bộ real-time**: Cập nhật ngay khi có thay đổi

### 2.14. Cài Đặt và Tùy Chỉnh

- **Đa ngôn ngữ**: Tiếng Việt, Tiếng Anh
- **Đơn vị tiền tệ**: VND, USD, EUR, v.v.
- **Định dạng số**: Phân cách hàng nghìn, số thập phân
- **Giao diện**: Chế độ sáng/tối (Light/Dark mode)
- **Sao lưu và khôi phục**: Backup dữ liệu lên cloud (Google Drive, Dropbox)
- **Xuất/nhập dữ liệu**: Import/Export CSV, Excel
- **Bảo mật**: Mã PIN, Face ID, Touch ID
- **Ẩn số dư**: Tùy chọn ẩn/hiện số tiền trên màn hình chính
- **Bảo mật**: Mã PIN, Face ID, Touch ID
- **Ẩn số dư**: Tùy chọn ẩn/hiện số tiền trên màn hình chính

## 3. Yêu Cầu Phi Chức Năng

### 3.1. Hiệu Năng

- Thời gian phản hồi: < 2 giây cho các thao tác thông thường
- Hỗ trợ xử lý đồng thời nhiều người dùng
- Tải trang nhanh: < 3 giây

### 3.2. Bảo Mật

- Mã hóa dữ liệu nhạy cảm (mật khẩu, thông tin tài chính)
- HTTPS cho tất cả kết nối
- Xác thực và phân quyền người dùng
- Bảo vệ chống SQL Injection, XSS, CSRF
- Tuân thủ GDPR/quy định bảo mật dữ liệu

### 3.3. Khả Năng Mở Rộng

- Kiến trúc microservices hoặc modular
- Hỗ trợ tăng số lượng người dùng
- Dễ dàng thêm tính năng mới

### 3.4. Tính Khả Dụng

- Uptime: 99.5% trở lên
- Sao lưu dữ liệu định kỳ
- Khôi phục sau sự cố nhanh chóng

### 3.5. Trải Nghiệm Người Dùng

- Giao diện thân thiện, trực quan
- Responsive design (tương thích mobile, tablet, desktop)
- Hỗ trợ offline mode cơ bản (Progressive Web App)
- Accessibility (hỗ trợ người khuyết tật)

### 3.6. Tương Thích

- **Web**: Chrome, Firefox, Safari, Edge (phiên bản mới nhất)
- **Mobile**: iOS 13+, Android 8+
- **Desktop**: Windows 10+, macOS 10.14+, Linux

## 4. Công Nghệ Sử Dụng

### 4.1. Frontend

- **Framework**: React.js 18+ với TypeScript
- **Build Tool**: Vite (fast build, HMR tốt)
- **UI Framework**: Ant Design (antd) - component library giàu tính năng
- **CSS Solution**: Styled Components (CSS-in-JS, component-scoped styles, dynamic theming)
- **State Management**: Redux với Redux-Saga (xử lý side effects)
- **Utility Library**: Lodash (xử lý data, arrays, objects)
- **HTTP Client**: Axios (gọi API)
- **Charts**: Chart.js (visualization dữ liệu tài chính)
- **Architecture Pattern**: Atomic Design (atoms, molecules, organisms, templates, pages)
- **Mobile**: React Native (phase sau)

### 4.2. Backend

- **Framework**: NestJS (TypeScript framework for Node.js)
- **Architecture**: Modular/Layered (Controllers, Services, Repositories)
- **API Style**: RESTful API
- **Authentication**: JWT với Passport.js
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **ORM**: TypeORM hoặc Prisma

**Modules đề xuất**:

- auth (Authentication & Authorization)
- users (User management)
- transactions (Transaction management)
- categories (Category management)
- budgets (Budget management)
- accounts (Bank account/wallet management)
- debts (Debt management - cho vay/đi vay)
- events (Event/Project management)
- reports (Reports & analytics)
- goals (Financial goals)
- reminders (Reminders & schedules)
- notifications (Notifications)
- sharing (Shared books & collaboration)
- common (Shared utilities, guards, interceptors)

### 4.3. Database - Đề Xuất

**Lựa chọn 1: PostgreSQL (Khuyến nghị)** ⭐

- **Ưu điểm**:
  - Database quan hệ mạnh mẽ, phù hợp với dữ liệu tài chính
  - Hỗ trợ ACID transactions (quan trọng cho giao dịch tiền)
  - JSON/JSONB support (linh hoạt khi cần)
  - Powerful querying, indexing
  - Free, open-source, community lớn
  - TypeORM/Prisma hỗ trợ tốt
- **Sử dụng cho**: Users, Transactions, Categories, Budgets, Accounts, Goals

**Lựa chọn 2: MySQL**

- Tương tự PostgreSQL nhưng phổ biến hơn
- Performance tốt cho read-heavy workloads
- Dễ hosting hơn (nhiều provider)

**Cache & Session**:

- **Redis**:
  - Cache dữ liệu thường xuyên truy cập (danh mục, user sessions)
  - Session storage
  - Rate limiting
  - Queue jobs (email, notifications)

**File Storage**:

- **Local**: Giai đoạn development
- **Cloud**: AWS S3, Cloudinary, hoặc Google Cloud Storage (cho hóa đơn, ảnh đính kèm)

**Database Schema chính**:

```sql
users (id, email, password, name, avatar, created_at, updated_at)
accounts (id, user_id, name, type, balance, currency, created_at)
categories (id, user_id, name, type, icon, color, is_default)
transactions (id, user_id, account_id, category_id, amount, type, date, note, image_url, event_id, goal_id)
budgets (id, user_id, category_id, amount, period, start_date, end_date)
goals (id, user_id, name, target_amount, current_amount, deadline, status, description, linked_account_id)
goal_transactions (id, goal_id, account_id, transaction_id, amount, type, note, created_at)
recurring_transactions (id, user_id, transaction_template, frequency, next_date)
debts (id, user_id, type, person_name, amount, interest_rate, borrowed_date, due_date, status)
debt_payments (id, debt_id, amount, payment_date, note)
events (id, user_id, name, budget, start_date, end_date, description)
reminders (id, user_id, title, type, due_date, frequency, is_active)
shared_books (id, owner_id, name, permission_type)
shared_book_members (id, book_id, user_id, role)
```

**Chi tiết quan trọng**:

- **transactions**: Thêm `goal_id` để link transaction với goal (khi đóng góp/rút tiền từ goal)
- **goals**: Thêm `description`, `linked_account_id` (tài khoản mặc định cho goal)
- **goal_transactions**: Bảng mới tracking lịch sử đóng góp/rút tiền từ goal
  - `type`: 'CONTRIBUTION' (đóng góp) hoặc 'WITHDRAWAL' (rút tiền)
  - Link với `transactions` table để đồng bộ số dư account

### 4.4. DevOps & Infrastructure

- **Cloud**: AWS/Google Cloud/Azure
- **Container**: Docker, Kubernetes
- **CI/CD**: GitHub Actions/GitLab CI/Jenkins
- **Monitoring**: Prometheus, Grafana, Sentry

### 4.5. Khác

- **Email Service**: SendGrid/AWS SES
- **Push Notification**: Firebase Cloud Messaging
- **Payment**: Stripe/PayPal (nếu cần tính năng trả phí)

## 5. Các Giai Đoạn Phát Triển

### Phase 1: MVP (Minimum Viable Product)

- Đăng ký/Đăng nhập
- Quản lý tài khoản/ví (thêm, sửa, xóa)
- Thêm/Sửa/Xóa giao dịch thu chi
- Danh mục mặc định (ăn uống, di chuyển, giải trí, v.v.)
- Báo cáo tổng quan (thu, chi, số dư)
- Giao diện cơ bản responsive

### Phase 2: Core Features

- Quản lý ngân sách theo danh mục
- Báo cáo nâng cao với biểu đồ (tròn, cột, đường)
- Tùy chỉnh danh mục
- Giao dịch định kỳ
- Tìm kiếm và lọc nâng cao
- Quản lý công nợ cơ bản (cho vay/đi vay)
- Nhắc nhở thanh toán

### Phase 3: Advanced Features

- Mục tiêu tài chính
- Quản lý theo sự kiện/dự án
- Quản lý khoản vay (thẻ tín dụng, vay ngân hàng)
- Chia sẻ sổ với người khác
- Xuất báo cáo PDF/Excel
- Mobile app
- Bảo mật nâng cao (PIN, Face ID)

### Phase 4: Premium Features

- Chia sẻ ngân sách với gia đình
- Tư vấn tài chính thông minh
- Tích hợp đa nền tảng
- API cho third-party

## 6. User Stories

### Người Dùng Cơ Bản

- Là người dùng, tôi muốn thêm một khoản chi tiêu để theo dõi tiền bạc của mình
- Là người dùng, tôi muốn xem báo cáo chi tiêu tháng này để biết mình đã chi bao nhiêu
- Là người dùng, tôi muốn đặt ngân sách hàng tháng để kiểm soát chi tiêu
- Là người dùng, tôi muốn quản lý nhiều tài khoản (tiền mặt, ngân hàng, ví điện tử) để theo dõi tổng thể tài chính

### Người Dùng Nâng Cao

- Là người dùng, tôi muốn tạo mục tiêu tiết kiệm để đạt được kế hoạch tài chính
- Là người dùng, tôi muốn đóng góp tiền từ tài khoản vào mục tiêu và hệ thống tự động giảm số dư tài khoản
- Là người dùng, tôi muốn xem lịch sử đóng góp vào mục tiêu để biết tôi đã tiết kiệm được bao nhiêu
- Là người dùng, tôi muốn rút tiền từ mục tiêu về tài khoản khi cần dùng đột xuất
- Là người dùng, tôi muốn được hỏi xử lý tiền đã đóng góp khi xóa mục tiêu (hoàn về tài khoản hoặc chuyển sang mục tiêu khác)
- Là người dùng, tôi muốn hệ thống dự đoán thời gian đạt mục tiêu dựa trên tốc độ tiết kiệm hiện tại
- Là người dùng, tôi muốn nhận thông báo khi sắp vượt ngân sách để kịp thời điều chỉnh
- Là người dùng, tôi muốn xuất báo cáo Excel để lưu trữ hoặc chia sẻ
- Là người dùng, tôi muốn ghi nhận các khoản cho vay/đi vay để quản lý công nợ
- Là người dùng, tôi muốn theo dõi chi tiêu theo sự kiện (đám cưới, du lịch) để biết tổng chi phí
- Là người dùng, tôi muốn chia sẻ sổ với vợ/chồng để cùng quản lý tài chính gia đình
- Là người dùng, tôi muốn được nhắc nhở trước kỳ hạn thanh toán để không bị trễ hạn
- Là người dùng, tôi muốn xem bảng lịch trả nợ chi tiết (gốc + lãi từng tháng) để biết tổng chi phí vay
- Là người dùng, tôi muốn trả thêm tiền gốc khi có tiền thừa để giảm lãi các tháng sau
- Là người dùng, tôi muốn hệ thống tự động tính lại lịch trả nợ khi tôi trả nợ trước hạn

## 7. Metrics Đo Lường Thành Công

- Số lượng người dùng đăng ký
- Tỷ lệ người dùng hoạt động hàng ngày/tháng (DAU/MAU)
- Số lượng giao dịch được ghi nhận
- Thời gian sử dụng trung bình
- Tỷ lệ giữ chân người dùng (retention rate)
- Đánh giá của người dùng (rating)

## 8. Rủi Ro và Thách Thức

- Bảo mật dữ liệu tài chính nhạy cảm
- Đồng bộ dữ liệu giữa nhiều thiết bị
- Xử lý multiple currencies
- Tuân thủ quy định pháp luật về tài chính
- Cạnh tranh với các ứng dụng tương tự

## 9. Tài Liệu Tham Khảo

- UX/UI Design guidelines
- API Documentation
- Database Schema
- Security best practices
- Privacy Policy & Terms of Service

---

**Lưu ý**: Đây là tài liệu yêu cầu chi tiết, có thể điều chỉnh theo nhu cầu và nguồn lực thực tế của dự án.
