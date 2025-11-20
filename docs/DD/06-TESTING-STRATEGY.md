# Testing Strategy - Chiến Lược Kiểm Thử

**⚠️ LƯU Ý VỀ TEST DATA:**

Khi viết tests, tất cả mock data PHẢI sử dụng **INTEGER values** cho type/status fields:

```typescript
// ✅ ĐÚNG - Test với integer enum
const mockTransaction = {
  type: 2, // 2 = Expense
  status: 1, // 1 = Active/Pending
  amount: 50000,
};

// ❌ SAI - Test với string
const mockTransaction = {
  type: 'expense', // SAI!
  status: 'active', // SAI!
  amount: 50000,
};
```

Xem `02-DATABASE-DESIGN.md` Section 2 để biết đầy đủ enum mapping.

---

## 1. Testing Pyramid

```
                    /\
                   /  \
                  / E2E \
                 /______\
                /        \
               /Integration\
              /____________\
             /              \
            /  Unit Tests    \
           /________________\
```

### Phân bổ Test Coverage

- **Unit Tests**: 70% (Business logic, utilities, helpers)
- **Integration Tests**: 20% (API endpoints, Database)
- **E2E Tests**: 10% (Critical user flows)

---

## 2. Unit Testing

### 2.1. Frontend Unit Tests (Jest + React Testing Library)

#### Test Components

```typescript
// TransactionCard.test.tsx
import { render, screen } from '@testing-library/react';
import TransactionCard from './TransactionCard';

describe('TransactionCard', () => {
  const mockTransaction = {
    id: '1',
    amount: 50000,
    type: 2, // 2 = Expense (use numeric enum, not string)
    category: { name: 'Ăn uống', icon: 'utensils' },
    note: 'Ăn trưa',
    date: '2025-01-15',
  };

  it('should render transaction correctly', () => {
    render(<TransactionCard transaction={mockTransaction} />);

    expect(screen.getByText('Ăn uống')).toBeInTheDocument();
    expect(screen.getByText('50,000 đ')).toBeInTheDocument();
    expect(screen.getByText('Ăn trưa')).toBeInTheDocument();
  });

  it('should show expense in red color', () => {
    render(<TransactionCard transaction={mockTransaction} />);

    const amount = screen.getByText('50,000 đ');
    expect(amount).toHaveClass('text-error');
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<TransactionCard transaction={mockTransaction} onClick={handleClick} />);

    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledWith(mockTransaction);
  });
});
```

#### Test Redux Reducers

```typescript
// transactionSlice.test.ts
import transactionReducer, { addTransaction } from './transactionSlice';

describe('transactionSlice', () => {
  it('should add transaction', () => {
    const initialState = { transactions: [] };
    const transaction = { id: '1', amount: 50000 };

    const newState = transactionReducer(initialState, addTransaction(transaction));

    expect(newState.transactions).toHaveLength(1);
    expect(newState.transactions[0]).toEqual(transaction);
  });
});
```

#### Test Redux Sagas

```typescript
// transactionSaga.test.ts
import { expectSaga } from 'redux-saga-test-plan';
import { createTransactionSaga } from './transactionSaga';
import { createTransaction } from './transactionSlice';
import * as api from '@/services/transactionService';

describe('transactionSaga', () => {
  it('should create transaction successfully', () => {
    const transaction = { amount: 50000 };
    const response = { id: '1', ...transaction };

    return expectSaga(createTransactionSaga, createTransaction(transaction))
      .provide([[call(api.createTransaction, transaction), response]])
      .put(createTransactionSuccess(response))
      .run();
  });

  it('should handle create transaction error', () => {
    const error = new Error('Network error');

    return expectSaga(createTransactionSaga, createTransaction({}))
      .provide([[call(api.createTransaction, {}), throwError(error)]])
      .put(createTransactionFailure(error.message))
      .run();
  });
});
```

#### Test Utilities

```typescript
// formatCurrency.test.ts
import { formatCurrency } from '@/utils/formatters';

describe('formatCurrency', () => {
  it('should format VND correctly', () => {
    expect(formatCurrency(1000000, 'VND')).toBe('1,000,000 đ');
  });

  it('should format USD correctly', () => {
    expect(formatCurrency(1000, 'USD')).toBe('$1,000.00');
  });

  it('should handle negative numbers', () => {
    expect(formatCurrency(-50000, 'VND')).toBe('-50,000 đ');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0, 'VND')).toBe('0 đ');
  });
});
```

### 2.2. Backend Unit Tests (Jest + NestJS)

