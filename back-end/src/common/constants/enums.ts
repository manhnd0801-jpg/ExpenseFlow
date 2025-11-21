/**
 * Integer-based Enums for Expense Management System
 * CRITICAL: All enum values MUST be integers matching database SMALLINT columns
 * DO NOT change these values without updating database schema and frontend enums
 */

// Account Types - Database stores as SMALLINT
export enum AccountType {
  CASH = 1,           // Tiền mặt
  BANK = 2,           // Tài khoản ngân hàng
  CREDIT_CARD = 3,    // Thẻ tín dụng
  E_WALLET = 4,       // Ví điện tử
  INVESTMENT = 5,     // Tài khoản đầu tư
}

// Transaction Types
export enum TransactionType {
  INCOME = 1,         // Thu nhập
  EXPENSE = 2,        // Chi tiêu
  TRANSFER = 3,       // Chuyển khoản
}

// Category Types
export enum CategoryType {
  INCOME = 1,         // Danh mục thu nhập
  EXPENSE = 2,        // Danh mục chi tiêu
}

// Budget Periods
export enum BudgetPeriod {
  DAILY = 1,          // Hàng ngày
  WEEKLY = 2,         // Hàng tuần
  MONTHLY = 3,        // Hàng tháng
  QUARTERLY = 4,      // Hàng quý
  YEARLY = 5,         // Hàng năm
  CUSTOM = 6,         // Tùy chỉnh
}

// Goal Status
export enum GoalStatus {
  ACTIVE = 1,         // Đang hoạt động
  COMPLETED = 2,      // Đã hoàn thành
  CANCELLED = 3,      // Đã hủy
}

// Debt Types
export enum DebtType {
  LENDING = 1,        // Cho vay
  BORROWING = 2,      // Đi vay
}

// Debt Status
export enum DebtStatus {
  ACTIVE = 1,         // Đang hoạt động
  PAID = 2,           // Đã thanh toán
  PARTIAL = 3,        // Thanh toán một phần
  OVERDUE = 4,        // Quá hạn
}

// Loan Types
export enum LoanType {
  PERSONAL = 1,       // Vay cá nhân
  MORTGAGE = 2,       // Vay mua nhà
  AUTO = 3,           // Vay mua xe
  BUSINESS = 4,       // Vay kinh doanh
  OTHER = 5,          // Khác
}

// Loan Status
export enum LoanStatus {
  ACTIVE = 1,         // Đang hoạt động
  PAID_OFF = 2,       // Đã thanh toán hết
  DEFAULTED = 3,      // Vỡ nợ
  REFINANCED = 4,     // Tái cấu trúc
}

// Payment Status
export enum PaymentStatus {
  PENDING = 1,        // Chờ thanh toán
  PAID = 2,          // Đã thanh toán
  FAILED = 3,         // Thanh toán thất bại
  SKIPPED = 4,        // Bỏ qua
}

// Reminder Types
export enum ReminderType {
  PAYMENT = 1,        // Nhắc nhở thanh toán
  BUDGET = 2,         // Nhắc nhở ngân sách
  GOAL = 3,           // Nhắc nhở mục tiêu
  CUSTOM = 4,         // Nhắc nhở tùy chỉnh
}

// Shared Book Roles
export enum BookRole {
  VIEWER = 1,         // Chỉ xem
  EDITOR = 2,         // Chỉnh sửa
  ADMIN = 3,          // Quản trị
}

// Notification Types
export enum NotificationType {
  BUDGET_ALERT = 1,   // Cảnh báo ngân sách
  PAYMENT_DUE = 2,    // Đến hạn thanh toán
  GOAL_PROGRESS = 3,  // Tiến độ mục tiêu
  DEBT_REMINDER = 4,  // Nhắc nhở công nợ
  SYSTEM = 5,         // Thông báo hệ thống
}

// User Status
export enum UserStatus {
  ACTIVE = 1,         // Đang hoạt động
  INACTIVE = 2,       // Không hoạt động
  SUSPENDED = 3,      // Tạm khóa
  DELETED = 4,        // Đã xóa
}

// Currency Types
export enum Currency {
  VND = 1,            // Việt Nam Đồng
  USD = 2,            // US Dollar
  EUR = 3,            // Euro
  JPY = 4,            // Japanese Yen
  CNY = 5,            // Chinese Yuan
}

// Frequency Types (for recurring transactions, reminders)
export enum FrequencyType {
  ONCE = 1,           // Một lần
  DAILY = 2,          // Hàng ngày
  WEEKLY = 3,         // Hàng tuần
  MONTHLY = 4,        // Hàng tháng
  QUARTERLY = 5,      // Hàng quý
  YEARLY = 6,         // Hàng năm
}

// Event Status
export enum EventStatus {
  PLANNED = 1,        // Đã lên kế hoạch
  ACTIVE = 2,         // Đang diễn ra
  COMPLETED = 3,      // Đã hoàn thành
  CANCELLED = 4,      // Đã hủy
}