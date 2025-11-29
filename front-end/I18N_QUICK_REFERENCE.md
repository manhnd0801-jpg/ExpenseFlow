# 🚀 Quick Reference - Modular i18n

## 📝 Cheat Sheet

### Thêm translation mới

```bash
# 1. Edit file module
vi src/locales/vi/transactions.json    # Thêm key mới
vi src/locales/en/transactions.json    # Thêm bản dịch tiếng Anh

# 2. Merge
npm run i18n:merge

# 3. Dùng trong code
const { t } = useI18n();
{t('transactions.yourNewKey')}
```

### Tìm translation

```bash
# Tìm theo key
grep -r "deleteSuccess" src/locales/vi/

# Tìm theo value
grep -r "Xóa thành công" src/locales/vi/
```

### Tạo module mới

```bash
# 1. Tạo file
touch src/locales/{vi,en}/myModule.json

# 2. Thêm nội dung giống nhau cho cả 2 file
echo '{"title": "..."}' > src/locales/vi/myModule.json
echo '{"title": "..."}' > src/locales/en/myModule.json

# 3. Merge
npm run i18n:merge
```

### Kiểm tra consistency

```bash
# So sánh số lượng key giữa VI và EN
diff <(ls src/locales/vi/) <(ls src/locales/en/)

# Đếm keys trong mỗi module
wc -l src/locales/vi/*.json
```

---

## 📂 Module Map (Tìm translation ở đâu?)

| Feature       | Module File               | Example Keys                       |
| ------------- | ------------------------- | ---------------------------------- |
| Buttons chung | `common.json`             | add, edit, delete, save, cancel    |
| Menu sidebar  | `navigation.json`         | dashboard, transactions, budgets   |
| Đăng nhập     | `auth.json`               | login, register, password          |
| Dashboard     | `dashboard.json`          | welcome, income, expense           |
| Giao dịch     | `transactions.json`       | addTransaction, amount, date       |
| Ngân sách     | `budgets.json`            | createBudget, spent, remaining     |
| Tài khoản     | `accounts.json`           | addAccount, balance, transfer      |
| Danh mục      | `categories.json`         | createCategory, icon, color        |
| Báo cáo       | `reports.json`            | exportReport, incomeVsExpense      |
| Mục tiêu      | `goals.json`              | createGoal, progress, contribute   |
| Công nợ       | `debts.json`              | lending, borrowing, overdue        |
| Khoản vay     | `loans.json`              | loanType, interestRate, payment    |
| Sự kiện       | `events.json`             | createEvent, budget, location      |
| Nhắc nhở      | `reminders.json`          | createReminder, frequency, dueDate |
| Cài đặt       | `settings.json`           | language, theme, notifications     |
| Enum labels   | `enumLabels.json`         | accountType, transactionType       |
| Validation    | `validation.json`         | required, min, max                 |
| Messages      | `validationMessages.json` | email, minLength, maxLength        |
| Notifications | `notifications.json`      | success, error                     |

---

## 🎨 Translation Key Patterns

### Naming Convention

```
{module}.{feature}.{specificAction}

Examples:
- transactions.add              ✅ Simple
- transactions.deleteConfirmation  ✅ Descriptive
- transactions.form.amount.placeholder  ✅ Nested
```

### Common Suffixes

```
.title          - Tiêu đề trang/section
.description    - Mô tả chi tiết
.placeholder    - Placeholder input
.required       - Validation message
.success        - Success message
.error          - Error message
.confirmation   - Confirmation dialog
.tooltip        - Tooltip text
```

---

## ⚡ Performance Tips

### Module Size Guidelines

- ✅ **20-50 keys per module**: Sweet spot
- ⚠️ **> 100 keys**: Consider splitting
- ❌ **< 10 keys**: Maybe merge with related module

### Merge Performance

```bash
# Current: ~50ms for 38 files
npm run i18n:merge

# If slow (> 1s), check:
- File encoding (use UTF-8)
- JSON syntax errors
- Large nested objects
```

---

## 🔧 Maintenance Commands

```bash
# Count total translation keys
find src/locales/vi -name "*.json" -exec cat {} \; | grep -c ":"

# Find empty modules
for f in src/locales/vi/*.json; do
  [ $(jq 'length' "$f") -lt 5 ] && echo "$f is small";
done

# Check for duplicate keys across modules
for key in $(grep -roh '"[^"]*":' src/locales/vi/ | sort | uniq -d); do
  echo "Duplicate: $key"
  grep -rn "$key" src/locales/vi/
done

# Validate all JSON files
for f in src/locales/{vi,en}/*.json; do
  jq empty "$f" 2>/dev/null || echo "Invalid JSON: $f"
done
```

---

## 🚨 Common Mistakes & Fixes

### ❌ Mistake 1: Edit vi.json directly

```bash
# WRONG
vi src/locales/vi.json

# RIGHT
vi src/locales/vi/transactions.json
npm run i18n:merge
```

### ❌ Mistake 2: Forget to merge before commit

```bash
# Add to pre-commit hook (optional)
echo "npm run i18n:merge" > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### ❌ Mistake 3: Inconsistent keys between VI/EN

```bash
# Check consistency
diff <(jq -r 'keys[]' src/locales/vi/common.json | sort) \
     <(jq -r 'keys[]' src/locales/en/common.json | sort)
```

### ❌ Mistake 4: Create module in only one language

```bash
# Always create both!
touch src/locales/vi/myModule.json
touch src/locales/en/myModule.json  # Don't forget!
```

---

## 📦 Git Workflow

```bash
# 1. Pull latest
git pull origin main

# 2. Edit translations
vi src/locales/vi/transactions.json

# 3. Merge
npm run i18n:merge

# 4. Commit (only modular files are tracked)
git add src/locales/vi/
git add src/locales/en/
# vi.json and en.json are in .gitignore
git commit -m "feat(i18n): add transaction.newFeature"

# 5. Push
git push
```

---

## 🔍 Debugging

### Translation not appearing?

```bash
# 1. Check key exists
cat src/locales/vi/module.json | grep "keyName"

# 2. Check merged file
cat src/locales/vi.json | grep "keyName"

# 3. Re-merge
npm run i18n:merge

# 4. Check browser console
# Look for: "Translation key 'module.keyName' not found"
```

### Wrong language showing?

```bash
# Check i18n config
cat src/i18n.ts | grep "lng"

# Check localStorage
# Open DevTools > Application > localStorage > i18nextLng
```

---

## 📚 Full Documentation

- **Complete guide**: `src/locales/README.md`
- **Migration summary**: `I18N_MODULAR_SUMMARY.md`
- **Source code**: `src/locales/mergeTranslations.cjs`

---

**Made with ❤️ for ExpenseFlow project**
