# ExpenseFlow - AI Coding Instructions

## Project Context

ExpenseFlow là ứng dụng quản lý chi tiêu cá nhân với:

- **Backend:** NestJS + TypeScript + PostgreSQL + Redis (Port 3001)
- **Frontend:** React 18 + TypeScript + Redux Toolkit + Ant Design v5 (Port 3000)

---

## Backend Development Rules

**Khi được yêu cầu code/fix Backend, PHẢI tuân thủ:**

📄 **Tham khảo:** `docs/backend-instrucstion.md` cho đầy đủ quy tắc

### Critical Backend Rules:

1. **ENUM Constants (QUAN TRỌNG)**

   - PHẢI dùng INTEGER enums (1, 2, 3...) trong `src/common/constants/enums.ts`
   - PHẢI sync với database SMALLINT columns
   - ❌ KHÔNG dùng string enums ('active', 'pending')
   - ✅ Ví dụ: `AccountType.CASH = 1, AccountType.BANK = 2`

2. **Entity Definitions**

   - PHẢI dùng `type: 'smallint'` cho status/type columns
   - PHẢI thêm comment mô tả values (e.g., '1=Cash, 2=Bank')
   - ❌ KHÔNG dùng `type: 'enum'` hoặc `type: 'varchar'`

3. **DTO Validation**

   - PHẢI dùng `@IsInt()`, `@Min()`, `@Max()` cho enum fields
   - PHẢI dùng `@Type(() => Number)` để transform
   - ❌ KHÔNG dùng `@IsEnum()` hoặc `@IsString()`

4. **API Response Format**

   ```typescript
   {
     "success": true,
     "data": { ... },
     "message": "Success"
   }
   ```

5. **Module Structure**
   ```
   modules/[feature]/
   ├── [feature].module.ts
   ├── [feature].controller.ts
   ├── [feature].service.ts
   ├── entities/[feature].entity.ts
   └── dto/
   ```

**Tech Stack:**

- NestJS 10+, TypeScript strict mode
- TypeORM + PostgreSQL 15+
- Redis caching, JWT authentication
- Class-validator, Swagger docs

---

## Frontend Development Rules

**Khi được yêu cầu code/fix Frontend, PHẢI tuân thủ:**

📄 **Tham khảo:** `docs/frontend-instrucstion.md` cho đầy đủ quy tắc

### Critical Frontend Rules:

1. **ENUM Constants (QUAN TRỌNG)**

   - PHẢI dùng INTEGER enums giống Backend trong `src/constants/enums.ts`
   - PHẢI tạo label mappings trong `src/constants/enum-labels.ts`
   - ❌ KHÔNG dùng string enums
   - ✅ Ví dụ: `AccountType.CASH = 1` + `AccountTypeLabels[1] = 'Tiền mặt'`

2. **TypeScript Naming Conventions (BẮT BUỘC)**

   - **Interfaces:** Prefix `I` + PascalCase

     - ✅ `IUser`, `ITransaction`, `IButtonProps`
     - ❌ `User`, `Transaction`, `ButtonProps`

   - **Type Aliases:** Prefix `T` + PascalCase

     - ✅ `TTransactionType`, `TPaginatedResponse<T>`
     - ❌ `TransactionType`, `PaginatedResponse<T>`

   - **Enums:** PascalCase (no prefix)
     - ✅ `AccountType`, `TransactionType`

3. **Project Structure (Atomic Design)**

   ```
   src/
   ├── components/
   │   ├── atoms/
   │   ├── molecules/
   │   ├── organisms/
   │   └── templates/
   ├── pages/
   ├── redux/modules/[feature]/
   │   ├── [feature]Slice.ts
   │   ├── [feature]Saga.ts
   │   └── [feature]Types.ts
   ├── services/api/
   ├── types/models/
   └── utils/
   ```

4. **Path Aliases**

   - `@hooks/*`, `@redux/*`, `@utils/*`, `@services/*`, `@types/*`
   - PHẢI dùng aliases thay vì relative paths

5. **API Integration**

   - PHẢI dùng centralized axios instance từ `services/api.ts`
   - PHẢI dùng constants từ `utils/constants.ts`
   - Response interceptor tự extract `response.data.data`

