#!/bin/bash

# ExpenseFlow - Quick Seed Script
# Tạo sample data để test frontend

echo "🌱 Starting seed process..."

# Configuration
API_BASE="http://localhost:3001/api/v1"
EMAIL="demo@expenseflow.com"
PASSWORD="Demo123456"
FULL_NAME="Demo User"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Register user
echo -e "${YELLOW}📝 Step 1: Registering user...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"fullName\": \"$FULL_NAME\"
  }")

# Check if success
if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ User registered successfully${NC}"
  TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
elif echo "$REGISTER_RESPONSE" | grep -q 'already exists'; then
  echo -e "${YELLOW}⚠️  User already exists, trying login...${NC}"
  
  # Login instead
  LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$EMAIL\",
      \"password\": \"$PASSWORD\"
    }")
  
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  echo -e "${GREEN}✅ Logged in successfully${NC}"
else
  echo -e "${RED}❌ Failed to register/login${NC}"
  echo "$REGISTER_RESPONSE"
  exit 1
fi

echo "🔑 Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Create Categories
echo -e "${YELLOW}📂 Step 2: Creating categories...${NC}"

# Income categories
declare -a INCOME_CATEGORIES=(
  "Lương:dollar:#52c41a"
  "Thưởng:gift:#faad14"
  "Đầu tư:line-chart:#13c2c2"
  "Thu nhập phụ:wallet:#722ed1"
)

# Expense categories
declare -a EXPENSE_CATEGORIES=(
  "Ăn uống:coffee:#ff4d4f"
  "Di chuyển:car:#1890ff"
  "Mua sắm:shopping-cart:#fa8c16"
  "Giải trí:smile:#eb2f96"
  "Hóa đơn:file-text:#2f54eb"
  "Sức khỏe:heart:#f5222d"
  "Giáo dục:book:#52c41a"
  "Nhà cửa:home:#722ed1"
)

INCOME_CAT_IDS=()
EXPENSE_CAT_IDS=()

for cat_data in "${INCOME_CATEGORIES[@]}"; do
  IFS=':' read -r name icon color <<< "$cat_data"
  
  RESPONSE=$(curl -s -X POST "$API_BASE/categories" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"name\": \"$name\",
      \"type\": 1,
      \"icon\": \"$icon\",
      \"color\": \"$color\"
    }")
  
  CAT_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  INCOME_CAT_IDS+=("$CAT_ID")
  echo "  ✓ Created income category: $name (ID: ${CAT_ID:0:8}...)"
done

for cat_data in "${EXPENSE_CATEGORIES[@]}"; do
  IFS=':' read -r name icon color <<< "$cat_data"
  
  RESPONSE=$(curl -s -X POST "$API_BASE/categories" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"name\": \"$name\",
      \"type\": 2,
      \"icon\": \"$icon\",
      \"color\": \"$color\"
    }")
  
  CAT_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  EXPENSE_CAT_IDS+=("$CAT_ID")
  echo "  ✓ Created expense category: $name (ID: ${CAT_ID:0:8}...)"
done

echo ""

# Step 3: Create Accounts
echo -e "${YELLOW}💳 Step 3: Creating accounts...${NC}"

declare -a ACCOUNTS=(
  "Ví tiền mặt:1:5000000"
  "Techcombank:2:10000000"
  "Vietcombank:2:8000000"
  "Ví MoMo:4:2000000"
)

ACCOUNT_IDS=()

for acc_data in "${ACCOUNTS[@]}"; do
  IFS=':' read -r name type balance <<< "$acc_data"
  
  RESPONSE=$(curl -s -X POST "$API_BASE/accounts" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"name\": \"$name\",
      \"type\": $type,
      \"balance\": $balance,
      \"currency\": \"VND\"
    }")
  
  ACC_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  ACCOUNT_IDS+=("$ACC_ID")
  echo "  ✓ Created account: $name (Balance: $balance VND, ID: ${ACC_ID:0:8}...)"
