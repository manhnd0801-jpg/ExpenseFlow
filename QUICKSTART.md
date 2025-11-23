# 🚀 ExpenseFlow - Quick Start Guide

## ✅ Công việc đã hoàn thành

### Backend ✅

- [x] NestJS backend với đầy đủ modules
- [x] PostgreSQL database setup
- [x] TypeORM entities
- [x] Integer-based enums (sync với FE)
- [x] JWT authentication
- [x] Swagger documentation
- [x] Response format chuẩn
- [x] Error handling

### Frontend ✅

- [x] React 18 + TypeScript + Vite setup
- [x] Redux Toolkit + Redux-Saga
- [x] Ant Design v5
- [x] Axios với interceptors
- [x] Integer-based enums (sync với BE)
- [x] Enum labels cho UI
- [x] Atomic Design structure
- [x] Services layer
- [x] Basic pages structure

### Documentation ✅

- [x] `FRONTEND_INTEGRATION_GUIDE.md` - Hướng dẫn chi tiết tích hợp
- [x] `seed-data.sh` - Script seed data tự động
- [x] API Specification trong `/docs/DD/`

---

## 🎯 Bước tiếp theo (QUAN TRỌNG)

### Bước 1: Khởi động Backend & Seed Data

**Terminal 1 - Backend:**

```bash
cd back-end
npm run start:dev
```

Đợi backend khởi động xong (thấy message "Application is running...")

**Terminal 2 - Seed Data:**

```bash
./seed-data.sh
```

Script sẽ tự động:

- Đăng ký user demo: `demo@expenseflow.com` / `Demo123456`
- Tạo 12 categories (4 thu nhập + 8 chi tiêu)
- Tạo 4 accounts (tiền mặt, ngân hàng, ví điện tử)
- Tạo 12 transactions mẫu
- Tạo 1 budget cho ăn uống

### Bước 2: Khởi động Frontend

**Terminal 3 - Frontend:**

```bash
cd front-end
npm run dev
```

Frontend sẽ chạy ở `http://localhost:3000`

### Bước 3: Test Login & Dashboard

1. Mở trình duyệt: `http://localhost:3000`
2. Login với:
   - Email: `demo@expenseflow.com`
   - Password: `Demo123456`
3. Kiểm tra Dashboard có hiển thị data không

---

## 🔧 Công việc cần hoàn thiện

### Core Features (Ưu tiên cao)

#### 1. Dashboard Page ⚠️

**File:** `front-end/src/pages/dashboard/DashboardPage.tsx`

**Vấn đề:**

- Selectors chưa đúng (selectTotalIncome, selectTotalExpense không tồn tại)
- Chưa load transaction summary từ API

**Cần làm:**

```typescript
// Tính stats từ transactions thay vì dùng selectors không tồn tại
const stats = useMemo(() => {
  const totalIncome = transactions
    .filter((t) => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);
  // ... tương tự cho expense và balance
  return { totalIncome, totalExpense, balance };
}, [transactions]);
```

#### 2. Transaction List Page ⚠️

**File:** `front-end/src/pages/transactions/TransactionListPage.tsx`

**Vấn đề:**

- Interface ITransaction thiếu trường `transactionDate` (backend dùng transactionDate thay vì date)
- Thiếu fields `category` và `account` populated

**Cần làm:**

- Fix interface trong `transactionTypes.ts`
- Update table columns để hiển thị category.name, account.name

#### 3. Create Transaction Form ⭐

**Cần tạo mới:** `front-end/src/components/organisms/TransactionForm.tsx`

Đã có template trong file `FRONTEND_INTEGRATION_GUIDE.md` (section "Create Transaction Form")

**Tích hợp vào:**

- Modal trong TransactionListPage
- Hoặc tạo route `/transactions/create`

#### 4. Account List Page ⚠️

**File:** `front-end/src/pages/accounts/AccountListPage.tsx`

**Cần làm:**

- Load accounts từ API (đã có accountService)
- Hiển thị type label (dùng AccountTypeLabels)
- CRUD operations

#### 5. Category List Page ⚠️

**File:** `front-end/src/pages/categories/CategoryListPage.tsx`

**Cần làm:**

- Load categories từ API
- Hiển thị type label (Thu nhập/Chi tiêu)
- CRUD với integer enum values

### Advanced Features (Ưu tiên thấp hơn)

- [ ] Budget Management (BudgetListPage)
- [ ] Goals Management (GoalsListPage)
- [ ] Debts Management (DebtsListPage)
- [ ] Events Management (EventsListPage)
- [ ] Reports with Charts (ReportsPage)
- [ ] Reminders (RemindersListPage)

---

## 📝 Code Examples

### Fix Transaction Interface

**File:** `front-end/src/redux/modules/transactions/transactionTypes.ts`