#### Test Services

```typescript
// transaction.service.spec.ts
import { Test } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { TransactionRepository } from './transaction.repository';

describe('TransactionService', () => {
  let service: TransactionService;
  let repository: TransactionRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: TransactionRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    repository = module.get<TransactionRepository>(TransactionRepository);
  });

  describe('createTransaction', () => {
    it('should create expense transaction', async () => {
      const dto = {
        amount: 50000,
        type: 2, // 2 = Expense
        accountId: 'acc-1',
        categoryId: 'cat-1',
      };

      const expected = { id: 'trans-1', ...dto };
      jest.spyOn(repository, 'create').mockResolvedValue(expected);

      const result = await service.createTransaction('user-1', dto);

      expect(result).toEqual(expected);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', ...dto })
      );
    });

    it('should throw error if account not found', async () => {
      const dto = { accountId: 'invalid' };

      await expect(service.createTransaction('user-1', dto)).rejects.toThrow('Account not found');
    });

    it('should throw error if insufficient balance', async () => {
      const dto = {
        amount: 1000000,
        type: 2, // 2 = Expense
        accountId: 'acc-1',
      };

      // Mock account with low balance
      jest.spyOn(service, 'getAccount').mockResolvedValue({
        id: 'acc-1',
        balance: 50000,
      });

      await expect(service.createTransaction('user-1', dto)).rejects.toThrow(
        'Insufficient balance'
      );
    });
  });

  describe('updateAccountBalance', () => {
    it('should decrease balance for expense', async () => {
      const transaction = {
        type: 2, // 2 = Expense
        amount: 50000,
        accountId: 'acc-1',
      };

      await service.updateAccountBalance(transaction);

      expect(accountService.updateBalance).toHaveBeenCalledWith('acc-1', -50000);
    });

    it('should increase balance for income', async () => {
      const transaction = {
        type: 1, // 1 = Income
        amount: 100000,
        accountId: 'acc-1',
      };

      await service.updateAccountBalance(transaction);

      expect(accountService.updateBalance).toHaveBeenCalledWith('acc-1', 100000);
    });
  });
});
```

#### Test Controllers

```typescript
// transaction.controller.spec.ts
import { Test } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

describe('TransactionController', () => {
  let controller: TransactionController;
  let service: TransactionService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    service = module.get<TransactionService>(TransactionService);
  });

  it('should create transaction', async () => {
    const dto = { amount: 50000 };
    const user = { id: 'user-1' };
    const expected = { id: 'trans-1', ...dto };

    jest.spyOn(service, 'create').mockResolvedValue(expected);

    const result = await controller.create(user, dto);

    expect(result).toEqual({
      success: true,
      data: expected,
    });
  });
});
```

#### Test Validators

```typescript
// create-transaction.dto.spec.ts
import { validate } from 'class-validator';
import { CreateTransactionDto } from './create-transaction.dto';

describe('CreateTransactionDto', () => {
  it('should validate correct data', async () => {
    const dto = new CreateTransactionDto();
    dto.amount = 50000;
    dto.type = 2; // 2 = Expense
    dto.accountId = 'acc-1';
    dto.categoryId = 'cat-1';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail if amount is negative', async () => {
    const dto = new CreateTransactionDto();
    dto.amount = -50000;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('amount');
  });

  it('should fail if type is invalid', async () => {
    const dto = new CreateTransactionDto();
    dto.type = 'invalid' as any;

    const errors = await validate(dto);
    expect(errors[0].constraints).toHaveProperty('isIn');
  });
});
```

---

## 3. Integration Testing

### 3.1. API Integration Tests

```typescript
// transaction.e2e.spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Transaction API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    authToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /transactions', () => {
    it('should create transaction successfully', () => {
      return request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 50000,
          type: 2, // 2 = Expense
          accountId: 'acc-1',
          categoryId: 'cat-1',
          transactionDate: '2025-01-15',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.amount).toBe(50000);
        });
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer()).post('/transactions').send({ amount: 50000 }).expect(401);
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: -50000 }) // Negative amount
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('INVALID_INPUT');
        });
    });
  });

  describe('GET /transactions', () => {
    it('should get transactions with pagination', () => {
      return request(app.getHttpServer())
        .get('/transactions?page=1&limit=20')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.pagination).toHaveProperty('page');
          expect(res.body.pagination).toHaveProperty('total');
        });
    });

    it('should filter by type', () => {
      return request(app.getHttpServer())
        .get('/transactions?type=2') // 2 = Expense
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          const transactions = res.body.data;
          expect(transactions.every((t) => t.type === 2)).toBe(true); // 2 = Expense
        });
    });
  });
});
```

