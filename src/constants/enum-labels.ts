/**
 * Enum Label Mappings for Display
 * Maps numeric enum values to user-friendly Vietnamese labels
 */

import {
  AccountType,
  BookRole,
  BudgetPeriod,
  CategoryType,
  DebtStatus,
  DebtType,
  GoalStatus,
  LoanStatus,
  LoanType,
  NotificationType,
  PaymentStatus,
  ReminderType,
  TransactionType,
} from './enums';

export const AccountTypeLabels: Record<AccountType, string> = {
  [AccountType.CASH]: 'Tiền mặt',
  [AccountType.BANK]: 'Ngân hàng',
  [AccountType.CREDIT_CARD]: 'Thẻ tín dụng',
  [AccountType.DIGITAL_WALLET]: 'Ví điện tử',
  [AccountType.INVESTMENT]: 'Đầu tư',
};

export const TransactionTypeLabels: Record<TransactionType, string> = {
  [TransactionType.INCOME]: 'Thu nhập',
  [TransactionType.EXPENSE]: 'Chi tiêu',
  [TransactionType.TRANSFER]: 'Chuyển khoản',
};

export const CategoryTypeLabels: Record<CategoryType, string> = {
  [CategoryType.INCOME]: 'Thu nhập',
  [CategoryType.EXPENSE]: 'Chi tiêu',
};

export const BudgetPeriodLabels: Record<BudgetPeriod, string> = {
  [BudgetPeriod.DAILY]: 'Hàng ngày',
  [BudgetPeriod.WEEKLY]: 'Hàng tuần',
  [BudgetPeriod.MONTHLY]: 'Hàng tháng',
  [BudgetPeriod.QUARTERLY]: 'Hàng quý',
  [BudgetPeriod.YEARLY]: 'Hàng năm',
  [BudgetPeriod.CUSTOM]: 'Tùy chỉnh',
};

export const GoalStatusLabels: Record<GoalStatus, string> = {
  [GoalStatus.ACTIVE]: 'Đang hoạt động',
  [GoalStatus.COMPLETED]: 'Đã hoàn thành',
  [GoalStatus.CANCELLED]: 'Đã hủy',
};

export const DebtTypeLabels: Record<DebtType, string> = {
  [DebtType.LENDING]: 'Cho vay',
  [DebtType.BORROWING]: 'Đi vay',
};

export const DebtStatusLabels: Record<DebtStatus, string> = {
  [DebtStatus.ACTIVE]: 'Đang hoạt động',
  [DebtStatus.PARTIAL_PAID]: 'Đã trả một phần',
  [DebtStatus.COMPLETED]: 'Đã hoàn thành',
  [DebtStatus.OVERDUE]: 'Quá hạn',
};

export const LoanTypeLabels: Record<LoanType, string> = {
  [LoanType.PERSONAL]: 'Vay cá nhân',
  [LoanType.HOME]: 'Vay mua nhà',
  [LoanType.AUTO]: 'Vay mua ô tô',
  [LoanType.EDUCATIONAL]: 'Vay học tập',
  [LoanType.OTHER]: 'Khác',
};

export const LoanStatusLabels: Record<LoanStatus, string> = {
  [LoanStatus.ACTIVE]: 'Đang hoạt động',
  [LoanStatus.COMPLETED]: 'Đã hoàn thành',
  [LoanStatus.DEFAULTED]: 'Mặc định',
  [LoanStatus.REFINANCED]: 'Tái cấp vốn',
};

export const PaymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Đang chờ',
  [PaymentStatus.COMPLETED]: 'Đã hoàn thành',
  [PaymentStatus.FAILED]: 'Thất bại',
  [PaymentStatus.SKIPPED]: 'Bỏ qua',
};

export const ReminderTypeLabels: Record<ReminderType, string> = {
  [ReminderType.PAYMENT]: 'Nhắc thanh toán',
  [ReminderType.BUDGET]: 'Nhắc ngân sách',
  [ReminderType.DEBT]: 'Nhắc công nợ',
  [ReminderType.CUSTOM]: 'Nhắc khác',
};

export const BookRoleLabels: Record<BookRole, string> = {
  [BookRole.VIEWER]: 'Chỉ xem',
  [BookRole.EDITOR]: 'Chỉnh sửa',
  [BookRole.ADMIN]: 'Quản trị viên',
};

export const NotificationTypeLabels: Record<NotificationType, string> = {
  [NotificationType.BUDGET_ALERT]: 'Cảnh báo ngân sách',
  [NotificationType.PAYMENT_DUE]: 'Thanh toán đến hạn',
  [NotificationType.DEBT_REMINDER]: 'Nhắc công nợ',
  [NotificationType.GOAL_MILESTONE]: 'Mục tiêu đạt được',
  [NotificationType.SYSTEM]: 'Thông báo hệ thống',
};
