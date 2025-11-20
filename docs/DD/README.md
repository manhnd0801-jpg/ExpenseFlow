# README - Detailed Design Documentation

## 📚 Tổng Quan Tài Liệu

Thư mục này chứa các tài liệu thiết kế chi tiết (Detailed Design - DD) cho dự án **Quản Lý Chi Tiêu Cá Nhân**.

---

## 📑 Danh Sách Tài Liệu

### 01. [Architecture](./01-ARCHITECTURE.md) 🏗️

**Kiến trúc hệ thống tổng thể**

- Kiến trúc tầng (Layered Architecture)
- Frontend Architecture (React.js + Atomic Design)
- Backend Architecture (NestJS Modules)
- State Management Flow (Redux-Saga)
- Database Design Overview
- API Design Patterns
- Security Architecture
- Caching Strategy (Redis)
- File Upload & Storage
- Deployment Architecture

**Sử dụng cho**: Dev Team, DevOps, Tech Lead

---

### 02. [Database Design](./02-DATABASE-DESIGN.md) 🗄️

**Thiết kế cơ sở dữ liệu chi tiết**

- 14 bảng dữ liệu với schema đầy đủ
- Entity Relationship Diagram (ERD)
- Constraints & Indexes
- Database Functions & Triggers
- Auto-update mechanisms
- Initial seed data
- Migration strategies

**Bảng chính**:

- users, accounts, categories
- transactions, budgets, goals
- debts, debt_payments
- events, recurring_transactions
- reminders, notifications
- shared_books, shared_book_members

**Sử dụng cho**: Backend Developers, Database Admins

---

### 03. [API Specification](./03-API-SPECIFICATION.md) 🔌

**Đặc tả API RESTful đầy đủ**

**11 nhóm API endpoints**:

1. Authentication (Login, Register, Refresh Token)
2. Transactions (CRUD, Bulk, Summary)
3. Accounts (CRUD, Transfer)
4. Categories (CRUD)
5. Budgets (CRUD, Progress tracking)
6. Debts (CRUD, Payment history)
7. Events (CRUD, Summary)
8. Goals (CRUD, Progress)
9. Reports (Dashboard, Charts, Export)
10. Reminders (CRUD)
11. Notifications (Read, Mark all read)

**Bao gồm**:

- Request/Response formats
- Query parameters
- Error codes & handling
- Pagination
- Authentication headers
- Validation rules

**Sử dụng cho**: Frontend & Backend Developers, QA Testers

---

### 04. [UI/UX Design](./04-UI-UX-DESIGN.md) 🎨

**Hệ thống thiết kế giao diện**

**Design System**:

- Color Palette (Primary, Secondary, Category colors)
- Typography (Fonts, Sizes, Weights)
- Spacing System (4px base)
- Border Radius, Shadows
- Component Specifications

**Screen Designs**:

- Login Screen
- Dashboard Screen
- Transaction List & Detail
- Add/Edit Transaction Modal
- Budget Management
- Debt Management
- Reports & Charts

**Components**:

- Button variants
- Transaction Card
- Budget Progress Bar
- Amount Input
- Date Picker
- Category Selector

**Responsive Design**:

- Mobile Layout
- Tablet Layout
- Desktop Layout
- Touch optimizations

**Accessibility**:

- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast ratios

**Sử dụng cho**: Frontend Developers, UI/UX Designers

---

### 05. [Business Flow](./05-BUSINESS-FLOW.md) 🔄

**Quy trình nghiệp vụ chi tiết**

**8 quy trình chính**:

1. **Đăng ký & Đăng nhập**

   - Registration flow
   - Login flow
   - Password reset flow

2. **Quản lý giao dịch**

   - Thêm giao dịch
   - Chuyển tiền giữa tài khoản
   - Sửa giao dịch
   - Xóa giao dịch

3. **Quản lý ngân sách**

   - Tạo ngân sách
   - Theo dõi real-time
   - Cảnh báo tự động
   - Báo cáo cuối kỳ

