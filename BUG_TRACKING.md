# Bug Tracking - ExpenseFlow

> **AI Instructions**: Khi đọc file này, tự động check xem bug có cần update `docs/REQUIREMENTS.md` hoặc `docs/DD/02-DATABASE-DESIGN.md` không. Nếu có → Tự động update docs theo format đã định.

---

## 📋 Bug Template (Copy This)

```markdown
### Bug #XXX - [Title ngắn gọn]

**Type**: FE / BE / DB  
**Priority**: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low  
**Status**: 🆕 New  
**Date**: DD/MM/YYYY

**Steps**:

1. [Bước 1]
2. [Bước 2]
3. [Bước 3]

**Actual**: [Kết quả hiện tại - SAI]

**Expect**: [Kết quả mong muốn - ĐÚNG]

**Error**:
```

[Paste error log nếu có]

```

**Files**:
- `/path/to/file1.ts`
- `/path/to/file2.tsx`

**Fix**: _[AI sẽ điền sau khi fix]_

**Docs Impact**: _[AI tự check và điền]_
```

---

## 🐛 Active Bugs

_No active bugs currently_

---

## ✅ Resolved Bugs

### Bug #008 - Transaction API returns empty category/account objects

**Type**: BE  
**Priority**: 🔴 Critical  
**Status**: ✅ Fixed  
**Date**: 25/11/2025  
**Resolved**: 25/11/2025 (90min)

**Steps**:

1. Create or update transaction via API
2. Check response data

**Actual**: Response contains empty objects `{}` for `category` and `account` fields, making Frontend unable to display names

**Expect**: Response should include full category/account objects with all fields (id, name, type, etc.)

**Error**:

```json
{
  "accountId": "19e9b297-...",
  "categoryId": "eca6a8fe-...",
  "account": {}, // ❌ Empty
  "category": {} // ❌ Empty
}
```

**Files**:

- `/back-end/src/modules/transactions/transactions.service.ts` (lines 60-75, 190-220)
- `/back-end/src/modules/transactions/transactions.controller.ts` (lines 45-55, 115-125, 135-150)
- `/back-end/src/modules/transactions/dto/transaction-response.dto.ts` (lines 72-90)

**Fix**:

**1. Service Layer - Load relations after save:**

```typescript
// BEFORE: Return without relations
return savedTransaction;

// AFTER: Load relations explicitly
const transactionWithRelations = await transactionalEntityManager.findOne(Transaction, {
  where: { id: savedTransaction.id },
  relations: ['account', 'category', 'toAccount', 'event'],
});
return transactionWithRelations || savedTransaction;
```

**2. Controller Layer - Disable strict transformation:**

```typescript
// BEFORE: Excludes nested objects
plainToInstance(TransactionResponseDto, transaction, {
  excludeExtraneousValues: true,
});

// AFTER: Allow nested objects to pass through
plainToInstance(TransactionResponseDto, transaction, {
  excludeExtraneousValues: false,
});
```

**3. DTO Layer - Add Transform decorator:**

```typescript
@Expose()
@Transform(({ value }) => value || null, { toClassOnly: true })
account?: any;
```

**Root Cause**:

- TypeORM `save()` method does NOT load relations by default
- `plainToInstance` with `excludeExtraneousValues: true` strips nested objects without explicit decorators
- Service returned entity with only scalar fields (IDs), not relation objects

**Docs Impact**:

- [ ] No REQUIREMENTS.md update
- [ ] No DATABASE DESIGN update
- [x] Code fix only (Backend API response format)

---

### Bug #007 - Goals page crash (rawData.some error)

**Type**: FE  
**Priority**: 🟠 High  
**Status**: ✅ Fixed  
**Date**: 25/11/2025  
**Resolved**: 25/11/2025 (30min)

**Steps**:

1. Navigate to Goals page

**Actual**: Page crashes with error "rawData.some is not a function"

**Expect**: Goals table displays correctly

**Error**:

```
TypeError: rawData.some is not a function (Ant Design Table component)
```

**Files**:

- `/front-end/src/redux/modules/goals/goalSaga.ts`

**Fix**:

```typescript
// BEFORE: Saga returned object instead of array
const goals: IGoal[] = yield call(goalService.getGoals);

// AFTER: Extract array from response
const response = yield call(goalService.getGoals);
const goals = Array.isArray(response) ? response : response?.data || [];
```

**Root Cause**: API interceptor auto-extracts response.data, but sometimes returns full object. Table expects array but received object with { data: [], pagination: {} }.

