import {
    AccountType,
    BookRole,
    BudgetPeriod,
    CategoryType,
    Currency,
    DebtStatus,
    DebtType,
    EventStatus,
    FrequencyType,
    GoalStatus,
    LoanStatus,
    LoanType,
    NotificationType,
    PaymentStatus,
    ReminderType,
    TransactionType,
    UserStatus,
} from './enums';

/**
 * Label mappings for display purposes
 * Used by frontend for internationalization and display
 */

export const AccountTypeLabels: Record<AccountType, string> = {
  [AccountType.CASH]: 'Tiền mặt',
  [AccountType.BANK]: 'Tài khoản ngân hàng',
  [AccountType.CREDIT_CARD]: 'Thẻ tín dụng',
  [AccountType.E_WALLET]: 'Ví điện tử',
  [AccountType.INVESTMENT]: 'Tài khoản đầu tư',
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
  [DebtStatus.PAID]: 'Đã thanh toán',
  [DebtStatus.PARTIAL]: 'Thanh toán một phần',
  [DebtStatus.OVERDUE]: 'Quá hạn',
};

export const LoanTypeLabels: Record<LoanType, string> = {
  [LoanType.PERSONAL]: 'Vay cá nhân',
  [LoanType.MORTGAGE]: 'Vay mua nhà',
  [LoanType.AUTO]: 'Vay mua xe',
  [LoanType.BUSINESS]: 'Vay kinh doanh',
  [LoanType.OTHER]: 'Khác',
};

export const LoanStatusLabels: Record<LoanStatus, string> = {
  [LoanStatus.ACTIVE]: 'Đang hoạt động',
  [LoanStatus.PAID_OFF]: 'Đã thanh toán hết',
  [LoanStatus.DEFAULTED]: 'Vỡ nợ',
  [LoanStatus.REFINANCED]: 'Tái cấu trúc',
};

export const PaymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Chờ thanh toán',
  [PaymentStatus.PAID]: 'Đã thanh toán',
  [PaymentStatus.FAILED]: 'Thanh toán thất bại',
  [PaymentStatus.SKIPPED]: 'Bỏ qua',
};

export const ReminderTypeLabels: Record<ReminderType, string> = {
  [ReminderType.PAYMENT]: 'Nhắc nhở thanh toán',
  [ReminderType.BUDGET]: 'Nhắc nhở ngân sách',
  [ReminderType.GOAL]: 'Nhắc nhở mục tiêu',
  [ReminderType.CUSTOM]: 'Nhắc nhở tùy chỉnh',
};

export const BookRoleLabels: Record<BookRole, string> = {
  [BookRole.VIEWER]: 'Người xem',
  [BookRole.EDITOR]: 'Người chỉnh sửa',
  [BookRole.ADMIN]: 'Quản trị viên',
};

export const NotificationTypeLabels: Record<NotificationType, string> = {
  [NotificationType.BUDGET_ALERT]: 'Cảnh báo ngân sách',
  [NotificationType.PAYMENT_DUE]: 'Đến hạn thanh toán',
  [NotificationType.GOAL_PROGRESS]: 'Tiến độ mục tiêu',
  [NotificationType.DEBT_REMINDER]: 'Nhắc nhở công nợ',
  [NotificationType.SYSTEM]: 'Thông báo hệ thống',
};

export const UserStatusLabels: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'Đang hoạt động',
  [UserStatus.INACTIVE]: 'Không hoạt động',
  [UserStatus.SUSPENDED]: 'Tạm khóa',
  [UserStatus.DELETED]: 'Đã xóa',
};

export const CurrencyLabels: Record<Currency, string> = {
  [Currency.VND]: 'Việt Nam Đồng (₫)',
  [Currency.USD]: 'US Dollar ($)',
  [Currency.EUR]: 'Euro (€)',
  [Currency.JPY]: 'Japanese Yen (¥)',
  [Currency.CNY]: 'Chinese Yuan (¥)',
};

export const FrequencyTypeLabels: Record<FrequencyType, string> = {
  [FrequencyType.ONCE]: 'Một lần',
  [FrequencyType.DAILY]: 'Hàng ngày',
  [FrequencyType.WEEKLY]: 'Hàng tuần',
  [FrequencyType.MONTHLY]: 'Hàng tháng',
  [FrequencyType.QUARTERLY]: 'Hàng quý',
  [FrequencyType.YEARLY]: 'Hàng năm',
};

export const EventStatusLabels: Record<EventStatus, string> = {
  [EventStatus.PLANNED]: 'Đã lên kế hoạch',
  [EventStatus.ACTIVE]: 'Đang diễn ra',
  [EventStatus.COMPLETED]: 'Đã hoàn thành',
  [EventStatus.CANCELLED]: 'Đã hủy',
};