4. **Quản lý công nợ**

   - Tạo khoản cho vay/đi vay
   - Ghi nhận thanh toán
   - Kiểm tra nợ quá hạn
   - Tính lãi tự động

5. **Giao dịch định kỳ**

   - Tạo recurring transaction
   - Auto-execute cronjob

6. **Chia sẻ sổ**

   - Tạo shared book
   - Mời thành viên
   - Đồng bộ real-time
   - Kiểm soát quyền

7. **Xuất báo cáo**

   - Export Excel
   - Export PDF
   - Generate charts

8. **Backup & Restore**
   - Auto backup
   - Manual backup
   - Restore process

**Sử dụng cho**: Business Analysts, Developers, QA Testers

---

### 06. [Testing Strategy](./06-TESTING-STRATEGY.md) 🧪

**Chiến lược kiểm thử toàn diện**

**Testing Pyramid**:

- Unit Tests (70%)
- Integration Tests (20%)
- E2E Tests (10%)

**Frontend Testing**:

- Component tests (React Testing Library)
- Redux tests (Reducers, Sagas)
- Utility tests

**Backend Testing**:

- Service tests
- Controller tests
- Repository tests
- Validator tests

**Integration Tests**:

- API E2E tests
- Database integration tests

**E2E Tests** (Cypress):

- Transaction flow
- Budget flow
- Authentication flow

**Performance Testing** (k6):

- Load testing
- Stress testing

**Security Testing**:

- Authentication tests
- SQL Injection prevention
- XSS prevention

**Coverage Goals**: ≥ 80% overall

**Sử dụng cho**: QA Engineers, Developers

---

## 🎯 Mục Đích Sử Dụng

### Cho Developers

1. Đọc **Architecture** để hiểu tổng quan hệ thống
2. Đọc **Database Design** trước khi code backend
3. Tham khảo **API Specification** khi implement endpoints
4. Follow **UI/UX Design** khi code frontend components
5. Hiểu **Business Flow** để implement logic đúng
6. Viết tests theo **Testing Strategy**

### Cho Project Managers

1. **Business Flow** - Hiểu quy trình nghiệp vụ
2. **Architecture** - Overview technical approach
3. **API Specification** - Estimate development effort

### Cho QA Testers

1. **Business Flow** - Tạo test cases
2. **API Specification** - API testing
3. **Testing Strategy** - Test planning
4. **UI/UX Design** - UI testing scenarios

---

## 📊 Checklist Hoàn Thành

Trước khi bắt đầu development, đảm bảo:

- [x] Requirements đã được review và approve
- [x] Architecture design đã được thống nhất
- [x] Database schema đã được finalize
- [x] API endpoints đã được define rõ ràng
- [x] UI/UX mockups đã được approve
- [x] Business flows đã được validate
- [x] Testing strategy đã được setup
- [ ] Development environment đã được setup
- [ ] CI/CD pipeline đã được configure

---

## 🔄 Cập Nhật Tài Liệu

Tài liệu DD cần được cập nhật khi:

- Thay đổi requirements
- Thêm features mới
- Refactor architecture
- Thay đổi database schema
- Update API endpoints
- Sửa business logic

**Quy trình update**:

1. Tạo branch mới
2. Update file DD tương ứng
3. Commit với message rõ ràng
4. Create Pull Request
5. Review & Approve
6. Merge vào main

---

## 📞 Liên Hệ

Nếu có thắc mắc về tài liệu DD:

- Tech Lead: [email]
- Backend Lead: [email]
- Frontend Lead: [email]

---

## 📜 Version History

| Version | Date       | Changes             | Author         |
| ------- | ---------- | ------------------- | -------------- |
| 1.0.0   | 2025-11-19 | Initial DD creation | GitHub Copilot |

---

**Lưu ý**: Tài liệu này là living document, sẽ được cập nhật liên tục trong quá trình phát triển dự án.
