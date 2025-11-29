# I18N Remaining Tasks

## ✅ Completed

- Updated vi.json and en.json with missing keys
- Fixed duplicate sections in vi.json
- Applied i18n to TransactionDetailPage.tsx
- Partially applied i18n to LoanDetailPage.tsx

## 🔄 In Progress

### LoanDetailPage.tsx

**Location:** `/front-end/src/pages/loans/LoanDetailPage.tsx`

**Hardcoded text to replace:**

Lines ~230-250 (Payment columns):

```tsx
{
  title: 'Ngày thanh toán',  // → t('loans.paymentDate')
  title: 'Số tiền',          // → t('common.amount')
  title: 'Gốc',              // → t('loans.principal')
  title: 'Lãi',              // → t('loans.interest')
  title: 'Ghi chú',          // → t('common.note')
}
```

Lines ~310-365 (Statistics & Descriptions):

```tsx
title = 'Tổng tiền lãi'; // → t('loans.totalInterest')
title = 'Đã trả'; // → Use existing or add 'loans.paid'
title = 'Thông tin khoản vay'; // → t('loans.loanDetails')
label = 'Loại khoản vay'; // → t('loans.loanType')
label = 'Số tiền vay'; // → t('loans.loanAmount')
label = 'Lãi suất'; // → t('loans.interestRate')
label = 'Kỳ hạn'; // → t('loans.term')
label = 'Trả hàng tháng'; // → t('loans.monthlyPayment')
label = 'Tổng phải trả'; // → t('loans.totalPayment')
label = 'Ngày bắt đầu'; // → t('events.startDate')
label = 'Ngày đáo hạn'; // → Use existing or add 'loans.dueDate'
label = 'Trạng thái'; // → t('common.status')
```

Lines ~402-420 (Pagination):

```tsx
showTotal: (total) => `Tổng ${total} kỳ`; // → t('loans.totalPeriods', { total })
showTotal: (total) => `Tổng ${total} giao dịch`; // → t('loans.totalTransactions', { total })
emptyText: 'Chưa có thanh toán nào'; // → t('loans.noPayments')
```

**Additional keys needed in translation files:**

```json
{
  "loans": {
    "paymentDate": "Payment Date" / "Ngày thanh toán",
    "paid": "Paid" / "Đã trả",
    "remainingBalance": "Remaining Balance" / "Số dư còn lại",
    "dueDate": "Due Date" / "Ngày đáo hạn",
    "loanInformation": "Loan Information" / "Thông tin khoản vay",
    "startDate": "Start Date" / "Ngày bắt đầu"
  }
}
```

---

### LoanForm.tsx

**Location:** `/front-end/src/pages/loans/LoanForm.tsx`

**Hardcoded text to replace:**

Lines ~438-460:

```tsx
'Chi tiết khoản vay'; // → t('loans.loanDetails')
'Tổng phải trả:'; // → t('loans.totalPayment')
'Tổng tiền lãi:'; // → t('loans.totalInterest')
'Lãi suất thực tế:'; // → t('loans.effectiveRate')
'Số tiền vay:'; // → t('loans.loanAmount')
'Kỳ hạn:'; // → t('loans.term')
```

**Additional keys needed:**

```json
{
  "loans": {
    "calculationDetails": "Calculation Details" / "Chi tiết tính toán"
  }
}
```

---

### BudgetEditPage.tsx

**Location:** `/front-end/src/pages/budgets/BudgetEditPage.tsx`

**Hardcoded text to replace:**

Lines ~36, ~56:

```tsx
message.error('ID ngân sách không hợp lệ'); // → t('budgets.invalidId')
message.error('Không thể tải thông tin ngân sách'); // → t('budgets.loadError')
```

**Additional keys needed:**

```json
{
  "budgets": {
    "invalidId": "Invalid budget ID" / "ID ngân sách không hợp lệ",
    "loadError": "Cannot load budget information" / "Không thể tải thông tin ngân sách"
  }
}
```

---

### ReportsPage.tsx

**Location:** `/front-end/src/pages/reports/ReportsPage.tsx`

**Hardcoded text to replace:**

Lines ~114-116:

```tsx
type: t.type === TransactionType.INCOME ? 'Thu nhập' : 'Chi tiêu',
// Should use: t('enumLabels.transactionType.income') / t('enumLabels.transactionType.expense')

category: 'Danh mục',  // → Use category name from data or t('common.category')
```

Line ~144:

```tsx
const categoryName = 'Danh mục'; // → Should use actual category name from lookup
```

---

## 📝 Notes

1. All files should import `useI18n` hook:

   ```tsx
   import { useI18n } from '@hooks/useI18n';
   ```

2. Use the hook in component:

   ```tsx
   const { t } = useI18n();
   ```

3. For dynamic content with interpolation:

   ```tsx
   t('key.path', { variable: value });
   ```

4. Always check both `vi.json` and `en.json` have the same structure

5. For enum labels, use existing `enumLabels` section in translation files

---

## 🎯 Priority Order

1. **HIGH**: LoanDetailPage.tsx (most hardcoded text)
2. **MEDIUM**: LoanForm.tsx (user-facing calculator)
3. **LOW**: BudgetEditPage.tsx (just error messages)
4. **LOW**: ReportsPage.tsx (internal labels, less critical)

---

## ✅ Verification Checklist

After completing each file:

- [ ] No more hardcoded Vietnamese/English strings
- [ ] All t() calls have corresponding keys in both vi.json and en.json
- [ ] No lint errors
- [ ] Test language switching works correctly
- [ ] UI text displays properly in both languages
