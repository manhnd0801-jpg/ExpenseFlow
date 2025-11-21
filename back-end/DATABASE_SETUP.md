# 🚀 Hướng dẫn Setup Database cho ExpenseFlow

## Có 2 cách để tạo database:

---

## 🎯 CÁCH 1: Sử dụng TypeORM Auto-sync (KHUYẾN NGHỊ cho Development)

### Bước 1: Tạo database trong pgAdmin

1. Mở **pgAdmin**
2. Right-click **Databases** → **Create** → **Database**
3. Điền thông tin:
   - **Database name**: `expense_management`
   - **Owner**: `postgres`
   - **Encoding**: `UTF8`
4. Click **Save**

### Bước 2: Cấu hình môi trường

```bash
cd back-end
```

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Sửa file `.env` với thông tin database của bạn:

```env
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=YOUR_PASSWORD_HERE  # Đổi mật khẩu của bạn
DB_DATABASE=expense_management

# JWT (có thể giữ nguyên cho dev)
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=dev-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# Redis (nếu có)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Bước 3: Install dependencies

```bash
npm install
```

### Bước 4: Chạy ứng dụng

```bash
npm run start:dev
```

✅ **TypeORM sẽ tự động tạo toàn bộ tables và schema khi bạn chạy lần đầu!**

---

## 🛠️ CÁCH 2: Chạy SQL Script thủ công

Nếu bạn muốn tạo schema thủ công hoặc không muốn dùng auto-sync:

### Bước 1: Chạy SQL script trong pgAdmin

1. Mở **pgAdmin**
2. Connect đến PostgreSQL server
3. Right-click **Databases** → Chọn **Query Tool**
4. Copy toàn bộ nội dung file `database-setup.sql`
5. Paste vào Query Tool
6. Click **Execute/Run** (F5)

### Bước 2: Tắt auto-sync trong development

Sửa file `src/config/database.config.ts`:

```typescript
// Đổi dòng này:
synchronize: process.env.NODE_ENV === 'development',

// Thành:
synchronize: false,
```

### Bước 3: Chạy ứng dụng

```bash
npm run start:dev
```

---

## 📊 Kiểm tra Database đã tạo thành công

Sau khi chạy (bằng cách 1 hoặc 2), kiểm tra trong pgAdmin:

1. Expand **expense_management** database
2. Expand **Schemas** → **public** → **Tables**
3. Bạn sẽ thấy các tables:
   - ✅ users
   - ✅ accounts
   - ✅ categories (có 13 default categories)
   - ✅ transactions
   - ✅ budgets
   - ✅ goals
   - ✅ debts
   - ✅ debt_payments
   - ✅ events
   - ✅ reminders

---

## 🧪 Test API

### 1. Truy cập Swagger Documentation

Mở browser: http://localhost:3001/api/docs

### 2. Test Register

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 3. Test Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

Bạn sẽ nhận được `accessToken`, dùng token này cho các API khác.

---

## 🔍 Troubleshooting

### Lỗi: "database does not exist"

- Tạo lại database trong pgAdmin với tên `expense_management`

### Lỗi: "password authentication failed"

- Kiểm tra lại mật khẩu postgres trong file `.env`
- Hoặc đổi `DB_PASSWORD` thành mật khẩu bạn đã set cho PostgreSQL

### Lỗi: "port 5432 already in use" hoặc không connect được

- Kiểm tra PostgreSQL đang chạy:
  - Windows: Check Services → PostgreSQL
  - Mac: `brew services list`
- Kiểm tra port trong file `.env` khớp với PostgreSQL port

### Lỗi: Cannot find module

```bash
# Xóa node_modules và install lại
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Ghi chú

- **Development**: Nên dùng CÁCH 1 (auto-sync) cho tiện
- **Production**: NÊN dùng migrations thay vì auto-sync
- Default categories sẽ được tạo tự động khi user đăng ký (nếu dùng CÁCH 1)
- Hoặc đã có sẵn từ SQL script (nếu dùng CÁCH 2)

---

## ⚡ Quick Start (TL;DR)

```bash
# 1. Tạo database "expense_management" trong pgAdmin
# 2. Copy .env
cp .env.example .env

# 3. Sửa DB_PASSWORD trong .env

# 4. Install & Run
npm install
npm run start:dev

# 5. Test
# Open: http://localhost:3001/api/docs
```

Done! 🎉