6. **Redux Pattern**
   - Redux Toolkit + Redux-Saga
   - PHẢI export saga as default, actions/reducer as named exports

**Tech Stack:**

- React 18, TypeScript strict mode, Vite
- Ant Design v5, styled-components
- Redux Toolkit + Redux-Saga, Axios

---

## Common Rules (Backend + Frontend)

1. **Type Safety**

   - ❌ KHÔNG dùng `any` type
   - ✅ Dùng strict TypeScript mode
   - ✅ Validate tất cả inputs

2. **Error Handling**

   - PHẢI handle errors với try/catch
   - PHẢI show user-friendly messages
   - PHẢI log errors properly

3. **Performance**

   - Backend: Dùng Redis caching, pagination
   - Frontend: useMemo/useCallback, lazy loading

4. **Security**
   - PHẢI validate/sanitize inputs
   - PHẢI hash passwords (bcrypt)
   - PHẢI implement rate limiting
   - PHẢI use JWT properly

---

## Workflow Instructions

### Khi nhận yêu cầu "code FE" hoặc "frontend":

1. Đọc `docs/frontend-instrucstion.md` nếu cần chi tiết
2. Apply Frontend rules ở trên
3. Kiểm tra type naming (I/T prefix)
4. Kiểm tra enum usage (integer values)
5. Verify path aliases được dùng đúng

### Khi nhận yêu cầu "code BE" hoặc "backend":

1. Đọc `docs/backend-instrucstion.md` nếu cần chi tiết
2. Apply Backend rules ở trên
3. Kiểm tra enum definitions (integer values)
4. Kiểm tra entity column types (smallint cho enums)
5. Verify API response format

### Khi làm full-stack feature:

1. Code Backend trước (API + DB)
2. Test API với Swagger
3. Code Frontend (connect API)
4. Verify enum consistency giữa FE/BE

---

## Quick Reference

### Backend Enum Example:

```typescript
// src/common/constants/enums.ts
export enum AccountType {
  CASH = 1,
  BANK = 2,
  CREDIT_CARD = 3,
}

// Entity
@Column({ type: 'smallint', comment: '1=Cash, 2=Bank, 3=Credit Card' })
type: number;

// DTO
@ApiProperty({ enum: [1, 2, 3], example: 2 })
@IsInt()
@Min(1)
@Max(3)
@Type(() => Number)
type: number;
```

### Frontend Enum Example:

```typescript
// src/constants/enums.ts
export enum AccountType {
  CASH = 1,
  BANK = 2,
  CREDIT_CARD = 3,
}

// src/constants/enum-labels.ts
export const AccountTypeLabels: Record<AccountType, string> = {
  [AccountType.CASH]: 'Tiền mặt',
  [AccountType.BANK]: 'Ngân hàng',
  [AccountType.CREDIT_CARD]: 'Thẻ tín dụng',
};

// Usage
const account: IAccount = { type: AccountType.BANK }; // type = 2
const label = AccountTypeLabels[account.type]; // 'Ngân hàng'
```

### Frontend Type Naming:

```typescript
// ✅ CORRECT
interface IUser {
  id: string;
  email: string;
}
interface IButtonProps {
  label: string;
  onClick: () => void;
}
type TTransactionType = 'income' | 'expense';
type TPaginatedResponse<T> = { items: T[]; total: number };
enum AccountType {
  CASH = 1,
  BANK = 2,
}

// ❌ INCORRECT
interface User {} // Missing I prefix
interface ButtonProps {} // Missing I prefix
type TransactionType = 'income' | 'expense'; // Missing T prefix
type PaginatedResponse<T> = {}; // Missing T prefix
```

---

## Files to Reference

- **Backend:** `docs/backend-instrucstion.md` (full rules)
- **Frontend:** `docs/frontend-instrucstion.md` (full rules)
- **API Spec:** `docs/DD/03-API-SPECIFICATION.md`
- **Database:** `docs/DD/02-DATABASE-DESIGN.md`
- **Requirements:** `docs/REQUIREMENTS.md`
- **Project Status:** `PROJECT_STATUS.md`

---

**Lưu ý:** Khi có conflict giữa instructions và code hiện tại, ưu tiên sửa code để follow instructions (trừ khi có lý do kỹ thuật rõ ràng).
