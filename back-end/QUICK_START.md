# 🚀 Quick Start Guide - ExpenseFlow Backend

## Bước 1: Setup Database (PostgreSQL)

Database `expense_management` với 10 tables đã được tạo sẵn.

Nếu cần tạo lại:

```sql
-- Trong pgAdmin hoặc psql
CREATE DATABASE expense_management;
```

Chạy init script:

```bash
psql -U postgres -d expense_management -f init-database.sql
```

## Bước 2: Cài đặt Dependencies

```bash
cd back-end
npm install
```

## Bước 3: Cấu hình Environment

Tạo file `.env`:

```env
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=expense_management

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# Redis (optional for development)
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Bước 4: Chạy Application

```bash
# Development mode với hot reload
npm run start:dev

# hoặc Production mode
npm run build
npm run start:prod
```

## Bước 5: Kiểm tra

### Health Check

```bash
curl http://localhost:3001/health
# Expected: {"success":true,"status":"healthy",...}

curl http://localhost:3001/health/db
# Expected: {"success":true,"status":"healthy","database":"connected",...}
```

### Swagger Documentation

Mở browser: http://localhost:3001/api/docs

### Test API Endpoint

```bash
# Đăng ký user mới
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 📚 Available Endpoints

### Core

- `POST /auth/register` - Đăng ký
- `POST /auth/login` - Đăng nhập
- `GET /users/profile` - Thông tin user (cần JWT)

### Accounts

- `GET /accounts` - Danh sách tài khoản
- `POST /accounts` - Tạo tài khoản mới
- `GET /accounts/:id` - Chi tiết tài khoản
- `PATCH /accounts/:id` - Cập nhật
- `DELETE /accounts/:id` - Xóa

### Transactions

- `GET /transactions` - Danh sách giao dịch
- `POST /transactions` - Tạo giao dịch
- `GET /transactions/:id` - Chi tiết
- `PATCH /transactions/:id` - Cập nhật
- `DELETE /transactions/:id` - Xóa

### Categories

- `GET /categories` - Danh sách danh mục
- `POST /categories` - Tạo danh mục
- `GET /categories/:id` - Chi tiết
- `PATCH /categories/:id` - Cập nhật
- `DELETE /categories/:id` - Xóa

### Budgets

- `GET /budgets` - Danh sách ngân sách
- `POST /budgets` - Tạo ngân sách
- `GET /budgets/:id` - Chi tiết
- `PATCH /budgets/:id` - Cập nhật
- `DELETE /budgets/:id` - Xóa

### Goals

- `GET /goals` - Danh sách mục tiêu
- `POST /goals` - Tạo mục tiêu
- `GET /goals/:id` - Chi tiết
- `PATCH /goals/:id` - Cập nhật
- `DELETE /goals/:id` - Xóa

### Debts

- `GET /debts` - Danh sách công nợ
- `POST /debts` - Tạo công nợ
- `GET /debts/:id` - Chi tiết
- `PATCH /debts/:id` - Cập nhật
- `DELETE /debts/:id` - Xóa

### Events

- `GET /events` - Danh sách sự kiện
- `POST /events` - Tạo sự kiện
- `GET /events/:id` - Chi tiết
- `PATCH /events/:id` - Cập nhật
- `DELETE /events/:id` - Xóa

### Reminders ✨ NEW

- `GET /reminders` - Tất cả nhắc nhở
- `GET /reminders/upcoming` - Nhắc nhở sắp tới
- `POST /reminders` - Tạo nhắc nhở
- `PATCH /reminders/:id/complete` - Đánh dấu hoàn thành

### Reports ✨ NEW

- `GET /reports/income-expense` - Báo cáo thu chi
- `GET /reports/category-distribution` - Phân bổ danh mục
- `GET /reports/monthly-trend?year=2024` - Xu hướng tháng
- `GET /reports/cash-flow` - Dòng tiền
- `GET /reports/top-spending` - Top chi tiêu
- `GET /reports/financial-summary` - Tổng quan

### Notifications ✨ NEW

- `GET /notifications` - Tất cả thông báo
- `GET /notifications/unread` - Chưa đọc
- `GET /notifications/unread/count` - Số lượng chưa đọc
- `PATCH /notifications/:id/read` - Đánh dấu đã đọc

## 🔐 Authentication

Tất cả endpoints (trừ auth) yêu cầu JWT token:

```bash
# Thêm header Authorization
Authorization: Bearer <your_jwt_token>
```

Example với curl:

```bash
TOKEN="your_jwt_token_here"

curl -X GET http://localhost:3001/accounts \
  -H "Authorization: Bearer $TOKEN"
```

## 📊 Example: Tạo Transaction

```bash
# 1. Login để lấy token
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.data.accessToken')

# 2. Tạo account
ACCOUNT_ID=$(curl -s -X POST http://localhost:3001/accounts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ví tiền mặt",
    "type": 1,
    "balance": 1000000,
    "currency": 1
  }' | jq -r '.data.id')

# 3. Tạo category
CATEGORY_ID=$(curl -s -X POST http://localhost:3001/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ăn uống",
    "type": 2,
    "icon": "restaurant",
    "color": "#FF6B6B"
  }' | jq -r '.data.id')

# 4. Tạo transaction
curl -X POST http://localhost:3001/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"accountId\": \"$ACCOUNT_ID\",
    \"categoryId\": \"$CATEGORY_ID\",
    \"type\": 2,
    \"amount\": 50000,
    \"date\": \"2024-01-15\",
    \"description\": \"Ăn trưa\"
  }"
```

## 🐛 Troubleshooting

### Lỗi kết nối database

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Giải pháp**: Kiểm tra PostgreSQL đã chạy chưa

```bash
# macOS
brew services start postgresql

# Hoặc kiểm tra status
psql -U postgres -c "SELECT 1"
```

### Lỗi Redis (nếu dùng)

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Giải pháp**: Redis là optional, có thể comment phần Redis trong app.module.ts hoặc khởi động Redis:

```bash
# macOS
brew services start redis
```

### Port 3001 đã được sử dụng

```
Error: listen EADDRINUSE: address already in use :::3001
```

**Giải pháp**: Đổi PORT trong .env hoặc kill process:

```bash
# Tìm process
lsof -ti:3001

# Kill process
kill -9 $(lsof -ti:3001)
```

## ✅ Verify Setup

Chạy tất cả checks:

```bash
# 1. Health check
curl http://localhost:3001/health

# 2. Database check
curl http://localhost:3001/health/db

# 3. Swagger docs
open http://localhost:3001/api/docs
```

## 📝 Notes

- **Integer Enums**: Tất cả type/status sử dụng số (1, 2, 3) không phải string
- **JWT Required**: Hầu hết endpoints cần authentication
- **Soft Delete**: Dữ liệu xóa chỉ set `deletedAt`, không xóa hẳn
- **Pagination**: Có thể thêm `?page=1&limit=20` cho các list endpoints

---

**Happy Coding! 🚀**
