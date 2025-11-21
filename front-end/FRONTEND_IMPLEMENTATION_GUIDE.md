# Frontend Implementation Guide - ExpenseFlow

## 📊 Hiện Trạng

### ✅ Đã hoàn thành:

1. **Cấu hình cơ bản**

   - tsconfig.json: Path aliases OK
   - vite.config.ts: Proxy API OK
   - .env: Updated to http://localhost:3001/api/v1
   - package.json: Dependencies đầy đủ

2. **API Layer**

   - `api.ts`: ✅ Response interceptor auto-extract data
   - ✅ Upload method hỗ trợ progress tracking
   - ✅ Download method
   - ✅ Custom config (showSuccessMessage, successMessage)

3. **Constants & Enums**

   - ✅ `enums.ts`: Đồng bộ với backend (INTEGER values 1,2,3...)
   - ✅ `enum-labels.ts`: Vietnamese labels
   - ✅ `API_ENDPOINTS`: Updated matching backend routes
   - ✅ Functions return values for dynamic IDs

4. **Services Created**
   - ✅ `authService.ts`: Login, Register, Refresh, Logout
   - ✅ `accountService.ts`: CRUD + getTotalBalance
   - ✅ `transactionService.ts`: CRUD + filters + summary

### ❌ Cần hoàn thiện:

#### 1. Types/Models (PRIORITY: HIGH)

File: `src/types/models/index.ts` - Đã xóa, cần tạo lại với đầy đủ interfaces

```typescript
// Copy toàn bộ code từ file draft đã chuẩn bị (xem phần draft ở cuối)
```

#### 2. Remaining Services (PRIORITY: HIGH)

Tạo các services còn lại theo pattern:

**A. categoryService.ts**

```typescript
import api from './api';
import { API_ENDPOINTS } from '@utils/constants';
import type { ICategory, ICreateCategoryRequest, IUpdateCategoryRequest } from '@types/models';

export const categoryService = {
  getCategories: async (): Promise<ICategory[]> => {
    return api.get<ICategory[]>(API_ENDPOINTS.CATEGORIES.LIST);
  },

  getCategoryById: async (id: string): Promise<ICategory> => {
    return api.get<ICategory>(API_ENDPOINTS.CATEGORIES.GET_BY_ID(id));
  },

  createCategory: async (data: ICreateCategoryRequest): Promise<ICategory> => {
    return api.post<ICategory>(API_ENDPOINTS.CATEGORIES.CREATE, data, {
      showSuccessMessage: true,
      successMessage: 'Tạo danh mục thành công',
    });
  },

  updateCategory: async (id: string, data: IUpdateCategoryRequest): Promise<ICategory> => {
    return api.patch<ICategory>(API_ENDPOINTS.CATEGORIES.UPDATE(id), data, {
      showSuccessMessage: true,
      successMessage: 'Cập nhật danh mục thành công',
    });
  },

  deleteCategory: async (id: string): Promise<void> => {
    return api.delete<void>(API_ENDPOINTS.CATEGORIES.DELETE(id), {
      showSuccessMessage: true,
      successMessage: 'Xóa danh mục thành công',
    });
  },
};
```

**B. budgetService.ts** - Similar pattern

**C. goalService.ts** - Add `contribute` method

**D. debtService.ts** - Add `getPayments`, `createPayment` methods

**E. eventService.ts** - Add `getSummary` method

**F. reminderService.ts** - Add `getUpcoming`, `getByType`, `markComplete` methods

**G. reportService.ts** - 7 methods matching backend endpoints

**H. notificationService.ts** - Add `getUnread`, `getUnreadCount`, `markRead`, `markAllRead` methods

#### 3. Redux Store (PRIORITY: MEDIUM)

**Pattern cho mỗi module:**

File: `src/redux/modules/accounts/accountsSlice.ts`

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { IAccount } from '@types/models';

interface IAccountsState {
  accounts: IAccount[];
  totalBalance: number;
  loading: boolean;
  error: string | null;
}

const initialState: IAccountsState = {
  accounts: [],
  totalBalance: 0,
  loading: false,
  error: null,
};

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    // Fetch
    fetchAccountsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAccountsSuccess: (state, action: PayloadAction<IAccount[]>) => {
      state.loading = false;
      state.accounts = action.payload;
    },
    fetchAccountsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create
    createAccountRequest: (state) => {
      state.loading = true;
    },
    createAccountSuccess: (state, action: PayloadAction<IAccount>) => {
      state.loading = false;
      state.accounts.push(action.payload);
    },
    createAccountFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update
    updateAccountRequest: (state) => {
      state.loading = true;
    },
    updateAccountSuccess: (state, action: PayloadAction<IAccount>) => {
      state.loading = false;
      const index = state.accounts.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.accounts[index] = action.payload;
      }
    },
    updateAccountFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete
    deleteAccountRequest: (state) => {
      state.loading = true;
    },
    deleteAccountSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.accounts = state.accounts.filter((a) => a.id !== action.payload);
    },
    deleteAccountFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Total Balance
    setTotalBalance: (state, action: PayloadAction<number>) => {
      state.totalBalance = action.payload;
    },
  },
});