done

echo ""

# Step 4: Create Transactions
echo -e "${YELLOW}💰 Step 4: Creating transactions...${NC}"

# Income transactions
declare -a INCOME_TXS=(
  "2025-11-01:15000000:Lương tháng 11:Lương tháng 11/2025"
  "2025-11-15:2000000:Thưởng KPI Q3:Thưởng quý 3"
)

for tx_data in "${INCOME_TXS[@]}"; do
  IFS=':' read -r date amount desc note <<< "$tx_data"
  
  # Random income category and account
  CAT_ID="${INCOME_CAT_IDS[0]}"
  ACC_ID="${ACCOUNT_IDS[1]}" # Techcombank
  
  curl -s -X POST "$API_BASE/transactions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"accountId\": \"$ACC_ID\",
      \"categoryId\": \"$CAT_ID\",
      \"type\": 1,
      \"amount\": $amount,
      \"description\": \"$desc\",
      \"transactionDate\": \"$date\",
      \"note\": \"$note\"
    }" > /dev/null
  
  echo "  ✓ Income: $desc (+$amount VND on $date)"
done

# Expense transactions
declare -a EXPENSE_TXS=(
  "2025-11-05:150000:Ăn trưa:Cơm văn phòng:0"
  "2025-11-05:50000:Café sáng:Highlands Coffee:0"
  "2025-11-06:200000:Xăng xe:Đổ xăng:1"
  "2025-11-07:500000:Mua quần áo:Uniqlo:2"
  "2025-11-08:300000:Xem phim:CGV Vincom:3"
  "2025-11-10:800000:Tiền điện:EVN HANOI:4"
  "2025-11-12:1500000:Khám răng:Nha khoa Kim:5"
  "2025-11-14:2000000:Học tiếng Anh:ILA Center:6"
  "2025-11-18:120000:Ăn sáng:Bánh mì + cà phê:0"
  "2025-11-20:180000:Ăn tối:Lẩu Thái:0"
)

for tx_data in "${EXPENSE_TXS[@]}"; do
  IFS=':' read -r date amount desc note cat_idx <<< "$tx_data"
  
  CAT_ID="${EXPENSE_CAT_IDS[$cat_idx]}"
  ACC_ID="${ACCOUNT_IDS[0]}" # Ví tiền mặt
  
  curl -s -X POST "$API_BASE/transactions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"accountId\": \"$ACC_ID\",
      \"categoryId\": \"$CAT_ID\",
      \"type\": 2,
      \"amount\": $amount,
      \"description\": \"$desc\",
      \"transactionDate\": \"$date\",
      \"note\": \"$note\"
    }" > /dev/null
  
  echo "  ✓ Expense: $desc (-$amount VND on $date)"
done

echo ""

# Step 5: Create Budget
echo -e "${YELLOW}📊 Step 5: Creating budgets...${NC}"

# Budget for Food category
FOOD_CAT_ID="${EXPENSE_CAT_IDS[0]}"
curl -s -X POST "$API_BASE/budgets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"categoryId\": \"$FOOD_CAT_ID\",
    \"amount\": 5000000,
    \"period\": 3,
    \"startDate\": \"2025-11-01\",
    \"endDate\": \"2025-11-30\"
  }" > /dev/null

echo "  ✓ Created budget: Ăn uống (5,000,000 VND/tháng)"

echo ""
echo -e "${GREEN}🎉 Seed completed successfully!${NC}"
echo ""
echo -e "${YELLOW}📌 Test Account:${NC}"
echo "  Email: $EMAIL"
echo "  Password: $PASSWORD"
echo ""
echo -e "${YELLOW}🔗 URLs:${NC}"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:3001/api/v1"
echo "  Swagger Docs: http://localhost:3001/docs"
echo ""
echo -e "${GREEN}✨ You can now login to the frontend!${NC}"
