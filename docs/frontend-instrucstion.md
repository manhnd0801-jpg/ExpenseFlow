# Frontend Development Instructions - Expense Management App

## 📋 Tổng Quan

Tài liệu này quy định các yêu cầu, tiêu chuẩn và quy tắc bắt buộc cho việc phát triển Frontend của ứng dụng Quản Lý Chi Tiêu Cá Nhân.

**Tech Stack Requirements:**

- React 18+ with TypeScript (REQUIRED)
- Vite as build tool (REQUIRED)
- Ant Design 5.x for UI components (REQUIRED)
- Styled Components for custom styling (REQUIRED)
- Redux Toolkit + Redux-Saga for state management (REQUIRED)
- Axios for HTTP client (REQUIRED)

---

## 🏗️ 1. Project Structure Requirements

### 1.1. Folder Structure Standards

**MUST follow Atomic Design pattern:**

```
src/
├── assets/              # Static files (images, fonts, icons)
├── components/          # Atomic Design Components
│   ├── atoms/          # Basic UI elements (Button, Input, etc.)
│   ├── molecules/      # Composite components (SearchBar, FormField, etc.)
│   ├── organisms/      # Complex components (Header, Sidebar, etc.)
│   └── templates/      # Page layouts
├── pages/              # Route pages
├── redux/              # State management (store, slices, sagas)
├── services/           # API service layer
├── hooks/              # Custom React hooks
├── utils/              # Utility functions (formatters, validators, helpers)
├── types/              # TypeScript type definitions
├── styles/             # Global styles and theme
└── routes/             # Routing configuration
```

### 1.2. File Naming Conventions

- **Components:** PascalCase (e.g., `Button.tsx`, `TransactionList.tsx`)
- **Utilities:** camelCase (e.g., `formatters.ts`, `validators.ts`)
- **Types:** PascalCase (e.g., `User.ts`, `Transaction.ts`)
- **Hooks:** camelCase with `use` prefix (e.g., `useAuth.ts`, `useDebounce.ts`)
- **Services:** camelCase with Service suffix (e.g., `authService.ts`)

### 1.3. Component File Structure

**Each component folder MUST contain:**

```
ComponentName/
├── ComponentName.tsx        # Main component
├── ComponentName.styles.ts  # Styled components (if needed)
├── ComponentName.types.ts   # TypeScript interfaces (if complex)
└── index.ts                 # Export file
```

---

## 🔧 2. Configuration Requirements

### 2.1. TypeScript Configuration

**MUST enable strict mode:**

- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noImplicitAny: true`

**MUST configure path aliases:**

- `@/*` → `./src/*`
- `@components/*` → `./src/components/*`
- `@services/*` → `./src/services/*`
- `@utils/*` → `./src/utils/*`
- `@types/*` → `./src/types/*`
- `@hooks/*` → `./src/hooks/*`
- `@redux/*` → `./src/redux/*`
- `@pages/*` → `./src/pages/*`
- `@styles/*` → `./src/styles/*`
- `@assets/*` → `./src/assets/*`

### 2.2. Vite Configuration

**MUST configure:**

- Development server port: `3000`
- API proxy: `/api` → Backend URL
- Path aliases matching tsconfig.json

### 2.3. Environment Variables

**MUST use:**

- `VITE_API_BASE_URL` - Backend API base URL
- `VITE_API_TIMEOUT` - Request timeout (default: 30000ms)
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version

---

## 🎨 3. UI/UX Standards

### 3.1. Theme Configuration

**MUST implement:**

- Ant Design theme customization in `src/styles/theme.ts`
- Support for light/dark mode
- Consistent color palette:
  - Primary: `#1890ff`
  - Success: `#52c41a`
  - Warning: `#faad14`
  - Error: `#f5222d`
- Border radius: `8px` for buttons/inputs, `12px` for cards
- Font family: System fonts stack

### 3.2. Responsive Design

**MUST support:**

- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

**MUST use Ant Design breakpoints:**

- xs: < 576px
- sm: ≥ 576px
- md: ≥ 768px
- lg: ≥ 992px
- xl: ≥ 1200px
- xxl: ≥ 1600px

### 3.3. Accessibility Requirements

**MUST implement:**

- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Color contrast ratio ≥ 4.5:1 (WCAG AA)
- Screen reader compatibility
- Focus indicators on interactive elements

---

## 🔌 4. API Integration Standards

### 4.1. Axios Configuration

**MUST implement:**

- Single axios instance in `src/services/api.ts`
- Request interceptor:
  - Auto-attach Bearer token from localStorage
  - Log requests in development mode
- Response interceptor:
  - Auto extract `data` field from response
  - Global error handling (401, 400, 403, 404, 500, etc.)
  - Auto token refresh on 401 Unauthorized
  - User-friendly error messages via Ant Design message

### 4.2. API Endpoint Constants

**MUST centralize all API endpoints in `src/utils/constants.ts`:**

```typescript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    // ... other auth endpoints
  },
  TRANSACTIONS: {
    BASE: '/transactions',
    DETAIL: (id: string) => `/transactions/${id}`,
    // ... other transaction endpoints
  },
  // ... other modules
};
```

**DO NOT hardcode API paths in service files.**

### 4.3. API Helper Methods

**MUST provide reusable helper methods:**

- `api.get<T>(url, params?, config?)`
- `api.post<T>(url, data?, config?)`
- `api.put<T>(url, data?, config?)`
- `api.patch<T>(url, data?, config?)`
- `api.delete<T>(url, config?)`
- `api.upload<T>(url, formData, onProgress?)`
- `api.download(url, filename)`

**Config options MUST support:**

- `showSuccessMessage: boolean`
- `successMessage: string`

### 4.4. Service Layer Structure

**Each service file MUST:**

- Import API helper from `./api`
- Import endpoints from `@utils/constants`
- Export service object with typed methods
- Use TypeScript generics for return types
- Include JSDoc comments for complex methods

**Example pattern:**

```typescript
import api from './api';
import { API_ENDPOINTS } from '@utils/constants';
import type { ITransaction, TPaginatedResponse, ICreateTransactionRequest } from '@types/models';

export const transactionService = {
  getTransactions: (params): Promise<TPaginatedResponse<ITransaction>> =>
    api.get(API_ENDPOINTS.TRANSACTIONS.BASE, params),

  createTransaction: (data: ICreateTransactionRequest): Promise<ITransaction> =>
    api.post(API_ENDPOINTS.TRANSACTIONS.BASE, data, {
      showSuccessMessage: true,
      successMessage: 'Thêm giao dịch thành công!',
    }),
};
```

---

## 🗄️ 5. State Management Standards

### 5.1. Redux Store Configuration

**MUST use Redux Toolkit with Redux-Saga:**

- Configure store in `src/redux/store.ts`
- Disable Redux Thunk (use Saga instead)
- Enable Redux DevTools in development only
- Disable serializable check for dates/functions

### 5.2. Redux Module Structure

**Each feature module MUST include:**

```
redux/modules/[feature]/
├── [feature]Slice.ts      # Redux Toolkit slice (state + reducers)
├── [feature]Saga.ts       # Redux-Saga side effects
├── [feature]Types.ts      # TypeScript interfaces
└── [feature]Selectors.ts  # Reusable selectors (if needed)
```

### 5.3. Slice Standards

**MUST follow:**

- Use `createSlice` from Redux Toolkit
- Define typed initial state
- Use PayloadAction<T> for action types
- Include loading/error states for async operations
- Sync with localStorage where appropriate (e.g., tokens, user)

### 5.4. Saga Standards

**MUST follow:**

- Use generator functions with typed actions
- Handle errors with try/catch blocks
- Use `call()` for async functions
- Use `put()` for dispatching actions
- Use `takeLatest()` for user-triggered actions
- Show user feedback via Ant Design message

---

## 📦 6. TypeScript Type Standards

### 6.1. Type Organization

**MUST organize types:**

```
types/
├── models/           # Domain models (User, Transaction, etc.)
├── api/             # API request/response types
└── common/          # Shared types (enums, utilities)
```

### 6.2. Type Definitions

**MUST define:**

- Interface for all data models
- Request/Response types for API calls
- Props interfaces for all components
- Enum types for constants (use `as const` or `enum`)

**DO NOT use `any` type** (use `unknown` if type is truly unknown)

### 6.3. Naming Conventions

**MUST follow naming conventions:**

- **Interfaces:** Prefix with `I` + PascalCase

  - ✅ `IUser`, `ITransaction`, `IBudget`
  - ✅ `ILoginRequest`, `ILoginResponse`
  - ✅ `IButtonProps`, `ITransactionListProps`
  - ❌ `User`, `Transaction` (missing prefix)

- **Type aliases:** Prefix with `T` + PascalCase

  - ✅ `TTransactionType`, `TAccountStatus`
  - ✅ `TPaginatedResponse<T>`, `TApiResponse<T>`
  - ✅ `TFormValues`, `TFilterParams`
  - ❌ `TransactionType`, `Status` (missing prefix)

- **Enums:** PascalCase (no prefix required)

  - ✅ `TransactionType`, `LoanStatus`, `AccountType`
  - ✅ `BudgetPeriod`, `PaymentStatus`

- **Generic types:** Single uppercase letter or PascalCase
  - ✅ `<T>`, `<K, V>`, `<TData>`, `<TResponse>`

**Examples:**

```typescript
// ✅ CORRECT
interface IUser {
  id: string;
  email: string;
}

type TTransactionType = 'income' | 'expense' | 'transfer';

enum AccountType {
  CASH = 'cash',
  BANK = 'bank',
}

interface IApiResponse<T> {
  data: T;
  message: string;
}

// ❌ INCORRECT
interface User {} // Missing I prefix
type Status = 'active' | 'inactive'; // Missing T prefix
```

---

## 🛠️ 7. Utility Functions Standards

### 7.1. Constants File

**MUST include in `src/utils/constants.ts` or `src/constants/`:**

#### 7.1.1. Enum Constants (CRITICAL - Integer Based)

**File: `src/constants/enums.ts`**

```typescript
// ⭐ MUST match exactly with backend enum definitions (INTEGER values)
// These enums use integers (1, 2, 3...) matching database SMALLINT columns

// Account Types - Database stores as SMALLINT
export enum AccountType {
  CASH = 1,
  BANK = 2,
  CREDIT_CARD = 3,
  E_WALLET = 4,
  INVESTMENT = 5,
}

// Transaction Types
export enum TransactionType {
  INCOME = 1,
  EXPENSE = 2,
  TRANSFER = 3,
}

// Category Types
export enum CategoryType {
  INCOME = 1,
  EXPENSE = 2,
}

// Budget Periods
export enum BudgetPeriod {
  DAILY = 1,
  WEEKLY = 2,
  MONTHLY = 3,
  QUARTERLY = 4,
  YEARLY = 5,
  CUSTOM = 6,
}

// Goal Status
export enum GoalStatus {
  ACTIVE = 1,
  COMPLETED = 2,
  CANCELLED = 3,
}

// Debt Types
export enum DebtType {
  LENDING = 1,
  BORROWING = 2,
}

// Debt Status
export enum DebtStatus {
  ACTIVE = 1,
  PARTIAL_PAID = 2,
  FULLY_PAID = 3,
  OVERDUE = 4,
}

// Loan Types
export enum LoanType {
  PERSONAL = 1,
  MORTGAGE = 2,
  AUTO = 3,
  BUSINESS = 4,
  OTHER = 5,
}

// Loan Status
export enum LoanStatus {
  ACTIVE = 1,
  PAID_OFF = 2,
  DEFAULTED = 3,
  REFINANCED = 4,
}

// Payment Status
export enum PaymentStatus {
  PENDING = 1,
  PAID = 2,
  OVERDUE = 3,
  SKIPPED = 4,
}

// Reminder Types
export enum ReminderType {
  PAYMENT = 1,
  DEBT = 2,
  BUDGET = 3,
  CUSTOM = 4,
}

// Book Roles
export enum BookRole {
  VIEWER = 1,
  EDITOR = 2,
  ADMIN = 3,
}

// Notification Types
export enum NotificationType {
  BUDGET_ALERT = 1,
  DEBT_REMINDER = 2,
  GOAL_ACHIEVED = 3,
  PAYMENT_DUE = 4,
  SYSTEM = 5,
}
```

**Label Mappings for Display:**

```typescript
// src/constants/enum-labels.ts
// Map numeric enum values to user-friendly labels

export const AccountTypeLabels: Record<AccountType, string> = {
  [AccountType.CASH]: 'Tiền mặt',
  [AccountType.BANK]: 'Ngân hàng',
  [AccountType.CREDIT_CARD]: 'Thẻ tín dụng',
  [AccountType.E_WALLET]: 'Ví điện tử',
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
  [GoalStatus.COMPLETED]: 'Hoàn thành',
  [GoalStatus.CANCELLED]: 'Đã hủy',
};

// ... other label mappings
```

**Helper Functions for Select Components:**

```typescript
// src/utils/enum-helpers.ts

export function getEnumOptions<T extends Record<string, number>>(
  enumObj: T,
  labels: Record<number, string>
): { value: number; label: string }[] {
  return Object.values(enumObj)
    .filter((value) => typeof value === 'number')
    .map((value) => ({
      value: value as number,
      label: labels[value as number],
    }));
}

// Usage:
const accountTypeOptions = getEnumOptions(AccountType, AccountTypeLabels);
// Returns: [{ value: 1, label: 'Tiền mặt' }, { value: 2, label: 'Ngân hàng' }, ...]
```

**ENUM Usage Requirements:**

- ⭐ **MUST use INTEGER enums (1, 2, 3...) matching backend and database**
- ⭐ **MUST synchronize with backend enums exactly (same numeric values)**
- ⭐ **DO NOT use string enums ('active', 'pending') - use numbers only**
- MUST use label mapping objects for display text
- MUST use helper functions to generate Select options
- Import enums from single source (`@constants/enums`)
- Import labels from single source (`@constants/enum-labels`)

**Example Usage:**

```typescript
// ❌ INCORRECT - String values
const account = { type: 'bank', status: 'active' };

// ❌ INCORRECT - Magic numbers
const account = { type: 2, status: 1 };

// ✅ CORRECT - Using numeric enums
import { AccountType, LoanStatus } from '@constants/enums';
import { AccountTypeLabels } from '@constants/enum-labels';

const account = { type: AccountType.BANK, status: LoanStatus.ACTIVE };
// account.type = 2, account.status = 1

// Display label
const typeLabel = AccountTypeLabels[account.type]; // 'Ngân hàng'

// In Select component
import { getEnumOptions } from '@utils/enum-helpers';

const accountTypeOptions = getEnumOptions(AccountType, AccountTypeLabels);
// Returns: [
//   { value: 1, label: 'Tiền mặt' },
//   { value: 2, label: 'Ngân hàng' },
//   { value: 3, label: 'Thẻ tín dụng' },
//   ...
// ]

<Select options={accountTypeOptions} value={account.type} />;

// In API calls - send numeric values
const createAccountDto = {
  name: 'My Account',
  type: AccountType.BANK, // Sends 2 to backend
  balance: 1000000,
};
```

#### 7.1.2. Other Constants

**File: `src/utils/constants.ts`**

- `APP_CONFIG` - Application configuration
- `STORAGE_KEYS` - localStorage key constants
- `ROUTES` - Route path constants
- `API_ENDPOINTS` - API endpoint constants
- `DATE_FORMATS` - Date format patterns
- `CURRENCY_FORMAT` - Currency format configurations

### 7.2. Formatter Functions

**MUST provide in `src/utils/formatters.ts`:**

- `formatCurrency(amount, currency)` - Format number as currency
- `formatDate(date, format)` - Format date with pattern
- `formatDateTime(date)` - Format date with time
- `formatNumber(num, decimals)` - Format number with separators
- `formatPercentage(value, decimals)` - Format as percentage
- `parseAmount(value)` - Parse formatted currency to number

### 7.3. Validator Functions

**MUST provide in `src/utils/validators.ts`:**

- Email validation
- Phone number validation
- Password strength validation
- Amount validation (positive, within range)
- Date validation (not future, within range)

---

## 🪝 8. Custom Hooks Standards

### 8.1. Required Hooks

**MUST implement:**

- `useAuth()` - Authentication state and methods
- `useDebounce(value, delay)` - Debounce input values
- `useLocalStorage(key, initialValue)` - localStorage sync
- `usePagination(initialPage, initialPageSize)` - Pagination logic
- `useNotification()` - Centralized notification methods

### 8.2. Hook Guidelines

**Custom hooks MUST:**

- Start with `use` prefix
- Return object or array (consistent pattern)
- Use TypeScript generics where appropriate
- Include JSDoc comments
- Handle cleanup in useEffect

---

## 🚦 9. Routing Standards

### 9.1. Route Configuration

**MUST centralize routes in `src/utils/constants.ts`:**

```typescript
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  TRANSACTIONS: '/transactions',
  // ... all routes
};
```

### 9.2. Protected Routes

**MUST implement:**

- `PrivateRoute` component - Requires authentication
- `PublicRoute` component - Redirects if authenticated
- Route guards checking user permissions

### 9.3. Route Structure

**MUST organize routes:**

- Public routes (Auth pages) under `AuthLayout`
- Private routes (App pages) under `DashboardLayout`
- 404 redirect to dashboard or login based on auth status

---

## 💅 10. Styling Standards

### 10.1. Styled Components Guidelines

**MUST:**

- Use Styled Components for custom styles
- Keep styles in separate `.styles.ts` files
- Use theme variables from Ant Design
- Avoid inline styles unless dynamic

**DO NOT:**

- Override Ant Design components with `!important`
- Use global CSS classes for component-specific styles

### 10.2. Global Styles

**MUST include in `src/styles/globalStyles.ts`:**

- CSS reset/normalize
- Global scrollbar styling
- Root element sizing
- Utility classes (if absolutely needed)

### 10.3. CSS Class Naming

**MUST use:**

- BEM methodology for utility classes
- Descriptive names (e.g., `.currency-input`, `.positive-amount`)
- kebab-case for class names

---

## ✅ 11. Code Quality Standards

### 11.1. Code Style

**MUST follow:**

- 2 spaces for indentation
- Single quotes for strings
- Semicolons at statement end
- Trailing commas in objects/arrays
- Max line length: 100 characters

### 11.2. Component Standards

**MUST:**

- Use functional components (no class components)
- Use React.FC<IProps> or explicit return types with typed props
- Destructure props in function parameters
- Use React.memo for performance-critical components
- Extract complex JSX into sub-components

**Component props naming:**

```typescript
// ✅ CORRECT - Props interface with I prefix
interface IButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const Button: React.FC<IButtonProps> = ({ label, onClick, disabled }) => {
  // ...
};

// ❌ INCORRECT - Missing I prefix
interface ButtonProps {}
```

### 11.3. Performance Best Practices

**MUST:**

- Use `useMemo` for expensive calculations
- Use `useCallback` for function props to child components
- Implement pagination for large lists (limit 20-50 items)
- Use lazy loading for routes (`React.lazy`)
- Optimize images (WebP format, appropriate sizes)

### 11.4. Error Handling

**MUST:**

- Wrap async operations in try/catch
- Display user-friendly error messages
- Log errors to console in development
- Provide fallback UI for error states
- Validate user inputs before submission

---

## 🧪 12. Testing Requirements (Future)

### 12.1. Unit Tests

**SHOULD test:**

- Utility functions (100% coverage)
- Custom hooks
- Redux reducers and sagas
- Complex business logic

### 12.2. Component Tests

**SHOULD test:**

- Component rendering
- User interactions
- Conditional rendering
- Error states

### 12.3. Integration Tests

**SHOULD test:**

- Complete user flows (login, create transaction, etc.)
- API integration
- State management integration

---

## 🔒 13. Security Standards

### 13.1. Authentication

**MUST:**

- Store only access/refresh tokens in localStorage
- Never store passwords or sensitive data
- Clear all localStorage on logout
- Implement auto-logout on token expiration
- Use secure token refresh mechanism

### 13.2. Data Handling

**MUST:**

- Validate all user inputs client-side
- Sanitize data before displaying (XSS prevention)
- Use HTTPS in production
- Implement CSRF protection (if needed)
- Never expose API keys in client code

### 13.3. Permissions

**MUST:**

- Check user permissions before rendering actions
- Disable actions user doesn't have access to
- Redirect unauthorized users appropriately

---

## 📱 14. Feature-Specific Requirements

### 14.1. Dashboard

**MUST display:**

- Total balance across accounts
- Income vs Expense summary (current period)
- Recent transactions (last 5-10)
- Budget progress indicators
- Upcoming loan payments
- Visual charts (income/expense trend, category distribution)

### 14.2. Transactions

**MUST support:**

- List with filters (date range, type, category, account)
- Pagination (20 items per page)
- Create/Edit/Delete operations
- Receipt image upload
- Bulk import (CSV/Excel)
- Export to Excel/PDF
- Search by note/amount

### 14.3. Budgets

**MUST support:**

- Create budgets with period (daily, weekly, monthly, etc.)
- Progress visualization (progress bar + percentage)
- Alert when approaching/exceeding limit
- Category-based budgets
- Budget comparison (actual vs planned)

### 14.4. Loans

**MUST support:**

- Amortization schedule display
- Payment recording
- Prepayment simulation (reduce term vs reduce payment)
- Interest calculation visualization
- Export payment schedule
- Upcoming payment reminders

### 14.5. Reports

**MUST provide:**

- Income vs Expense report (line/bar chart)
- Category distribution (pie/donut chart)
- Trend analysis (month-over-month comparison)
- Export to PDF/Excel
- Custom date range selection
- Account-specific reports

---

## 🚀 15. Development Workflow

### 15.1. Git Workflow

**MUST follow:**

- Branch naming: `feature/`, `bugfix/`, `hotfix/`
- Commit messages: Clear, descriptive (present tense)
- Pull requests: Required for main branch
- Code review: At least 1 approval

### 15.2. Development Steps

**Recommended order:**

1. Setup project & configuration (Week 1)
2. Core infrastructure (API, Redux, Types) (Week 2)
3. Authentication & Layouts (Week 3)
4. Atomic components (Week 4)
5. Core pages (Dashboard, Transactions, Accounts) (Week 5-6)
6. Advanced features (Budgets, Loans, Reports) (Week 7-10)
7. Testing & Polish (Week 11)
8. Documentation & Deployment (Week 12)

### 15.3. Documentation

**MUST document:**

- Complex algorithms/business logic
- Custom hooks usage
- Reusable component props
- API service methods
- State management flow

---

## 📚 16. Resources & References

### 16.1. Design References

**MUST follow:**

- `docs/DD/04-UI-UX-DESIGN.md` - UI/UX specifications
- `docs/DD/02-DATABASE-DESIGN.md` - Data model reference
- `docs/DD/03-API-SPECIFICATION.md` - API contract

### 16.2. External Documentation

**Recommended reading:**

- [React Best Practices](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Ant Design Guidelines](https://ant.design/docs/spec/introduce)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Redux-Saga Documentation](https://redux-saga.js.org/)

---

## ⚠️ 17. Common Pitfalls to Avoid

### 17.1. DO NOT

- ❌ Use `any` type in TypeScript
- ❌ Hardcode API URLs in components/services
- ❌ Store sensitive data in localStorage (except tokens)
- ❌ Use inline styles for static styling
- ❌ Override Ant Design with `!important`
- ❌ Ignore TypeScript errors
- ❌ Skip error handling in async operations
- ❌ Create deeply nested component trees (>3 levels)
- ❌ Use `var` (use `const` or `let`)
- ❌ Mutate Redux state directly

### 17.2. ALWAYS

- ✅ Use TypeScript strict mode
- ✅ Handle loading and error states
- ✅ Implement proper cleanup in useEffect
- ✅ Use semantic HTML elements
- ✅ Validate user inputs
- ✅ Use constants for magic numbers/strings
- ✅ Extract reusable logic into hooks/utilities
- ✅ Test user-facing features manually
- ✅ Keep components focused (single responsibility)
- ✅ Use meaningful variable/function names

---

## 📋 18. Checklist Before Deployment

### 18.1. Code Quality

- [ ] No TypeScript errors
- [ ] No console errors in production
- [ ] All API endpoints use constants
- [ ] Error handling implemented for all async operations
- [ ] Loading states implemented for async operations
- [ ] All forms have validation

### 18.2. Performance

- [ ] Images optimized
- [ ] Routes lazy-loaded
- [ ] Large lists paginated
- [ ] Unnecessary re-renders eliminated
- [ ] Bundle size analyzed

### 18.3. Security

- [ ] No sensitive data in code
- [ ] Environment variables used correctly
- [ ] HTTPS enforced in production
- [ ] Input validation implemented
- [ ] XSS prevention in place

### 18.4. UX/UI

- [ ] Responsive on mobile/tablet/desktop
- [ ] Loading indicators for async actions
- [ ] Error messages user-friendly
- [ ] Success feedback for user actions
- [ ] Keyboard navigation works
- [ ] Accessibility requirements met

### 18.5. Documentation

- [ ] README.md updated with setup instructions
- [ ] Complex functions documented
- [ ] API changes communicated to backend team
- [ ] Known issues documented

---

## 🎯 19. Success Criteria

**Project is considered complete when:**

1. ✅ All MVP features implemented and functional
2. ✅ No critical bugs or TypeScript errors
3. ✅ Responsive design working on all device sizes
4. ✅ Performance metrics acceptable (LCP < 2.5s, FID < 100ms)
5. ✅ Code follows all standards in this document
6. ✅ Successfully integrated with Backend API
7. ✅ User acceptance testing passed
8. ✅ Documentation complete and accurate

---

## 📞 20. Support & Communication

### 20.1. Backend Integration

**When issues arise:**

1. Check `docs/DD/03-API-SPECIFICATION.md` for API contract
2. Verify request/response format
3. Contact backend team with specific error details
4. Document API changes or discrepancies

### 20.2. Design Changes

**For UI/UX modifications:**

1. Refer to `docs/DD/04-UI-UX-DESIGN.md`
2. Discuss with team before implementing major changes
3. Maintain consistency with existing design system

### 20.3. Technical Decisions

**For architecture changes:**

1. Discuss with team lead
2. Document reasoning
3. Update this document if standards change

---

**Version:** 1.0  
**Last Updated:** November 19, 2025  
**Maintained By:** Frontend Development Team
