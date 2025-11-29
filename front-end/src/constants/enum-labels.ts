/**
 * Enum Label Mappings for Display
 * ⚠️ DEPRECATED: This file is deprecated. Use useI18n hook instead.
 *
 * @deprecated Use `useI18n().getAccountTypeLabel()` and similar methods instead.
 *
 * New Usage:
 * ```tsx
 * import { useI18n } from '@hooks';
 *
 * function MyComponent() {
 *   const { getAccountTypeLabel } = useI18n();
 *   return <div>{getAccountTypeLabel(AccountType.CASH)}</div>;
 * }
 * ```
 */

import {
  AccountType,
  BookRole,
  BudgetPeriod,
  CategoryType,
  Currency,
  DebtStatus,
  DebtType,
  EventStatus,
  GoalStatus,
  LoanStatus,
  LoanType,
  NotificationType,
  PaymentStatus,
  ReminderType,
  TransactionType,
} from './enums';

// Currency Code Mapping - Convert integer enum to ISO currency code
export const CurrencyCodeMap: Record<Currency, string> = {
  [Currency.VND]: 'VND',
  [Currency.USD]: 'USD',
  [Currency.EUR]: 'EUR',
  [Currency.JPY]: 'JPY',
  [Currency.CNY]: 'CNY',
};

// Legacy Vietnamese-only labels - DEPRECATED
// Use useI18n() hook for multilingual support
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

export const CurrencyLabels: Record<Currency, string> = {
  [Currency.VND]: 'Việt Nam Đồng',
  [Currency.USD]: 'US Dollar',
  [Currency.EUR]: 'Euro',
  [Currency.JPY]: 'Japanese Yen',
  [Currency.CNY]: 'Chinese Yuan',
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
  [LoanType.MORTGAGE]: 'Vay mua nhà',
  [LoanType.AUTO]: 'Vay mua xe',
  [LoanType.STUDENT]: 'Vay học tập',
  [LoanType.BUSINESS]: 'Vay kinh doanh',
  [LoanType.OTHER]: 'Khác',
};

export const LoanStatusLabels: Record<LoanStatus, string> = {
  [LoanStatus.ACTIVE]: 'Đang hoạt động',
  [LoanStatus.PAID_OFF]: 'Đã trả hết',
  [LoanStatus.DEFAULTED]: 'Vỡ nợ',
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

export const EventStatusLabels: Record<EventStatus, string> = {
  [EventStatus.PLANNED]: 'Đã lên kế hoạch',
  [EventStatus.ACTIVE]: 'Đang diễn ra',
  [EventStatus.COMPLETED]: 'Đã hoàn thành',
  [EventStatus.CANCELLED]: 'Đã hủy',
};