### 3.2. Database Integration Tests

```typescript
// transaction.repository.spec.ts
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionRepository } from './transaction.repository';
import { Transaction } from './transaction.entity';

describe('TransactionRepository (Integration)', () => {
  let repository: TransactionRepository;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'test',
          password: 'test',
          database: 'test_db',
          entities: [Transaction],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Transaction]),
      ],
      providers: [TransactionRepository],
    }).compile();

    repository = module.get<TransactionRepository>(TransactionRepository);
  });

  afterEach(async () => {
    await repository.delete({});
  });

  it('should create and retrieve transaction', async () => {
    const transaction = {
      userId: 'user-1',
      amount: 50000,
      type: 2, // 2 = Expense
      accountId: 'acc-1',
      categoryId: 'cat-1',
    };

    const created = await repository.create(transaction);
    expect(created.id).toBeDefined();

    const found = await repository.findById(created.id);
    expect(found).toEqual(expect.objectContaining(transaction));
  });

  it('should update transaction', async () => {
    const transaction = await repository.create({
      userId: 'user-1',
      amount: 50000,
    });

    await repository.update(transaction.id, { amount: 60000 });

    const updated = await repository.findById(transaction.id);
    expect(updated.amount).toBe(60000);
  });

  it('should delete transaction', async () => {
    const transaction = await repository.create({
      userId: 'user-1',
      amount: 50000,
    });

    await repository.delete(transaction.id);

    const found = await repository.findById(transaction.id);
    expect(found).toBeNull();
  });
});
```

---

## 4. End-to-End (E2E) Testing

### 4.1. Critical User Flows (Cypress/Playwright)

```typescript
// cypress/e2e/transaction-flow.cy.ts
describe('Transaction Management Flow', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password');
    cy.visit('/dashboard');
  });

  it('should complete full transaction lifecycle', () => {
    // Create transaction
    cy.contains('Thêm giao dịch').click();
    cy.get('[data-testid="amount-input"]').type('50000');
    cy.get('[data-testid="category-select"]').click();
    cy.contains('Ăn uống').click();
    cy.get('[data-testid="note-input"]').type('Ăn trưa');
    cy.contains('Lưu').click();

    // Verify toast
    cy.contains('Thêm giao dịch thành công').should('be.visible');

    // Verify in list
    cy.visit('/transactions');
    cy.contains('Ăn trưa').should('be.visible');
    cy.contains('50,000 đ').should('be.visible');

    // Edit transaction
    cy.contains('Ăn trưa').click();
    cy.contains('Sửa').click();
    cy.get('[data-testid="amount-input"]').clear().type('60000');
    cy.contains('Lưu').click();

    // Verify updated
    cy.contains('60,000 đ').should('be.visible');

    // Delete transaction
    cy.contains('Xóa').click();
    cy.contains('Xác nhận').click();
    cy.contains('Đã xóa giao dịch').should('be.visible');
  });

  it('should show validation errors', () => {
    cy.contains('Thêm giao dịch').click();
    cy.contains('Lưu').click(); // Submit without filling

    cy.contains('Vui lòng nhập số tiền').should('be.visible');
    cy.contains('Vui lòng chọn danh mục').should('be.visible');
  });

  it('should warn about insufficient balance', () => {
    cy.get('[data-testid="account-balance"]').then(($el) => {
      const balance = parseInt($el.text().replace(/[^\d]/g, ''));
      const amount = balance + 10000; // More than balance

      cy.contains('Thêm giao dịch').click();
      cy.get('[data-testid="amount-input"]').type(amount);
      cy.get('[data-testid="type-expense"]').click();
      cy.contains('Lưu').click();

      cy.contains('Không đủ số dư').should('be.visible');
    });
  });
});
```