export const {
  fetchAccountsRequest,
  fetchAccountsSuccess,
  fetchAccountsFailure,
  createAccountRequest,
  createAccountSuccess,
  createAccountFailure,
  updateAccountRequest,
  updateAccountSuccess,
  updateAccountFailure,
  deleteAccountRequest,
  deleteAccountSuccess,
  deleteAccountFailure,
  setTotalBalance,
} = accountsSlice.actions;

export default accountsSlice.reducer;
```

File: `src/redux/modules/accounts/accountsSaga.ts`

```typescript
import { call, put, takeLatest } from 'redux-saga/effects';
import { accountService } from '@services/accountService';
import {
  fetchAccountsRequest,
  fetchAccountsSuccess,
  fetchAccountsFailure,
  createAccountRequest,
  createAccountSuccess,
  createAccountFailure,
  // ... other actions
} from './accountsSlice';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ICreateAccountRequest, IUpdateAccountRequest } from '@types/models';

function* fetchAccountsSaga() {
  try {
    const accounts = yield call(accountService.getAccounts);
    yield put(fetchAccountsSuccess(accounts));

    // Also fetch total balance
    const balance = yield call(accountService.getTotalBalance);
    yield put(setTotalBalance(balance.totalBalance));
  } catch (error: any) {
    yield put(fetchAccountsFailure(error.message));
  }
}

function* createAccountSaga(action: PayloadAction<ICreateAccountRequest>) {
  try {
    const account = yield call(accountService.createAccount, action.payload);
    yield put(createAccountSuccess(account));
    // Refetch accounts to update total balance
    yield put(fetchAccountsRequest());
  } catch (error: any) {
    yield put(createAccountFailure(error.message));
  }
}

// Similar for update, delete...

export function* accountsSaga() {
  yield takeLatest(fetchAccountsRequest.type, fetchAccountsSaga);
  yield takeLatest(createAccountRequest.type, createAccountSaga);
  // ... other watchers
}
```

**Configure rootReducer và rootSaga:**

File: `src/redux/store.ts`

```typescript
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';

// Reducers
import authReducer from './modules/auth/authSlice';
import accountsReducer from './modules/accounts/accountsSlice';
import transactionsReducer from './modules/transactions/transactionsSlice';
// ... other reducers

// Sagas
import { authSaga } from './modules/auth/authSaga';
import { accountsSaga } from './modules/accounts/accountsSaga';
import { transactionsSaga } from './modules/transactions/transactionsSaga';
// ... other sagas

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: {
    auth: authReducer,
    accounts: accountsReducer,
    transactions: transactionsReducer,
    // ... other reducers
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false, // Disable thunk
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(sagaMiddleware),
  devTools: import.meta.env.DEV,
});

function* rootSaga() {
  yield all([
    authSaga(),
    accountsSaga(),
    transactionsSaga(),
    // ... other sagas
  ]);
}

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
```

#### 4. Atomic Components (PRIORITY: MEDIUM)

**A. AmountInput** (`components/atoms/AmountInput/`)

```typescript
import React from 'react';
import { InputNumber, InputNumberProps } from 'antd';
import { formatCurrency } from '@utils/formatters';

interface IAmountInputProps extends Omit<InputNumberProps, 'formatter' | 'parser'> {
  currency?: string;
}

export const AmountInput: React.FC<IAmountInputProps> = ({ currency = 'VND', ...props }) => {
  return (
    <InputNumber
      {...props}
      style={{ width: '100%' }}
      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      parser={(value) => value?.replace(/,/g, '') as any}
      addonAfter={currency}
      min={0}
      precision={0}
    />
  );
};
```

**B. EnumSelect** - Generic select for integer enums

```typescript
interface IEnumSelectProps<T extends number> {
  enumObj: Record<string, T>;
  labels: Record<T, string>;
  value?: T;
  onChange?: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function EnumSelect<T extends number>({
  enumObj,
  labels,
  value,
  onChange,
  placeholder,
  disabled,
}: IEnumSelectProps<T>) {
  const options = Object.values(enumObj)
    .filter((v) => typeof v === 'number')
    .map((v) => ({
      value: v as T,
      label: labels[v as T],
    }));

  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      options={options}
      style={{ width: '100%' }}
    />
  );
}
```

**C. CategorySelect, AccountSelect** - Fetch data from Redux

**D. StatCard, ProgressCard, ChartCard** - Dashboard widgets

#### 5. Pages Implementation (PRIORITY: MEDIUM-LOW)

**Pattern cho Transaction Page:**

File: `pages/transactions/TransactionListPage.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { Table, Button, Space, DatePicker, Select, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactionsRequest } from '@redux/modules/transactions/transactionsSlice';
import { TransactionFormModal } from './TransactionFormModal';
import type { RootState } from '@redux/store';
import type { ITransactionFilters } from '@types/models';

