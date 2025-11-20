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

### 2.7. Quản Lý Công Nợ

- **Cho vay**: Ghi nhận các khoản cho người khác vay
  - Người vay
  - Số tiền cho vay
  - Lãi suất (nếu có)
  - Ngày cho vay
  - Hạn trả
  - Trạng thái (chưa trả, đã trả một phần, đã trả hết)
- **Đi vay**: Ghi nhận các khoản vay nợ
  - Người cho vay/Tổ chức
  - Số tiền vay
  - Lãi suất
  - Ngày vay
  - Hạn trả
  - Kỳ hạn trả (hàng tháng, quý, năm)
- **Ghi nhận thanh toán**: Cập nhật từng lần trả nợ/thu nợ
- **Lịch sử công nợ**: Xem chi tiết các lần thanh toán
- **Nhắc nhở đến hạn**: Thông báo khi đến hạn trả/thu nợ

### 2.8. Quản Lý Khoản Vay

- **Thẻ tín dụng**: Theo dõi chi tiêu thẻ, hạn mức, kỳ thanh toán
- **Vay ngân hàng**: Quản lý các khoản vay dài hạn (nhà, xe)
- **Lịch trả nợ (Amortization)**:
  - Tự động tính toán kỳ hạn trả hàng tháng (gốc + lãi)
  - Lãi suất giảm dần theo số gốc còn lại
  - Hiển thị bảng trả nợ chi tiết (amortization schedule)
  - Phân tách rõ tiền gốc và tiền lãi mỗi kỳ
- **Thanh toán ngoài kế hoạch (Prepayment)**:
  - Cho phép trả thêm tiền gốc bất kỳ lúc nào
  - Tự động tính toán lại lịch trả nợ khi có prepayment
  - Lãi suất các kỳ sau giảm theo số gốc mới
  - Tùy chọn: Giảm số tiền trả hàng tháng HOẶC giảm số tháng trả
- **Tính lãi**:
  - Tự động tính lãi suất theo kỳ dựa trên số gốc còn lại
  - Hỗ trợ nhiều phương thức tính lãi: Lãi đơn, lãi kép
  - Tính lãi theo công thức amortization chuẩn
- **Cảnh báo hạn mức**: Thông báo khi sử dụng quá hạn mức thẻ
- **Báo cáo khoản vay**:
  - Tổng lãi đã trả / còn phải trả
  - Tổng gốc đã trả / còn lại
  - Biểu đồ tỷ lệ gốc/lãi theo thời gian
  - So sánh kế hoạch ban đầu vs thực tế (khi có prepayment)

### 2.9. Mục Tiêu Tài Chính

- **Đặt mục tiêu**: Tiết kiệm cho kỳ nghỉ, mua nhà, xe, v.v.
- **Theo dõi tiến độ**: Hiển thị phần trăm hoàn thành mục tiêu
- **Thời hạn mục tiêu**: Đặt deadline cho mỗi mục tiêu
- **Đóng góp tự động**: Tự động trừ một phần thu nhập vào mục tiêu

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
transactions (id, user_id, account_id, category_id, amount, type, date, note, image_url, event_id)
budgets (id, user_id, category_id, amount, period, start_date, end_date)
goals (id, user_id, name, target_amount, current_amount, deadline, status)
recurring_transactions (id, user_id, transaction_template, frequency, next_date)
debts (id, user_id, type, person_name, amount, interest_rate, borrowed_date, due_date, status)
debt_payments (id, debt_id, amount, payment_date, note)
events (id, user_id, name, budget, start_date, end_date, description)
reminders (id, user_id, title, type, due_date, frequency, is_active)
shared_books (id, owner_id, name, permission_type)
shared_book_members (id, book_id, user_id, role)
```

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
