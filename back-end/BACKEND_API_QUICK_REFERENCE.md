# Backend API - Quick Reference for Frontend Team

## 🔗 Base URL & Docs
- **API Base:** `http://localhost:3001/api/v1`
- **Swagger Docs:** `http://localhost:3001/docs`

---

## 🆕 New Modules - API Summary

### 1. Loans Module

#### Enums to Add in Frontend:
```typescript
// front-end/src/constants/enums.ts
export enum LoanType {
  PERSONAL = 1,    // Vay cá nhân
  MORTGAGE = 2,    // Vay mua nhà
  AUTO = 3,        // Vay mua xe
  BUSINESS = 4,    // Vay kinh doanh
  OTHER = 5,       // Khác
}

export enum LoanStatus {
  ACTIVE = 1,      // Đang hoạt động
  PAID_OFF = 2,    // Đã thanh toán hết
  DEFAULTED = 3,   // Vỡ nợ
  REFINANCED = 4,  // Tái cấu trúc
}

export enum PaymentStatus {
  PENDING = 1,     // Chờ thanh toán
  PAID = 2,        // Đã thanh toán
  FAILED = 3,      // Thanh toán thất bại
  SKIPPED = 4,     // Bỏ qua
}
```

#### Enum Labels:
```typescript
// front-end/src/constants/enum-labels.ts
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
  [PaymentStatus.FAILED]: 'Thất bại',
  [PaymentStatus.SKIPPED]: 'Bỏ qua',
};
```

#### Type Definitions:
```typescript
// front-end/src/types/models/loan.ts
export interface ILoan {
  id: string;
  userId: string;
  type: number; // LoanType enum
  name: string;
  lender: string;
  originalAmount: number;
  remainingPrincipal: number;
  interestRate: number; // Annual rate (e.g., 8.5 for 8.5%)
  termMonths: number;
  remainingMonths: number;
  monthlyPayment: number;
  startDate: string; // ISO date
  nextPaymentDate: string;
  lastPaymentDate?: string;
  status: number; // LoanStatus enum
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  totalPrepayment: number;
  description?: string;
  notes?: string;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  
  // Virtual properties (calculated by backend)
  totalPaid: number;
  remainingAmount: number;
  progressPercentage: number;
  isOverdue: boolean;
}

export interface ILoanPayment {
  id: string;
  loanId: string;
  paymentNumber: number;
  paymentDate: string;
  dueDate: string;
  amount: number;
  principalAmount: number;
  interestAmount: number;
  prepaymentAmount: number;
  remainingPrincipal: number;
  status: number; // PaymentStatus enum
  isPrepayment: boolean;
  isScheduled: boolean;
  note?: string;
  transactionId?: string;
  
  // Virtual properties
  isPaid: boolean;
  isLate: boolean;
}

export interface IAmortizationEntry {
  month: number;
  paymentDate: Date;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface IPrepaymentSimulation {
  originalTerm: number;
  originalMonthlyPayment: number;
  originalTotalInterest: number;
  newTerm?: number;
  newMonthlyPayment?: number;
  newTotalInterest: number;
  interestSaved: number;
  timeSaved?: number;
}
```

#### API Endpoints:
```typescript
// front-end/src/services/api/loans.ts
import api from '../api';

export const loansApi = {
  // Create loan
  create: (data: ICreateLoanDto) => 
    api.post('/loans', data),
  
  // Get all loans with pagination
  getAll: (params?: { page?: number; limit?: number; type?: number; status?: number }) =>
    api.get('/loans', { params }),
  
  // Get loan by ID
  getById: (id: string) => 
    api.get(`/loans/${id}`),
  
  // Update loan
  update: (id: string, data: Partial<ICreateLoanDto>) =>
    api.patch(`/loans/${id}`, data),
  
  // Delete loan
  delete: (id: string) =>
    api.delete(`/loans/${id}`),
  
  // Get amortization schedule
  getAmortizationSchedule: (id: string) =>
    api.get(`/loans/${id}/amortization-schedule`),
  
  // Simulate prepayment
  simulatePrepayment: (id: string, data: { prepaymentAmount: number; strategy: 'reduce_term' | 'reduce_payment' }) =>
    api.post(`/loans/${id}/simulate-prepayment`, data),
  
  // Record payment
  recordPayment: (id: string, data: ICreateLoanPaymentDto) =>
    api.post(`/loans/${id}/payments`, data),
  
  // Get payment history
  getPayments: (id: string) =>
    api.get(`/loans/${id}/payments`),
};
```

---

### 2. Recurring Transactions Module

#### Type Definitions:
```typescript
// front-end/src/types/models/recurringTransaction.ts
export interface IRecurringTransaction {
  id: string;
  userId: string;
  categoryId?: string;
  name: string;
  description?: string;
  amount: number;
  type: number; // 1=Income, 2=Expense
  frequency: number; // FrequencyType enum (2-6)
  startDate: string;
  endDate?: string;
  nextExecutionDate: string;
  lastExecutionDate?: string;
  isActive: boolean;
  executionCount: number;
  createdAt: string;
  updatedAt: string;
  
  category?: ICategory; // Populated
}
```

#### API Endpoints:
```typescript
// front-end/src/services/api/recurringTransactions.ts
export const recurringTransactionsApi = {
  create: (data: ICreateRecurringTransactionDto) =>
    api.post('/recurring-transactions', data),
  
  getAll: (params?: { page?: number; limit?: number; type?: number; isActive?: boolean }) =>
    api.get('/recurring-transactions', { params }),
  
  getDue: () =>
    api.get('/recurring-transactions/due'),
  
  getById: (id: string) =>
    api.get(`/recurring-transactions/${id}`),
  
  update: (id: string, data: Partial<ICreateRecurringTransactionDto>) =>
    api.patch(`/recurring-transactions/${id}`, data),
  
  toggleActive: (id: string) =>
    api.patch(`/recurring-transactions/${id}/toggle-active`),
  
  execute: (id: string) =>
    api.post(`/recurring-transactions/${id}/execute`),
  
  delete: (id: string) =>
    api.delete(`/recurring-transactions/${id}`),
};
```