```typescript
export interface ITransaction {
  id: string;
  userId: string;
  categoryId: string;
  accountId: string;
  type: TransactionType; // 1 = Income, 2 = Expense
  amount: number;
  description: string;
  transactionDate: string; // ⚠️ Backend dùng transactionDate, không phải date
  note?: string;

  // Populated fields từ backend (khi có include query)
  category?: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
    type: number;
  };
  account?: {
    id: string;
    name: string;
    type: number;
    balance: number;
  };

  createdAt: string;
  updatedAt: string;
}
```

### Display Transaction in Table

```typescript
const columns = [
  {
    title: 'Ngày',
    dataIndex: 'transactionDate',
    key: 'transactionDate',
    render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
  },
  {
    title: 'Danh mục',
    dataIndex: 'category',
    key: 'category',
    render: (category: any) => category?.name || '-',
  },
  {
    title: 'Số tiền',
    dataIndex: 'amount',
    key: 'amount',
    render: (amount: number, record: ITransaction) => (
      <span className={record.type === TransactionType.INCOME ? 'income' : 'expense'}>
        {record.type === TransactionType.INCOME ? '+' : '-'}
        {formatCurrency(amount)}
      </span>
    ),
  },
];
```

### Use Enum Labels

```typescript
import { TransactionType } from '@constants/enums';
import { TransactionTypeLabels } from '@constants/enum-labels';

// Display label
<Tag color={transaction.type === TransactionType.INCOME ? 'green' : 'red'}>
  {TransactionTypeLabels[transaction.type]} {/* "Thu nhập" hoặc "Chi tiêu" */}
</Tag>;
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot read property 'name' of undefined"

**Nguyên nhân:** Backend trả về transaction không có category/account populated

**Giải pháp:**

- Check backend có populate relations không
- Hoặc hiển thị categoryId thay vì category.name khi không có data

### Issue 2: Type error với enum

**Lỗi:** `Type 'string' is not assignable to type 'number'`

**Giải pháp:**

- PHẢI dùng `TransactionType.INCOME` (số 1), KHÔNG dùng `'income'` (string)
- Check form submit có convert string thành number không

### Issue 3: 401 Unauthorized

**Giải pháp:**

- Check token trong localStorage
- Token expired → Logout và login lại
- Check Bearer token trong request headers

### Issue 4: Data không hiển thị

**Giải pháp:**

- Mở DevTools > Network tab xem API response
- Check Redux DevTools xem state có update không
- Console.log data để debug

---

## 📚 Tài liệu quan trọng

1. **`FRONTEND_INTEGRATION_GUIDE.md`** ⭐⭐⭐
   - Hướng dẫn chi tiết từng bước
   - Code examples đầy đủ
   - Fix common issues
2. **`docs/DD/03-API-SPECIFICATION.md`**

   - Chi tiết tất cả APIs
   - Request/Response format
   - Enum values

3. **`docs/frontend-instrucstion.md`**

   - Quy tắc code frontend
   - TypeScript naming conventions
   - Project structure

4. **Swagger Docs:** `http://localhost:3001/docs`
   - Test APIs trực tiếp
   - Xem request/response schema

---

## ✅ Test Checklist

Sau khi hoàn thiện, test theo thứ tự:

1. [ ] Backend chạy ở port 3001
2. [ ] Frontend chạy ở port 3000
3. [ ] Seed data thành công
4. [ ] Login thành công với demo user
5. [ ] Dashboard hiển thị summary statistics
6. [ ] Transaction List hiển thị danh sách
7. [ ] Create transaction thành công
8. [ ] Edit transaction thành công
9. [ ] Delete transaction thành công
10. [ ] Account List hiển thị accounts
11. [ ] Category List hiển thị categories

---

## 🎯 Development Flow Đề Nghị

### Phase 1: Core (1-2 ngày)

1. Fix Dashboard selectors
2. Fix Transaction interface + List
3. Implement TransactionForm (Create/Edit)
4. Test CRUD transactions

### Phase 2: Account & Category (1 ngày)

5. Implement AccountListPage CRUD
6. Implement CategoryListPage CRUD
7. Test integration

### Phase 3: Advanced (2-3 ngày)

8. Implement BudgetListPage
9. Implement GoalsListPage
10. Implement ReportsPage với charts
11. Polish UI/UX

### Phase 4: Testing & Polish (1 ngày)

12. End-to-end testing
13. Error handling
14. Loading states
15. Responsive design

---

## 🚀 Commands Cheat Sheet

```bash
# Start backend
cd back-end && npm run start:dev

# Seed data
./seed-data.sh

# Start frontend
cd front-end && npm run dev

# Check backend health
curl http://localhost:3001/api/v1/health

# View Swagger docs
open http://localhost:3001/docs

# View frontend
open http://localhost:3000
```

---

**Good luck! 🎉**

Nếu gặp khó khăn, check:

1. Backend logs trong terminal
2. Browser DevTools > Console
3. Browser DevTools > Network tab
4. Redux DevTools
5. File `FRONTEND_INTEGRATION_GUIDE.md` cho chi tiết

---

**Test Account:**

- Email: `demo@expenseflow.com`
- Password: `Demo123456`