export const TransactionListPage: React.FC = () => {
  const dispatch = useDispatch();
  const { transactions, total, loading, page, pageSize } = useSelector(
    (state: RootState) => state.transactions
  );
  const [filters, setFilters] = useState<ITransactionFilters>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTransactionsRequest(filters));
  }, [dispatch, filters]);

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: TransactionType) => TransactionTypeLabels[type],
    },
    // ... other columns
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Thêm giao dịch
        </Button>
        <DatePicker.RangePicker
          onChange={(dates) =>
            setFilters({ ...filters, startDate: dates?.[0], endDate: dates?.[1] })
          }
        />
        <Select
          placeholder="Loại giao dịch"
          onChange={(type) => setFilters({ ...filters, type })}
        />
        {/* More filters */}
      </Space>

      <Table
        columns={columns}
        dataSource={transactions}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (page, pageSize) => setFilters({ ...filters, page, pageSize }),
        }}
      />

      <TransactionFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          dispatch(fetchTransactionsRequest(filters));
        }}
      />
    </div>
  );
};
```

---

## 🚀 Quick Start Commands

```bash
# Frontend
cd front-end
npm install  # If needed
npm run dev  # Start at http://localhost:3000

# Backend (already running)
# http://localhost:3001/api/v1
# Swagger: http://localhost:3001/docs
```

---

## 📋 Implementation Checklist

### Phase 1: Foundation (1-2 hours)

- [x] Fix api.ts với upload/download methods
- [ ] Tạo đầy đủ types/models/index.ts (copy từ draft)
- [ ] Export services trong services/index.ts
- [ ] Test API call basic (login, get accounts)

### Phase 2: State Management (2-3 hours)

- [ ] accountsSlice + accountsSaga
- [ ] transactionsSlice + transactionsSaga
- [ ] categoriesSlice + categoriesSaga
- [ ] budgetsSlice + budgetsSaga
- [ ] goalsSlice + goalsSaga
- [ ] debtsSlice + debtsSaga
- [ ] eventsSlice + eventsSaga
- [ ] remindersSlice + remindersSaga (NEW)
- [ ] notificationsSlice + notificationsSaga (NEW)
- [ ] Configure store với all reducers + sagas

### Phase 3: Components (2-3 hours)

- [ ] AmountInput
- [ ] EnumSelect
- [ ] CategorySelect (fetch from Redux)
- [ ] AccountSelect (fetch from Redux)
- [ ] StatCard (Dashboard widget)
- [ ] ProgressCard (Budget progress)
- [ ] ChartCard (Charts wrapper)

### Phase 4: Pages (3-4 hours)

- [ ] TransactionListPage + TransactionFormModal
- [ ] AccountListPage + AccountFormModal
- [ ] CategoryListPage + CategoryFormModal
- [ ] BudgetListPage + BudgetFormModal
- [ ] GoalListPage + GoalFormModal
- [ ] DebtListPage + DebtFormModal + DebtPaymentModal
- [ ] EventListPage + EventFormModal
- [ ] ReminderListPage + ReminderFormModal (NEW)
- [ ] NotificationDropdown in DashboardLayout (NEW)
- [ ] ReportsPage với 7 chart types

### Phase 5: Dashboard (1-2 hours)

- [ ] Total balance card
- [ ] Income vs Expense summary
- [ ] Recent transactions widget (5 items)
- [ ] Budget progress bars (top 3)
- [ ] Upcoming reminders widget
- [ ] Charts (income/expense trend, category distribution)

### Phase 6: Polish & Testing (2-3 hours)

- [ ] Test all CRUD operations
- [ ] Test filters, pagination
- [ ] Form validations
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design
- [ ] Fix bugs

---

## 📦 TYPES DRAFT (Ready to use)

File: `src/types/models/index.ts` - Copy toàn bộ code này:

\`\`\`typescript
// [Content từ draft đã chuẩn bị ở trên - 600+ lines]
// Bao gồm tất cả interfaces: IUser, IAccount, ITransaction, ICategory, IBudget,
// IGoal, IDebt, IEvent, IReminder, INotification, IReport types, Auth types, etc.
\`\`\`

---

## 🎯 Priority Order

1. **HIGH**: Types + Services (foundation)
2. **MEDIUM**: Redux Store (state management)
3. **MEDIUM**: Atomic Components (reusable)
4. **MEDIUM-LOW**: Pages (features)
5. **LOW**: Polish & Testing

---

## ⚠️ Common Pitfalls

1. **Enums**: Always use INTEGER (1,2,3) not strings
2. **API Response**: Already auto-extracted by interceptor
3. **Types Import**: Use `@types/models` not `@types/models.ts`
4. **Redux**: Use `takeLatest` for user actions, `takeEvery` for background
5. **Forms**: Use Ant Design Form.Item with `name` prop for auto-binding

---

## 📚 Resources

- Backend API: http://localhost:3001/api/v1
- Swagger Docs: http://localhost:3001/docs
- Backend Endpoints: 80+ endpoints đã sẵn sàng
- Database: PostgreSQL với 14 tables

Good luck! 🚀