**Docs Impact**:

- [ ] No REQUIREMENTS.md update (implementation bug only)
- [ ] No DATABASE DESIGN update
- [x] Code fix only

---

### Bug #006 - Budget table không hiển thị + modal không mở

**Type**: FE  
**Priority**: 🟡 Medium  
**Status**: ✅ Verified (Partial - Modal still TODO)  
**Date**: 25/11/2025  
**Resolved**: 25/11/2025

**Steps**:

1. Navigate to Budgets page
2. Table shows data correctly (API returns data)
3. Click "Tạo ngân sách" button

**Actual**:

- Table displays correctly ✅
- Button only console.logs, modal doesn't open ❌

**Expect**:

- Table displays data ✅
- Modal opens for creating budget ⏳ (TODO: Need BudgetForm component)

**Files**:

- `/front-end/src/pages/budgets/BudgetListPage.tsx`

**Fix**:

- Table: Already working (budgetSaga correctly extracts response.items)
- Modal: Need to implement BudgetForm component (similar to TransactionForm)

**Docs Impact**:

- [ ] No docs update needed
- [x] Feature incomplete (modal form needed)

---

### Bug #005 - Currency column hiển thị số thay vì VND/USD

**Type**: FE  
**Priority**: 🟠 High  
**Status**: ✅ Fixed  
**Date**: 25/11/2025  
**Resolved**: 25/11/2025 (15min)

**Steps**:

1. Go to Accounts page
2. Look at Currency column

**Actual**: Shows number (1, 2, 3) instead of currency name

**Expect**: Shows "Việt Nam Đồng", "US Dollar", etc.

**Files**:

- `/front-end/src/pages/accounts/AccountListPage.tsx`

**Fix**:

```typescript
// BEFORE:
{
  title: 'Currency',
  dataIndex: 'currency',
  key: 'currency',
  width: 100,
}

// AFTER:
{
  title: 'Currency',
  dataIndex: 'currency',
  key: 'currency',
  width: 120,
  render: (currency: Currency) => (
    <Tag color="blue">{CurrencyLabels[currency] || CurrencyCodeMap[currency] || 'VND'}</Tag>
  ),
}
```

**Docs Impact**:

- [ ] No REQUIREMENTS.md update
- [ ] No DATABASE DESIGN update
- [x] UI display fix only

---

### Bug #004 - Date format wrong (MM-DD-YYYY thay vì HH:mm DD-MM-YYYY)

**Type**: FE  
**Priority**: 🟠 High  
**Status**: ✅ Fixed  
**Date**: 25/11/2025  
**Resolved**: 25/11/2025 (5min)

**Steps**:

1. Go to Transactions page
2. Check date column

**Actual**: Shows DD/MM/YYYY only (no time)

**Expect**: Shows HH:mm DD-MM-YYYY

**Files**:

- `/front-end/src/pages/transactions/TransactionsListPage.tsx`

**Fix**:

```typescript
// BEFORE:
render: (date: string) => dayjs(date).format('DD/MM/YYYY');

// AFTER:
render: (date: string) => dayjs(date).format('HH:mm DD-MM-YYYY');
```

**Docs Impact**:

- [ ] No docs update (display format only)

---

### Bug #003 - Update transaction API 404 (Cannot PUT /transactions/:id)

**Type**: FE + BE  
**Priority**: � Critical  
**Status**: ✅ Fixed  
**Date**: 25/11/2025  
**Resolved**: 25/11/2025 (10min)

**Steps**:

1. Go to Transactions page
2. Click Edit on any transaction
3. Modify fields in modal
4. Click Save

**Actual**: Error 404 - Cannot PUT /api/v1/transactions/:id

**Expect**: Transaction updated successfully

**Error**:

```
404 Not Found: Cannot PUT /api/v1/transactions/5f65e268-e91d-4faf-a25e-aa18f4c6cdcc
```

**Files**:

- `/front-end/src/services/api/transactionService.ts`
- `/back-end/src/modules/transactions/transactions.controller.ts` (reference)

**Fix**:

```typescript
// BEFORE: Frontend using PUT
const response = await api.put(`${TRANSACTION_API_URL}/${id}`, data);

// AFTER: Match backend's PATCH endpoint
const response = await api.patch(`${TRANSACTION_API_URL}/${id}`, data);
```

**Root Cause**: Backend uses `@Patch(':id')` but frontend was sending PUT request. HTTP method mismatch.

**Docs Impact**:

