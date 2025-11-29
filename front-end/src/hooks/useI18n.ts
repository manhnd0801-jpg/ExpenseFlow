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
  GoalType,
  LoanStatus,
  LoanType,
  NotificationType,
  PaymentStatus,
  ReminderType,
  TransactionType,
} from '@/constants/enums';
import { SupportedLanguage } from '@/i18n';
import { useTranslation } from 'react-i18next';

/**
 * Enhanced translation hook with enum label support
 */
export const useI18n = () => {
  const { t, i18n } = useTranslation();

  // Get current language
  const currentLanguage = i18n.language as SupportedLanguage;

  // Change language function
  const changeLanguage = (language: SupportedLanguage) => {
    i18n.changeLanguage(language);
  };

  // Helper function to get enum labels
  const getEnumLabel = (enumType: string, enumValue: number): string => {
    return t(`enumLabels.${enumType}.${getEnumKey(enumType, enumValue)}`);
  };

  // Helper to convert enum value to key
  const getEnumKey = (enumType: string, enumValue: number): string => {
    switch (enumType) {
      case 'accountType':
        switch (enumValue) {
          case AccountType.CASH:
            return 'cash';
          case AccountType.BANK:
            return 'bank';
          case AccountType.CREDIT_CARD:
            return 'creditCard';
          case AccountType.DIGITAL_WALLET:
            return 'digitalWallet';
          case AccountType.INVESTMENT:
            return 'investment';
          default:
            return 'cash';
        }
      case 'transactionType':
        switch (enumValue) {
          case TransactionType.INCOME:
            return 'income';
          case TransactionType.EXPENSE:
            return 'expense';
          case TransactionType.TRANSFER:
            return 'transfer';
          default:
            return 'expense';
        }
      case 'categoryType':
        switch (enumValue) {
          case CategoryType.INCOME:
            return 'income';
          case CategoryType.EXPENSE:
            return 'expense';
          default:
            return 'expense';
        }
      case 'budgetPeriod':
        switch (enumValue) {
          case BudgetPeriod.DAILY:
            return 'daily';
          case BudgetPeriod.WEEKLY:
            return 'weekly';
          case BudgetPeriod.MONTHLY:
            return 'monthly';
          case BudgetPeriod.QUARTERLY:
            return 'quarterly';
          case BudgetPeriod.YEARLY:
            return 'yearly';
          case BudgetPeriod.CUSTOM:
            return 'custom';
          default:
            return 'monthly';
        }
      case 'currency':
        switch (enumValue) {
          case Currency.VND:
            return 'vnd';
          case Currency.USD:
            return 'usd';
          case Currency.EUR:
            return 'eur';
          case Currency.JPY:
            return 'jpy';
          case Currency.CNY:
            return 'cny';
          default:
            return 'vnd';
        }
      case 'goalStatus':
        switch (enumValue) {
          case GoalStatus.ACTIVE:
            return 'active';
          case GoalStatus.COMPLETED:
            return 'completed';
          case GoalStatus.CANCELLED:
            return 'cancelled';
          default:
            return 'active';
        }
      case 'goalType':
        switch (enumValue) {
          case GoalType.SAVING:
            return 'saving';
          case GoalType.PURCHASE:
            return 'purchase';
          case GoalType.INVESTMENT:
            return 'investment';
          case GoalType.DEBT_PAYOFF:
            return 'debtPayoff';
          case GoalType.EMERGENCY:
            return 'emergency';
          case GoalType.OTHER:
            return 'other';
          default:
            return 'saving';
        }
      case 'debtType':
        switch (enumValue) {
          case DebtType.LENDING:
            return 'lending';
          case DebtType.BORROWING:
            return 'borrowing';
          default:
            return 'borrowing';
        }
      case 'debtStatus':
        switch (enumValue) {
          case DebtStatus.ACTIVE:
            return 'active';
          case DebtStatus.PARTIAL_PAID:
            return 'partialPaid';
          case DebtStatus.COMPLETED:
            return 'completed';
          case DebtStatus.OVERDUE:
            return 'overdue';
          default:
            return 'active';
        }
      case 'loanType':
        switch (enumValue) {
          case LoanType.PERSONAL:
            return 'personal';
          case LoanType.MORTGAGE:
            return 'mortgage';
          case LoanType.AUTO:
            return 'auto';
          case LoanType.STUDENT:
            return 'student';
          case LoanType.BUSINESS:
            return 'business';
          case LoanType.OTHER:
            return 'other';
          default:
            return 'personal';
        }
      case 'loanStatus':
        switch (enumValue) {
          case LoanStatus.ACTIVE:
            return 'active';
          case LoanStatus.PAID_OFF:
            return 'paidOff';
          case LoanStatus.DEFAULTED:
            return 'defaulted';
          default:
            return 'active';
        }
      case 'paymentStatus':
        switch (enumValue) {
          case PaymentStatus.PENDING:
            return 'pending';
          case PaymentStatus.COMPLETED:
            return 'completed';
          case PaymentStatus.FAILED:
            return 'failed';
          case PaymentStatus.SKIPPED:
            return 'skipped';
          default:
            return 'pending';
        }
      case 'reminderType':
        switch (enumValue) {
          case ReminderType.PAYMENT:
            return 'payment';
          case ReminderType.BUDGET:
            return 'budget';
          case ReminderType.DEBT:
            return 'debt';
          case ReminderType.CUSTOM:
            return 'custom';
          default:
            return 'custom';
        }
      case 'bookRole':
        switch (enumValue) {
          case BookRole.VIEWER:
            return 'viewer';
          case BookRole.EDITOR:
            return 'editor';
          case BookRole.ADMIN:
            return 'admin';
          default:
            return 'viewer';
        }
      case 'notificationType':
        switch (enumValue) {
          case NotificationType.BUDGET_ALERT:
            return 'budgetAlert';
          case NotificationType.PAYMENT_DUE:
            return 'paymentDue';
          case NotificationType.DEBT_REMINDER:
            return 'debtReminder';
          case NotificationType.GOAL_MILESTONE:
            return 'goalMilestone';
          case NotificationType.SYSTEM:
            return 'system';
          default:
            return 'system';
        }
      case 'eventStatus':
        switch (enumValue) {
          case EventStatus.PLANNED:
            return 'planned';
          case EventStatus.ACTIVE:
            return 'active';
          case EventStatus.COMPLETED:
            return 'completed';
          case EventStatus.CANCELLED:
            return 'cancelled';
          default:
            return 'planned';
        }
      default:
        return '';
    }
  };

  // Specific enum label functions for better type safety
  const getAccountTypeLabel = (type: AccountType) => getEnumLabel('accountType', type);
  const getTransactionTypeLabel = (type: TransactionType) => getEnumLabel('transactionType', type);
  const getCategoryTypeLabel = (type: CategoryType) => getEnumLabel('categoryType', type);
  const getBudgetPeriodLabel = (period: BudgetPeriod) => getEnumLabel('budgetPeriod', period);
  const getCurrencyLabel = (currency: Currency) => getEnumLabel('currency', currency);
  const getGoalStatusLabel = (status: GoalStatus) => getEnumLabel('goalStatus', status);
  const getGoalTypeLabel = (type: GoalType) => getEnumLabel('goalType', type);
  const getDebtTypeLabel = (type: DebtType) => getEnumLabel('debtType', type);
  const getDebtStatusLabel = (status: DebtStatus) => getEnumLabel('debtStatus', status);
  const getLoanTypeLabel = (type: LoanType) => getEnumLabel('loanType', type);
  const getLoanStatusLabel = (status: LoanStatus) => getEnumLabel('loanStatus', status);
  const getPaymentStatusLabel = (status: PaymentStatus) => getEnumLabel('paymentStatus', status);
  const getReminderTypeLabel = (type: ReminderType) => getEnumLabel('reminderType', type);
  const getBookRoleLabel = (role: BookRole) => getEnumLabel('bookRole', role);
  const getNotificationTypeLabel = (type: NotificationType) =>
    getEnumLabel('notificationType', type);
  const getEventStatusLabel = (status: EventStatus) => getEnumLabel('eventStatus', status);

  return {
    t,
    currentLanguage,
    changeLanguage,
    getEnumLabel,
    getAccountTypeLabel,
    getTransactionTypeLabel,
    getCategoryTypeLabel,
    getBudgetPeriodLabel,
    getCurrencyLabel,
    getGoalStatusLabel,
    getGoalTypeLabel,
    getDebtTypeLabel,
    getDebtStatusLabel,
    getLoanTypeLabel,
    getLoanStatusLabel,
    getPaymentStatusLabel,
    getReminderTypeLabel,
    getBookRoleLabel,
    getNotificationTypeLabel,
    getEventStatusLabel,
  };
};

export default useI18n;