```typescript
// cypress/e2e/budget-flow.cy.ts
describe('Budget Management Flow', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password');
  });

  it('should create budget and receive warning', () => {
    // Create budget
    cy.visit('/budgets');
    cy.contains('Thêm ngân sách').click();
    cy.get('[data-testid="budget-name"]').type('Ngân sách ăn uống');
    cy.get('[data-testid="category-select"]').click();
    cy.contains('Ăn uống').click();
    cy.get('[data-testid="amount-input"]').type('1000000');
    cy.contains('Lưu').click();

    // Add transactions to reach 85%
    cy.visit('/transactions');
    for (let i = 0; i < 5; i++) {
      cy.contains('Thêm giao dịch').click();
      cy.get('[data-testid="amount-input"]').type('170000');
      cy.get('[data-testid="category-select"]').click();
      cy.contains('Ăn uống').click();
      cy.contains('Lưu').click();
      cy.wait(500);
    }

    // Check for budget warning
    cy.get('[data-testid="notifications"]').click();
    cy.contains('Cảnh báo: Đã dùng 85% ngân sách').should('be.visible');

    // Verify budget progress
    cy.visit('/budgets');
    cy.contains('Ngân sách ăn uống')
      .parent()
      .within(() => {
        cy.contains('85%').should('be.visible');
        cy.get('[data-testid="progress-bar"]').should('have.class', 'warning');
      });
  });
});
```

---

## 5. Performance Testing

### 5.1. Load Testing (k6)

```javascript
// loadtest/transaction-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% < 2s
    http_req_failed: ['rate<0.01'], // Error rate < 1%
  },
};

const BASE_URL = 'http://localhost:3000/api';
let authToken;

export function setup() {
  // Login once
  const loginRes = http.post(`${BASE_URL}/auth/login`, {
    email: 'test@example.com',
    password: 'password',
  });

  return { token: JSON.parse(loginRes.body).data.accessToken };
}

export default function (data) {
  const headers = {
    Authorization: `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  // Get transactions
  let res = http.get(`${BASE_URL}/transactions?page=1&limit=20`, {
    headers,
  });
  check(res, {
    'get transactions status 200': (r) => r.status === 200,
    'get transactions duration < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(1);

  // Create transaction
  res = http.post(
    `${BASE_URL}/transactions`,
    JSON.stringify({
      amount: Math.floor(Math.random() * 100000),
      type: 2, // 2 = Expense
      accountId: 'acc-1',
      categoryId: 'cat-1',
    }),
    { headers }
  );
  check(res, {
    'create transaction status 201': (r) => r.status === 201,
  });

  sleep(1);
}
```

### 5.2. Stress Testing

```javascript
// Gradually increase load to find breaking point
export const options = {
  stages: [
    { duration: '5m', target: 200 },
    { duration: '5m', target: 400 },
    { duration: '5m', target: 600 },
    { duration: '5m', target: 800 },
    { duration: '5m', target: 1000 },
    { duration: '10m', target: 0 },
  ],
};
```

---

## 6. Security Testing

### 6.1. Authentication Tests

```typescript
describe('Security - Authentication', () => {
  it('should reject requests without token', () => {
    return request(app.getHttpServer()).get('/transactions').expect(401);
  });

  it('should reject expired token', () => {
    const expiredToken = generateExpiredToken();

    return request(app.getHttpServer())
      .get('/transactions')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });

  it('should reject tampered token', () => {
    const tamperedToken = validToken + 'tampered';

    return request(app.getHttpServer())
      .get('/transactions')
      .set('Authorization', `Bearer ${tamperedToken}`)
      .expect(401);
  });
});
```

### 6.2. SQL Injection Tests

```typescript
describe('Security - SQL Injection', () => {
  it('should prevent SQL injection in search', () => {
    const maliciousInput = "'; DROP TABLE users; --";

    return request(app.getHttpServer())
      .get(`/transactions?search=${encodeURIComponent(maliciousInput)}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200) // Should not crash
      .expect((res) => {
        expect(res.body.data).toEqual([]); // No results, but no error
      });
  });
});
```

### 6.3. XSS Tests

```typescript
describe('Security - XSS', () => {
  it('should sanitize note input', () => {
    const xssInput = '<script>alert("XSS")</script>';

    return request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ note: xssInput, amount: 50000 })
      .expect(201)
      .expect((res) => {
        expect(res.body.data.note).not.toContain('<script>');
      });
  });
});
```

---

## 7. Test Coverage Goals

```
├── Overall Coverage: ≥ 80%
├── Backend
│   ├── Services: ≥ 90%
│   ├── Controllers: ≥ 80%
│   ├── Utilities: ≥ 95%
│   └── Database: ≥ 85%
├── Frontend
│   ├── Components: ≥ 80%
│   ├── Redux: ≥ 90%
│   ├── Utils: ≥ 95%
│   └── Hooks: ≥ 85%
```

### Generate Coverage Report

```bash
# Backend
npm run test:cov

# Frontend
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

---

## 8. CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_DB: test_db
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432

      redis:
        image: redis:7
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

**Lưu ý**: Testing là một phần quan trọng, cần chạy automated tests trong CI/CD pipeline trước khi merge code.