---

### 3. Shared Books Module

#### Enum to Add:
```typescript
// front-end/src/constants/enums.ts
export enum BookRole {
  VIEWER = 1,   // Chỉ xem
  EDITOR = 2,   // Chỉnh sửa
  ADMIN = 3,    // Quản trị
}

// front-end/src/constants/enum-labels.ts
export const BookRoleLabels: Record<BookRole, string> = {
  [BookRole.VIEWER]: 'Người xem',
  [BookRole.EDITOR]: 'Biên tập viên',
  [BookRole.ADMIN]: 'Quản trị viên',
};
```

#### Type Definitions:
```typescript
// front-end/src/types/models/sharedBook.ts
export interface ISharedBook {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  color?: string; // Hex color (e.g., '#FF5733')
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  owner?: IUser;
  members?: ISharedBookMember[];
}

export interface ISharedBookMember {
  id: string;
  sharedBookId: string;
  userId: string;
  role: number; // BookRole enum
  isActive: boolean;
  acceptedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  user?: IUser;
  sharedBook?: ISharedBook;
}
```

#### API Endpoints:
```typescript
// front-end/src/services/api/sharedBooks.ts
export const sharedBooksApi = {
  create: (data: ICreateSharedBookDto) =>
    api.post('/shared-books', data),
  
  getAll: (params?: { page?: number; limit?: number; isActive?: boolean }) =>
    api.get('/shared-books', { params }),
  
  getById: (id: string) =>
    api.get(`/shared-books/${id}`),
  
  update: (id: string, data: Partial<ICreateSharedBookDto>) =>
    api.patch(`/shared-books/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/shared-books/${id}`),
  
  // Members management
  addMember: (bookId: string, data: { email: string; role: number }) =>
    api.post(`/shared-books/${bookId}/members`, data),
  
  getMembers: (bookId: string) =>
    api.get(`/shared-books/${bookId}/members`),
  
  updateMemberRole: (bookId: string, memberId: string, data: { role: number }) =>
    api.patch(`/shared-books/${bookId}/members/${memberId}`, data),
  
  removeMember: (bookId: string, memberId: string) =>
    api.delete(`/shared-books/${bookId}/members/${memberId}`),
  
  leaveBook: (bookId: string) =>
    api.post(`/shared-books/${bookId}/leave`),
};
```

---

## 📦 Sample DTOs

### Create Loan:
```typescript
interface ICreateLoanDto {
  type: number; // 1-5
  name: string;
  lender: string;
  originalAmount: number;
  interestRate: number; // 0-100
  termMonths: number; // 1-600
  startDate: string; // YYYY-MM-DD
  description?: string;
  notes?: string;
  reminderEnabled?: boolean;
  reminderDaysBefore?: number; // 0-30
}
```

### Create Recurring Transaction:
```typescript
interface ICreateRecurringTransactionDto {
  name: string;
  description?: string;
  amount: number;
  type: number; // 1=Income, 2=Expense
  frequency: number; // 2-6 (Daily, Weekly, Monthly, Quarterly, Yearly)
  categoryId?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  isActive?: boolean;
}
```

### Create Shared Book:
```typescript
interface ICreateSharedBookDto {
  name: string;
  description?: string;
  color?: string; // Hex format: #RRGGBB
  icon?: string;
  isActive?: boolean;
}
```

---

## 🔒 Authentication

All endpoints require JWT token in header:
```typescript
headers: {
  'Authorization': `Bearer ${accessToken}`
}
```

---

## ✅ Response Format

All endpoints return consistent format:
```typescript
{
  success: boolean;
  data: T; // Can be object, array, or null
  message: string;
}
```

---

## 🎨 UI Component Suggestions

### Loans Module:
1. **LoansListPage** - Table/cards showing all loans with progress bars
2. **LoanDetailPage** - Full loan info + amortization chart
3. **CreateLoanForm** - Multi-step form for loan creation
4. **PrepaymentSimulator** - Calculator showing impact of prepayment
5. **RecordPaymentModal** - Form to record payment
6. **AmortizationScheduleTable** - Table showing month-by-month breakdown

### Recurring Transactions:
1. **RecurringListPage** - List with frequency badges, next execution date
2. **CreateRecurringForm** - Form with frequency selector (radio buttons)
3. **RecurringCard** - Card showing name, amount, frequency, next date
4. **ExecuteButton** - Manual execution trigger

### Shared Books:
1. **SharedBooksListPage** - Grid/list of books (owned + shared)
2. **SharedBookDetailPage** - Book info + members list with roles
3. **CreateSharedBookForm** - Simple form with color picker
4. **AddMemberModal** - Email input + role selector
5. **MembersList** - List with role badges, edit/remove buttons
6. **RoleBadge** - Colored badge showing Viewer/Editor/Admin

---

## 🎯 Priority Implementation Order

### Phase 1: Basic CRUD
1. Loans: Create, list, view details
2. Recurring: Create, list, toggle active
3. SharedBooks: Create, list, view members

### Phase 2: Advanced Features
1. Loans: Amortization schedule display, payment recording
2. Recurring: Execute manually, due transactions dashboard
3. SharedBooks: Add/remove members, role management

### Phase 3: Polish
1. Loans: Prepayment simulator with chart
2. Recurring: Auto-execution notification
3. SharedBooks: Permission-based UI (hide edit for Viewers)

---

**Happy coding! 🚀**