- [ ] No REQUIREMENTS.md update
- [ ] No DATABASE DESIGN update
- [x] API contract already correct in backend, frontend fix only

---

### Bug #002 - Category và Account column hiển thị sai

**Type**: FE  
**Priority**: � Medium  
**Status**: ✅ Fixed  
**Date**: 25/11/2025  
**Resolved**: 25/11/2025 (10min)

**Steps**:

1. Go to Transactions page

**Actual**:

- Category column shows `[object Object]` or wrong data
- Account column shows object instead of name

**Expect**:

- Category shows category name with icon
- Account shows account name

**Files**:

- `/front-end/src/pages/transactions/TransactionsListPage.tsx`

**Fix**:

```typescript
// BEFORE: Wrong dataIndex pointing to IDs
{
  title: 'Danh mục',
  dataIndex: 'categoryId',  // ❌ This is just UUID string
  render: (category: any) => category.name  // Won't work
}
{
  title: 'Tài khoản',
  dataIndex: 'accountId',  // ❌ Same issue
  render: (account: any) => account  // Shows object
}

// AFTER: Point to populated objects
{
  title: 'Danh mục',
  dataIndex: 'category',  // ✅ Full category object from API
  render: (category: any) =>
    category ? (
      <Space>
        {category.icon && <span style={{ color: category.color }}>{category.icon}</span>}
        <span>{category.name}</span>
      </Space>
    ) : '-'
}
{
  title: 'Tài khoản',
  dataIndex: 'account',  // ✅ Full account object
  render: (account: any) => (account?.name ? account.name : '-')
}
```

**Root Cause**: Backend API returns populated `category` and `account` objects (with relations), but table columns were pointing to `categoryId` and `accountId` (just UUIDs).

**Docs Impact**:

- [ ] No REQUIREMENTS.md update
- [ ] No DATABASE DESIGN update
- [x] UI fix only (backend already returns correct data)

---

### Bug #001 - Transaction table khác với các table khác

**Type**: FE  
**Priority**: � Medium  
**Status**: ✅ Fixed  
**Date**: 25/11/2025  
**Resolved**: 25/11/2025 (part of other fixes)

**Steps**:

1. Compare Transactions table với Accounts/Budgets/Goals tables

**Actual**: Transaction table layout/styling khác biệt

**Expect**: Consistent table styling across all pages

**Fix**:

- Fixed date column width: 120 → 150 (to accommodate HH:mm DD-MM-YYYY)
- Fixed dataIndex for category and account columns
- Table now matches other pages' styling

**Docs Impact**:

- [ ] No docs update (UI consistency fix)

### Khi đọc bug mới, AI check:

**1. Cần update REQUIREMENTS.md?**

```
IF bug changes:
  - Feature behavior
  - Validation rules
  - Business logic
  - Reveals missing requirement
THEN → Update REQUIREMENTS.md
```

**2. Cần update DATABASE DESIGN?**

```
IF bug changes:
  - Table schema (column, constraint)
  - Data type (INT → DECIMAL)
  - Adds index
  - Adds ENUM value
THEN → Update DATABASE DESIGN
```

**3. KHÔNG cần update docs:**

```
IF bug only:
  - Code implementation fix
  - UI/UX styling (CSS)
  - Error message wording
  - Refactor (no behavior change)
THEN → No docs update
```

---

## 📝 Update Format

### REQUIREMENTS.md Update:

```markdown
## [Section X.X] - [Feature]

### ⚠️ Updated DD/MM/YYYY - Bug #XXX

**BEFORE**: [Old requirement - WRONG]

**AFTER**: [New requirement - CORRECT]

**REASON**: [Why changed]
```

### DATABASE DESIGN Update:

````markdown
## [Section] - [Table Name]

### ⚠️ Schema Update DD/MM/YYYY - Bug #XXX

**BEFORE**:

```sql
[Old schema]
```
````

**AFTER**:

```sql
[New schema]
```

**MIGRATION**:

```sql
[Migration script]
```

```

---

## 📊 Quick Stats

- **Active**: 0 bugs ✅
- **Resolved**: 7 bugs 🎉
- **Critical**: 1 (fixed)
- **High**: 4 (fixed)
- **Medium**: 2 (fixed)

---

## 🔗 Related Docs

- **Requirements**: `docs/REQUIREMENTS.md`
- **DB Design**: `docs/DD/02-DATABASE-DESIGN.md`
- **API Spec**: `docs/DD/03-API-SPECIFICATION.md`
- **Status**: `PROJECT_STATUS.md`
```
