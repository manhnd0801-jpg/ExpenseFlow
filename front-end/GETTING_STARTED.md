# 📚 Getting Started - Frontend Development

## Prerequisites

- **Node.js**: 16+ (Recommended: 18 LTS)
- **npm**: 8+ or **yarn**: 3+
- **Git**: For version control
- **VS Code**: With recommended extensions

## 🔧 Installation & Setup

### 1. Install Dependencies

```bash
cd /Users/nguyenducmanh/Documents/Work/expense-flow/frontend
npm install
```

This will install:

- React 18 + React DOM
- TypeScript 5
- Vite 5
- Ant Design 5
- Styled Components 6
- Redux Toolkit + Redux-Saga
- Axios
- React Router
- Dayjs + Lodash

### 2. Verify Installation

```bash
# Check if build works
npm run build

# Should output:
# ✓ built in Xs
# dist/index.html                  0.50 kB
# dist/assets/index-xxx.js         xxx kB
```

### 3. Start Development Server

```bash
npm run dev

# Should output:
#   VITE v5.0.0  ready in XXX ms
#
#   ➜  Local:   http://localhost:3000/
#   ➜  press h to show help
```

Open http://localhost:3000 in your browser.

## 📦 VS Code Extensions (Recommended)

```json
{
  "recommendations": [
    "ES7+React/Redux/React-Native snippets",
    "Prettier - Code formatter",
    "ESLint",
    "TypeScript Vue Plugin (Volar)",
    "Styled Components",
    "Redux DevTools"
  ]
}
```

Install: Cmd + Shift + P → "Extensions: Show Recommended Extensions"

## 📂 File Structure Quick Reference

```
src/
├── constants/        → Routes, API endpoints, enums
├── types/           → TypeScript interfaces
├── utils/           → Formatters, validators, helpers
├── services/        → API clients (axios, auth, etc.)
├── redux/           → State management (store, slices, sagas)
├── hooks/           → Custom React hooks
├── components/      → UI components (Atomic Design)
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
├── pages/           → Page components
├── styles/          → Theme, global styles
└── App.tsx          → Root component
```

## 🚀 Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/feature-name
```

Naming conventions:

- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Urgent fixes

### 2. Start Development Server

```bash
npm run dev
```

### 3. Make Changes

Follow these guidelines:

- Use Atomic Design pattern for components
- Create TypeScript interfaces for all props
- Use Redux for global state
- Centralize API endpoints
- Use `@` aliases for imports

**Example component:**

```typescript
// src/components/atoms/Button/Button.tsx
import styled from 'styled-components';

interface IButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

const StyledButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
`;

export const Button: React.FC<IButtonProps> = ({
  label,
  onClick,
  disabled = false,
  variant = 'primary',
}) => (
  <StyledButton onClick={onClick} disabled={disabled}>
    {label}
  </StyledButton>
);
```

**Example API service:**

```typescript
// src/services/userService.ts
import api from './api';
import { API_ENDPOINTS } from '@utils/constants';
import type { IUser } from '@types/models';

export const userService = {
  getProfile: (): Promise<IUser> => {
    return api.get(API_ENDPOINTS.USERS.GET_PROFILE);
  },

  updateProfile: (data: Partial<IUser>): Promise<IUser> => {
    return api.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, data);
  },
};
```

### 4. Test Locally

```bash
# Dev server should hot-reload automatically
# Check browser console for errors (F12)
# Check terminal for build warnings
```

### 5. Commit Changes

```bash
git add .
git commit -m "feat: add feature description"
```

Commit message format:

- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring
- `style:` Formatting, no logic change
- `docs:` Documentation
- `test:` Test additions
- `chore:` Build, dependencies

### 6. Push & Create Pull Request

```bash
git push origin feature/feature-name
```

Then create PR on GitHub with description of changes.

## 🔌 Environment Variables

### Development (.env.development)

```
VITE_API_BASE_URL=http://localhost:5000
VITE_API_TIMEOUT=30000
VITE_APP_NAME=Expense Flow
VITE_APP_VERSION=0.1.0
```

### Production (.env.production)

```
VITE_API_BASE_URL=https://api.expenseflow.com
VITE_API_TIMEOUT=30000
VITE_APP_NAME=Expense Flow
VITE_APP_VERSION=0.1.0
```

## 🐛 Debugging

### Redux DevTools

1. Install: `npm install --save-dev redux-devtools-extension`
2. Already configured in `src/redux/store.ts`
3. Download Chrome extension: Redux DevTools
4. Open DevTools (F12) → Redux tab

### TypeScript Errors

```bash
# Check for TypeScript errors without building
npx tsc --noEmit

# Fix common issues:
# 1. Ensure imports use correct aliases (@utils, @services, etc.)
# 2. Add explicit types to functions
# 3. Don't use `any` type
```

### Hot Module Reload Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📊 Project Commands Reference

```bash
# Development
npm run dev          # Start dev server (port 3000)

# Production
npm run build        # Build for production
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Lint code (if configured)

# Other
npm list             # Show installed dependencies
npm outdated         # Check for outdated packages
npm update           # Update dependencies
```

## 🔐 Authentication Flow

1. User enters email/password on Login page
2. authService.login() called
3. API returns accessToken, refreshToken, user
4. Redux action stores tokens in localStorage
5. API interceptor attaches Bearer token to requests
6. On 401, user redirected to login

## 🌐 API Integration

### Making API Calls

```typescript
import { userService } from '@services';

// In component or saga
try {
  const user = await userService.getProfile();
  console.log(user);
} catch (error) {
  console.error('Error:', error);
  // Error message already shown via Ant Design message
}
```

### API Response Handling

```typescript
// Automatic by interceptor:
// ✅ Extract data field
// ✅ Show success message (optional)
// ✅ Show error message (automatic)
// ✅ Handle 401 (auto logout)
// ✅ Handle 500 (generic error)
```

## 📖 Phase 1 Development Order

1. **Auth Module** (Weeks 1-2)

   - Login page
   - Signup page
   - Auth service & Redux

2. **Dashboard** (Week 3)

   - Dashboard layout
   - Summary cards
   - Recent transactions

3. **CRUD Operations** (Weeks 4-6)

   - Transaction management
   - Account management
   - Category management

4. **Reports** (Week 7)
   - Basic reports
   - Charts
   - Export features

## 🆘 Troubleshooting

### Port 3000 Already in Use

```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
npm run dev -- --port 3001
```

### Module Not Found Errors

```bash
# Ensure path aliases are correct:
# ✓ @utils/* → ./src/utils/*
# ✓ @services/* → ./src/services/*
# ✓ @components/* → ./src/components/*
```

### Dependencies Installation Issues

```bash
# Clear npm cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Further Reading

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Ant Design](https://ant.design/components/overview/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Vite Documentation](https://vitejs.dev)
- [Frontend Instructions](../docs/frontend-instrucstion.md)

## ✅ Checklist Before Committing

- [ ] Code follows TypeScript strict mode
- [ ] No `any` types used
- [ ] Components are TypeScript typed
- [ ] API calls use centralized endpoints
- [ ] Redux actions properly namespaced
- [ ] Path aliases used (@utils, @services, etc.)
- [ ] No console.log in production code
- [ ] No commented code
- [ ] Error handling implemented
- [ ] Loading states added

---

Happy coding! 🎉
